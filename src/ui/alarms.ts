/* Alarms: what other chiefs do to you, told wherever you are. Prowlers arriving over your den, blows
 * on your kin, your king falling, shards snatched — each a loud sign naming who did it, with a way to
 * answer. A comic splash marks the big moments (first dig, first forge, king down). And on return,
 * one sign says what changed while you were away. Read from the chain's own events (the RPC feed),
 * so it works with or without GRASS. */
import { h } from '../core/dom';
import { toast } from '../core/dom';
import { live } from '../chain/live';
import { empire, type PlayerState } from '../game/empire';
import { wallet } from '../wallet/wallet';
import { roster } from '../net/roster';
import { txq } from '../wallet/queue';
import { audio } from '../core/audio';
import { beastName, fmtAlpha, shards } from '../lore';

const nameOf = (pid: string) => {
  const p = empire.players.get(pid);
  const n = (p?.name && p.name !== p.playerId ? p.name : roster.get(pid)?.name) || '';
  return n ? n.toUpperCase() : 'A CHIEF';
};
const detail = (data: unknown, key: string) => (data && typeof data === 'object' && key in data ? (data as Record<string, unknown>)[key] : data) as Record<string, unknown> | null;

/** A full-screen comic splash: one big word on a burst, gone in a moment. */
export function splash(word: string, sub = '', tone: 'gold' | 'ember' = 'gold') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { toast(sub ? `${word} · ${sub}` : word, tone === 'gold' ? 'player' : 'enemy', 4000); return; }
  const el = h('div', { class: `splash ${tone}`, role: 'status', 'aria-live': 'assertive' }, h('div', { class: 'splash-burst' }), h('b', null, word), sub ? h('small', null, sub) : null);
  document.body.append(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3800);
}

/* ── the loss log: what was taken from you, by whom, kept until you have seen it ── */
export interface Loss { at: number; text: string; by: string | null }
const lossKey = (pid: string) => `furrency.losses.${pid}`;
const lossL = new Set<() => void>();
export const losses = {
  list(pid: string): Loss[] { try { return JSON.parse(localStorage.getItem(lossKey(pid)) || '[]'); } catch { return []; } },
  add(pid: string, text: string, by: string | null) {
    const l = losses.list(pid);
    // the same news twice in a few seconds is one line
    if (l.length && l[l.length - 1].text === text && Date.now() - l[l.length - 1].at < 20_000) return;
    l.push({ at: Date.now(), text, by }); while (l.length > 12) l.shift();
    try { localStorage.setItem(lossKey(pid), JSON.stringify(l)); } catch { /* memory only */ }
    for (const f of lossL) f();
  },
  seen(pid: string) { try { localStorage.removeItem(lossKey(pid)); } catch { /* fine */ } for (const f of lossL) f(); },
  onChange(f: () => void) { lossL.add(f); return () => { lossL.delete(f); }; },
};

const once = (key: string) => { try { if (localStorage.getItem(key)) return false; localStorage.setItem(key, '1'); return true; } catch { return false; } };

const fellSeen = new Set<string>();

export function startAlarms(go: (path: string) => void) {
  const said = new Map<string, number>();
  const shout = (key: string, text: string, kind: 'enemy' | 'warn' | 'player', act?: { label: string; run: () => void }, ms = 8000) => {
    const now = Date.now();
    if ((said.get(key) || 0) > now - 15_000) return;
    said.set(key, now);
    toast(text, kind, ms, act);
  };

  live.onTx((tx) => {
    const me = empire.commander;
    if (!me) return;
    for (const e of tx.events) {
      if (e.type === 'EventAttack') {
        const d = detail(e.data, 'eventAttackDetail');
        const attacker = String(d?.attackerPlayerId || '');
        if (!attacker || attacker === me.playerId) continue;
        for (const s of (d?.eventAttackShotDetail as Record<string, unknown>[]) || []) {
          const tid = String(s.targetStructId || '');
          const mine = me.structs.get(tid);
          if (!mine) continue;
          const isKing = me.fleet?.commandStruct === tid;
          if (s.targetDestroyed === true || s.targetDestroyed === 'true') {
            if (isKing) { splash('YOUR KING FELL', `BY ${nameOf(attacker)}`, 'ember'); audio.thud(); shout('kingdown', `YOUR KING FELL · ${nameOf(attacker)}`, 'enemy', { label: 'FIGHT', run: () => go(`#/prowl/${attacker}`) }, 30000); losses.add(me.playerId, 'KING FELL', attacker); }
            else { shout(`fell:${tid}`, `YOUR ${beastName(mine.typeId)} FELL · ${nameOf(attacker)}`, 'enemy', { label: 'FIGHT', run: () => go(`#/prowl/${attacker}`) }, 20000); losses.add(me.playerId, `${beastName(mine.typeId)} FELL`, attacker); }
            fellSeen.add(tid);
          } else shout(`hit:${attacker}`, `POUNCED · ${nameOf(attacker)}`, 'enemy', { label: 'FIGHT', run: () => go(`#/prowl/${attacker}`) }, 20000);
        }
      }
      if (e.type === 'EventOreTheft') {
        const d = detail(e.data, 'eventOreTheftDetail');
        if (d?.victimPlayerId === me.playerId) {
          const n = Number(d.amount || 0), by = String(d.thiefPlayerId || '');
          if (n > 0) {
            splash('SNATCHED!', `−${shards(n)} · ${nameOf(by)}`, 'ember');
            audio.thud();
            shout('theft', `−${shards(n)} · ${nameOf(by)}`, 'enemy', { label: 'FIGHT', run: () => go(`#/prowl/${by}`) }, 30000);
            losses.add(me.playerId, `−${shards(n)}`, by || null);
          }
        }
      }
      if (e.type === 'EventRaid') {
        const d = detail(e.data, 'eventRaidDetail');
        if (d?.planetId === me.planetId && d?.fleetId && d.fleetId !== me.fleetId) {
          const owner = [...empire.players.values()].find((p) => p.fleetId === d.fleetId)?.playerId || roster.roster?.chiefs.find((c) => c.fleetId === d.fleetId)?.id;
          shout('prowlers', `PROWLERS! · ${owner ? nameOf(owner) : 'AT YOUR DEN'}`, 'enemy', owner ? { label: 'DEFEND', run: () => go(`#/prowl/${owner}`) } : { label: 'DEN', run: () => go('#/den') }, 30000);
          losses.add(me.playerId, 'PROWLED', owner || null);
          audio.zap();
        }
      }
    }
  });

  /* firsts, from the deeds that land */
  return {
    landed(kind: 'dig' | 'forge', playerId: string) {
      if (kind === 'dig' && once(`furrency.first.dig.${playerId}`)) splash('FIRST SHARD!', 'NOW FORGE IT', 'gold');
      if (kind === 'forge' && once(`furrency.first.forge.${playerId}`)) splash('FIRST ALPHA!', 'SAFE FOREVER', 'gold');
    },
  };
}

/* ── while you were away ─────────────────────────────────────────── */

interface Snap { at: number; alpha: string; ore: number; kin: string[]; king: boolean }
const snapKey = (pid: string) => `furrency.away.${pid}`;
const take = (p: PlayerState): Snap => ({ at: Date.now(), alpha: p.alpha.toString(), ore: p.ore, kin: [...p.structs.values()].filter((s) => !s.destroyed && s.built).map((s) => s.id), king: [...p.structs.values()].some((s) => s.typeId === 1 && !s.destroyed) });

export function watchAway() {
  let told = '';
  let saved = 0;
  let prev: { pid: string; kin: Map<string, number> } | null = null;
  empire.onChange(() => {
    const p = empire.commander;
    if (!p || !wallet.unlocked) return;
    // a kin gone between two reads, with no blow heard and not released by us: say so
    const kin = new Map([...p.structs.values()].filter((s) => !s.destroyed && s.built).map((s) => [s.id, s.typeId] as [string, number]));
    if (prev && prev.pid === p.playerId) {
      for (const [id, type] of prev.kin) {
        if (kin.has(id) || fellSeen.has(id)) continue;
        const released = txq.jobs.some((j) => j.msgs.some((m) => /MsgStructTrash$/.test(m.typeUrl) && (m.value as { structId?: string }).structId === id));
        if (released) continue;
        fellSeen.add(id);
        losses.add(p.playerId, `${beastName(type)} LOST`, null);
        toast(`YOUR ${beastName(type)} LOST`, 'enemy', 20000);
      }
    }
    prev = { pid: p.playerId, kin };
    if (told !== p.playerId) {
      told = p.playerId;
      let was: Snap | null = null;
      try { was = JSON.parse(localStorage.getItem(snapKey(p.playerId)) || 'null'); } catch { was = null; }
      if (was && Date.now() - was.at > 2 * 60_000) {
        const now = take(p), bits: string[] = [];
        const da = BigInt(now.alpha) - BigInt(was.alpha);
        if (da > 0n) bits.push(`+${fmtAlpha(da)} α`);
        if (da < 0n) bits.push(`−${fmtAlpha(-da)} α`);
        if (now.ore !== was.ore) bits.push(`${now.ore > was.ore ? '+' : '−'}${shards(Math.abs(now.ore - was.ore))}`);
        const lost = was.kin.filter((id) => !now.kin.includes(id) && !fellSeen.has(id)).length;
        if (lost) losses.add(p.playerId, `−${lost} KIN`, null);
        if (lost) bits.push(`−${lost} KIN`);
        if (was.king && !now.king) bits.push('KING DOWN');
        if (bits.length) toast(`AWAY · ${bits.join(' · ')}`, lost || !now.king ? 'warn' : 'player', 12000);
      }
    }
    if (Date.now() - saved > 20_000) { saved = Date.now(); try { localStorage.setItem(snapKey(p.playerId), JSON.stringify(take(p))); } catch { /* fine */ } }
  });
}
