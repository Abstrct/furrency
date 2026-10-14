/* The network roster: every chief with a den, their clan, their shards in store and their last move.
 * Painted first from this browser's cache (IndexedDB), then read again — from the clan's indexer
 * when signed in (three bulk pages), else from the chain node (every player plus a grid scan) — and
 * kept live between reads by GRASS: a chief's ore or last move changing on the feed patches the
 * roster in place, so the hunt map glows the moment someone digs or forges. */
import { cache } from '../cache/idb';
import { lcd, type RawPlayer } from '../chain/lcd';
import { omenSight } from '../realm';
import { grass, type GrassEvent } from '../grass/grass';
import { allChiefs, playerGrid } from './clan';
import { safeEach } from '../core/util';

export interface Chief { id: string; name: string; guildId: string; planetId: string; fleetId: string; address: string; ore: number; lastAction: number }
export interface Roster { at: number; source: 'clan' | 'chain' | 'cache'; chiefs: Chief[] }

const KEY = 'hunt-roster';
const NS = 'roster';
const FRESH_MS = 60_000;

class RosterStore {
  roster: Roster | null = null;
  private byId = new Map<string, Chief>();
  private listeners = new Set<(r: Roster) => void>();
  private loading: Promise<Roster> | null = null;
  private grassOff: (() => void) | null = null;

  onChange(f: (r: Roster) => void) { this.listeners.add(f); if (this.roster) f(this.roster); this.follow(); return () => { this.listeners.delete(f); }; }
  private emit() { if (this.roster) safeEach(this.listeners, (f) => f(this.roster!)); }
  get(id: string) { return this.byId.get(id); }

  private take(r: Roster) {
    this.roster = r;
    this.byId = new Map(r.chiefs.map((c) => [c.id, c]));
    this.emit();
  }

  /** The cached roster at once (if any), then a fresh one. */
  async load(force = false): Promise<Roster> {
    if (!this.roster) {
      const e = await cache.entry<Roster>(KEY, NS).catch(() => null);
      if (e?.v?.chiefs?.length) this.take({ ...e.v, source: 'cache' });
    }
    if (!force && this.roster && this.roster.source !== 'cache' && Date.now() - this.roster.at < FRESH_MS) return this.roster;
    if (!this.loading) this.loading = this.read().finally(() => { this.loading = null; });
    return this.loading;
  }

  private async read(): Promise<Roster> {
    const r = (await this.fromClan().catch(() => null)) || (await this.fromChain());
    this.take(r);
    void cache.set(KEY, r, 7 * 86_400_000, NS).catch(() => { /* memory only */ });
    return r;
  }

  private async fromClan(): Promise<Roster | null> {
    const [chiefs, ore, last] = await Promise.all([allChiefs(), playerGrid('ore'), playerGrid('lastAction')]);
    if (!chiefs || !chiefs.length) return null;
    return {
      at: Date.now(), source: 'clan',
      chiefs: chiefs.filter((c) => c.planetId).map((c) => ({ ...c, ore: ore?.get(c.id) ?? 0, lastAction: last?.get(c.id) ?? 0 })),
    };
  }

  private async fromChain(): Promise<Roster> {
    const [players, sight] = await Promise.all([lcd.list<RawPlayer>('player', 'Player'), omenSight().catch(() => new Map())]);
    return {
      at: Date.now(), source: 'chain',
      chiefs: players.filter((p) => p.planetId).map((p) => ({
        id: p.id, name: p.name || '', guildId: p.guildId || '', planetId: p.planetId, fleetId: p.fleetId, address: p.primaryAddress,
        ore: sight.get(p.id)?.ore ?? 0, lastAction: sight.get(p.id)?.lastAction ?? 0,
      })),
    };
  }

  /** GRASS: grid changes of players patch the roster live. */
  private follow() {
    if (this.grassOff) return;
    let dirty = 0;
    this.grassOff = grass.on({ kind: 'grid', category: ['ore', 'lastAction'] }, (e: GrassEvent) => {
      const id = e.objectId && /^1-\d+$/.test(e.objectId) ? e.objectId : null;
      const c = id ? this.byId.get(id) : undefined;
      if (!c) return;
      const v = Number(e.data.value ?? 0) || 0;
      if (e.category === 'ore') c.ore = v; else c.lastAction = v;
      // many grid ticks arrive together: tell the listeners once a moment
      if (!dirty) dirty = window.setTimeout(() => { dirty = 0; this.emit(); }, 400);
    });
  }
}

export const roster = new RosterStore();
