/* The clan link: the Guild API of the chief's home clan, used first wherever it answers better than
 * the chain node — one call for a chief's whole pack instead of one per struct, the whole network's
 * chiefs and their shards in a page or two instead of scanning every grid record.
 *
 * Every data route of a Guild API wants a signed-in session (a cookie). The paw signs the clan's
 * login message (LOGIN_GUILD…ADDRESS…DATETIME…); a 401 later signs in again once.
 * - Direct (the default, a plain static site): the page signs in to the clan itself with credentialed
 *   requests. That holds only where the browser keeps the clan's cookie for this page — the clan
 *   answers with this origin and Allow-Credentials (the live ones do), and its cookie may travel
 *   cross-site (SameSite=None) or the page is served on the clan's own site. The link proves the
 *   session with a members-only read before trusting it.
 * - Relayed (dev, or a page built with VITE_RELAY_URL): the relay keeps one cookie jar per browser.
 * Without a session, or when the clan's indexer lags the chain, every caller falls back to the chain
 * node (LCD): the link only ever makes things faster, never wrong. */
import { guildApi, buildLoginRequest, GuildApiError, type GuildApi, type StructRow, type WorkRow, type Num } from '../guild/api';
import { holdSession } from '../guild/transport';
import { RELAY_BASE } from '../guild/relay';
import { wallet } from '../wallet/wallet';
import { lcd } from '../chain/lcd';
import { live } from '../chain/live';
import { safeEach } from '../core/util';

export type LinkState = 'off' | 'signing' | 'on' | 'failed';

const ENV = (import.meta as { env?: Record<string, string | undefined> }).env || {};
/** "off" keeps the client on the chain node alone. */
const DISABLED = ENV.VITE_GUILD_DATA === 'off';
/** The clan's indexer may trail the chain by this many blocks and still be trusted for a chief's pack. */
const MAX_LAG = 4;

class ClanLink {
  state: LinkState = 'off';
  guildId: string | null = null;
  /** Why the link is off, for the curious (shown as a tooltip). */
  why = '';
  /** The indexer's lag behind the chain, from /api/block (blocks; -1 unknown). */
  lag = -1;
  private api: GuildApi | null = null;
  private signing: Promise<boolean> | null = null;
  private failedAt = 0;

  private listeners = new Set<(s: LinkState) => void>();

  constructor() {
    if (typeof window === 'undefined') return;
    // a different chief (or none) means a different session
    wallet.onChange(() => { const g = this.guildId; if (g && !wallet.active?.playerId) this.set('off', 'no chief'); });
  }

  get usable() { return !DISABLED; }
  /** Through the relay, or straight to the clan. */
  get mode(): 'relay' | 'direct' { return RELAY_BASE !== null ? 'relay' : 'direct'; }
  onChange(f: (s: LinkState) => void) { this.listeners.add(f); f(this.state); return () => this.listeners.delete(f); }
  private set(s: LinkState, why = '') { this.state = s; this.why = why; safeEach(this.listeners, (f) => f(s)); }

  /** The signed-in Guild API of the active chief's clan, or null (use the chain node). */
  async ready(): Promise<GuildApi | null> {
    if (!this.usable) { if (this.state !== 'off') this.set('off', 'no relay'); return null; }
    const acct = wallet.active;
    if (!acct?.playerId || !wallet.unlocked) return null;
    if (this.state === 'on' && this.api) return this.api;
    if (this.state === 'failed' && Date.now() - this.failedAt < (this.mode === 'direct' ? 600_000 : 120_000)) return null;
    if (!this.signing) this.signing = this.signIn().finally(() => { this.signing = null; });
    return (await this.signing) ? this.api : null;
  }

  private async signIn(): Promise<boolean> {
    const acct = wallet.active;
    if (!acct?.playerId) return false;
    this.set('signing');
    try {
      const gid = this.guildId && this.state === 'on' ? this.guildId : (await lcd.player(acct.playerId)).Player.guildId;
      if (!gid) throw new Error('no clan');
      const api = guildApi(gid);
      const direct = this.mode === 'direct';
      if (direct) holdSession(gid, true);
      const ts = (await api.timestamp()).unix_timestamp;
      const req = buildLoginRequest(gid, acct.address, ts, (m) => wallet.signMessage(acct.index, m));
      await api.call('auth/login', { method: 'POST', body: JSON.stringify(req), headers: { 'content-type': 'application/json' } });
      // Direct, the browser may have dropped the cookie (SameSite, third-party cookie rules): prove it.
      if (direct) {
        try { await api.block(); }
        catch (e) { holdSession(gid, false); throw new Error(e instanceof GuildApiError && e.status === 401 ? 'the browser kept no clan session for this site' : (e as Error).message); }
      }
      this.api = api; this.guildId = gid;
      this.set('on');
      return true;
    } catch (e) {
      this.failedAt = Date.now();
      this.set('failed', (e as Error).message);
      console.info('[clan] staying on the chain node:', (e as Error).message);
      return false;
    }
  }

  /** Run a Guild API read; a lapsed session signs in once more. Null means "ask the chain instead". */
  async read<T>(fn: (api: GuildApi) => Promise<T>): Promise<T | null> {
    const api = await this.ready();
    if (!api) return null;
    try { return await fn(api); } catch (e) {
      if (e instanceof GuildApiError && e.status === 401) {
        this.state = 'off';
        const again = await this.ready();
        if (!again) return null;
        try { return await fn(again); } catch { return null; }
      }
      return null;
    }
  }

  /** Is the clan's indexer close enough to the chain tip to trust for live game state? */
  async fresh(): Promise<boolean> {
    // a known answer (good or bad) holds a while; an indexer that can't say holds longer
    if (Date.now() < this.lagUntil) return this.lag >= 0 && this.lag <= MAX_LAG;
    if (this.lagAsk) return this.lagAsk;
    this.lagAsk = this.askLag().finally(() => { this.lagAsk = null; });
    return this.lagAsk;
  }
  private lagUntil = 0;
  private lagAsk: Promise<boolean> | null = null;
  private async askLag(): Promise<boolean> {
    const b = await this.read((api) => api.block());

    if (!b) { this.lag = -1; this.lagUntil = Date.now() + 120_000; return false; }
    this.lagUntil = Date.now() + 15_000;
    // the indexer's own view of the tip may itself trail the chain: compare with the live feed too
    const tip = Math.max(Number(b.tip_height) || 0, live.height || 0);
    this.lag = Math.max(0, tip - (Number(b.height) || 0));
    return this.lag <= MAX_LAG;
  }
}

export const clan = new ClanLink();

/* ── Reads used by the game ────────────────────────────────────────────── */

const n = (v: Num | null | undefined) => (v == null || v === '' ? 0 : Number(v));

export interface PackRow {
  id: string; typeId: number; locationType: string; locationId: string; ambit: string; slot: number;
  health: number; status: number; destroyed: boolean; protectedStructId: string | null; defenders: string[];
  blockStartBuild: number; blockStartOreMine: number; blockStartOreRefine: number;
}

/** Every struct of a chief in one call, with the work it owes (build / mine / refine starts), or null. */
export async function packOf(playerId: string): Promise<PackRow[] | null> {
  if (!clan.usable) return null;
  if (!(await clan.fresh())) return null;
  return clan.read(async (api) => {
    const [rows, work] = await Promise.all([api.structsOf(playerId), api.workOf(playerId).catch(() => [] as WorkRow[])]);
    const start = new Map<string, number>();
    for (const w of work || []) start.set(`${w.category}:${w.object_id}`, Number(w.block_start) || 0);
    return (rows || []).map((r: StructRow): PackRow => ({
      id: r.id, typeId: Number(r.type), locationType: r.location_type, locationId: r.location_id, ambit: r.operating_ambit, slot: Number(r.slot) || 0,
      health: n(r.health), status: n(r.status), destroyed: !!r.is_destroyed || !!(n(r.status) & 32),
      protectedStructId: r.protected_struct_id || null, defenders: idList(r.defending_struct_ids),
      blockStartBuild: start.get(`BUILD:${r.id}`) || 0, blockStartOreMine: start.get(`MINE:${r.id}`) || 0, blockStartOreRefine: start.get(`REFINE:${r.id}`) || 0,
    }));
  });
}

/** "{5-1,5-2}", '["5-1"]', "5-1,5-2" or an array → ids. */
function idList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v !== 'string' || !v) return [];
  try { const j = JSON.parse(v); if (Array.isArray(j)) return j.map(String).filter(Boolean); } catch { /* not JSON */ }
  return v.replace(/[{}[\]"]/g, '').split(',').map((s) => s.trim()).filter((s) => /^\d+-\d+$/.test(s));
}

export interface ChiefRow { id: string; name: string; guildId: string; planetId: string; fleetId: string; address: string }
/** Every chief on the network (the clan indexer sees the whole chain), or null. */
export async function allChiefs(): Promise<ChiefRow[] | null> {
  return clan.read(async (api) => {
    const rows = await api.all<Record<string, unknown>>('player/list/all', { limit: 10_000 }, 50_000);
    return rows.map((r) => ({ id: String(r.id), name: String(r.username ?? r.name ?? ''), guildId: String(r.guild_id ?? ''), planetId: String(r.planet_id ?? ''), fleetId: String(r.fleet_id ?? ''), address: String(r.primary_address ?? '') }));
  });
}

/** One grid attribute for every player at once ("ore", "lastAction"), keyed by player id, or null. */
export async function playerGrid(attribute: 'ore' | 'lastAction'): Promise<Map<string, number> | null> {
  return clan.read(async (api) => {
    const rows = await api.all<Record<string, unknown>>(`grid/attribute-type/${attribute}/object-type/player`, { limit: 10_000 }, 50_000);
    const out = new Map<string, number>();
    for (const r of rows) {
      const id = String(r.object_id ?? '');
      if (/^1-\d+$/.test(id)) out.set(id, Number(r.val ?? 0) || 0);
    }
    return out;
  });
}

/** Names for chiefs (usernames live in the clan's database, not always on chain). */
export async function chiefNames(ids: string[]): Promise<Map<string, string> | null> {
  if (!ids.length) return new Map();
  return clan.read(async (api) => {
    const out = new Map<string, string>();
    for (let i = 0; i < ids.length; i += 200) {
      const rows = await api.objects(ids.slice(i, i + 200));
      for (const r of rows || []) { const o = r.object as Record<string, unknown>; const nm = o?.username ?? o?.name; if (nm) out.set(r.id, String(nm)); }
    }
    return out;
  });
}
