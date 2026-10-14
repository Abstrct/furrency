/* The playtest probe: a read-only window into the game for the playtest lab (qa/lab.mjs) and its
 * testers. It names what is on screen — including the things drawn on canvas, which no DOM query
 * can see — and summarises the chief's state, the deeds in flight and the howl engine. It never
 * acts: testers act through real input. On in dev, or with ?probe / localStorage furrency.probe=1. */
import { empire } from '../game/empire';
import { txq } from '../wallet/queue';
import { pow } from '../pow/pow';
import { live } from '../chain/live';
import { wallet } from '../wallet/wallet';
import { grass } from '../grass/grass';
import { clan } from '../net/clan';
import { roster } from '../net/roster';
import { beastName, REALM_NAME, REALM_OF_AMBIT } from '../lore';

interface Target { id: string; label: string; kind: 'kin' | 'their-kin' | 'slot' | 'den' | 'other'; x: number; y: number; r: number }

function nameFor(id: string): { label: string; kind: Target['kind'] } {
  if (id.startsWith('free:')) { const [, zone, k] = id.split(':'); return { label: `EMPTY ${zone.toUpperCase()} ${k === 'p' ? 'TOTEM' : 'PACK'} SLOT (CALL)`, kind: 'slot' }; }
  for (const p of empire.players.values()) {
    const s = p.structs.get(id);
    if (s) return { label: `${beastName(s.typeId)}${p === empire.commander ? '' : ` (${(p.name || p.playerId).toUpperCase()})`}`, kind: p === empire.commander ? 'kin' : 'their-kin' };
  }
  if (/^1-\d+$/.test(id)) { const c = roster.get(id); return { label: `DEN OF ${(c?.name || id).toUpperCase()}`, kind: 'den' }; }
  return { label: id, kind: 'other' };
}

function targets(): Target[] {
  const out: Target[] = [];
  for (const c of document.querySelectorAll('canvas.stage')) {
    const hits = (c as unknown as { __hits?: { id: string; x: number; y: number; r: number }[] }).__hits || [];
    const r = c.getBoundingClientRect();
    for (const h of hits) { const n = nameFor(h.id); out.push({ id: h.id, ...n, x: Math.round(r.left + h.x), y: Math.round(r.top + h.y), r: Math.round(h.r) }); }
  }
  return out;
}

function state() {
  const p = empire.commander;
  return {
    route: location.hash || '#/',
    height: live.height, link: live.state, grass: grass.state, clan: clan.state, source: empire.source,
    paw: wallet.state, chief: wallet.active?.playerId || null, chiefName: wallet.active?.label || null,
    me: p ? {
      playerId: p.playerId, guild: p.guildId, planet: p.planetId, alpha: Number(p.alpha) / 1e6, shards: p.ore,
      glowSpare: Number(p.capacity + p.connectionCapacity - p.load - p.structsLoad) / 1000, pulse: empire.charge(p), online: p.online,
      pack: p.fleet?.status === 'away' ? `AWAY at ${p.fleet.locationId}` : 'HOME',
      kin: [...p.structs.values()].filter((s) => !s.destroyed && s.type).map((s) => ({
        id: s.id, name: beastName(s.typeId), zone: s.type!.category === 'planet' ? 'TOTEM' : REALM_NAME[REALM_OF_AMBIT[s.ambit as 'land']] || s.ambit,
        state: !s.built ? 'CALLING' : !s.online ? 'NAP' : s.hidden ? 'HIDDEN' : 'AWAKE', fur: `${s.health}/${s.type!.maxHealth}`,
      })),
    } : null,
    deeds: txq.jobs.slice(-8).map((j) => ({ label: j.label, status: j.status, error: j.error || j.waitReason || undefined })),
    howl: pow.active.map((t) => ({ what: t.label, have: t.best?.zeros ?? 0, need: pow.required(t), status: t.status, waits: t.waits })),
  };
}

export function installProbe() {
  (window as unknown as { __fur: unknown }).__fur = { state, targets, version: 1 };
}
