/* Game verbs: every struct, fleet and planet action as one call that checks what it can,
 * names itself in Furrency words, prices its pulse and queues the transaction. Every screen acts
 * through here. */
import { txq, type TxJob } from '../wallet/queue';
import { wallet } from '../wallet/wallet';
import { empire, type OwnedStruct, type PlayerState } from './empire';
import { typeOf, type StructType, type WeaponSystem } from '../data/catalogue';
import { beastName, fmtMana, shards } from '../lore';

const M = (name: string, value: Record<string, unknown>) => ({ typeUrl: `/structs.structs.${name}`, value });
const ZONE: Record<string, string> = { space: 'STAR', air: 'SKY', land: 'ROOT', water: 'TIDE' };

export interface Verb { id: string; label: string; cost: number; hint: string; danger?: boolean; run: () => TxJob }

function q(p: PlayerState, name: string, value: Record<string, unknown>, label: string, cost?: number, source = 'you'): TxJob {
  return txq.enqueue(M(name, value), {
    account: p.account, playerId: p.playerId, label, source,
    lane: cost != null ? 'action' : 'immediate', chargeCost: cost,
  });
}

export const act = {
  build(p: PlayerState, t: StructType, ambit: string, slot: number, source?: string) {
    return q(p, 'MsgStructBuildInitiate', { playerId: p.playerId, structTypeId: t.id, operatingAmbit: ambit, slot }, `CALL · ${beastName(t.id)}`, t.buildCharge, source);
  },
  cancelBuild: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructBuildCancel', { structId: s.id }, `STOP · ${name(s)}`),
  activate: (p: PlayerState, s: OwnedStruct, source?: string) => q(p, 'MsgStructActivate', { structId: s.id }, `WAKE · ${name(s)}`, s.type?.activateCharge ?? 0, source),
  deactivate: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructDeactivate', { structId: s.id }, `NAP · ${name(s)}`),
  stealthOn: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructStealthActivate', { structId: s.id }, `HIDE · ${name(s)}`, s.type?.stealthActivateCharge ?? 0),
  stealthOff: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructStealthDeactivate', { structId: s.id }, `SHOW · ${name(s)}`, s.type?.stealthActivateCharge ?? 0),
  defend: (p: PlayerState, s: OwnedStruct, protectedId: string, source?: string) => q(p, 'MsgStructDefenseSet', { defenderStructId: s.id, protectedStructId: protectedId }, `GUARD · ${name(s)} → ${nameOf(protectedId)}`, s.type?.defendChangeCharge ?? 0, source),
  clearDefense: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructDefenseClear', { defenderStructId: s.id }, `FREE · ${name(s)}`, s.type?.defendChangeCharge ?? 0),
  move: (p: PlayerState, s: OwnedStruct, locationType: 'planet' | 'fleet', ambit: string, slot: number) =>
    q(p, 'MsgStructMove', { structId: s.id, locationType, ambit, slot }, `LEAP · ${name(s)} → ${ZONE[ambit] || ambit}`, s.type?.moveCharge ?? 0),
  attack(p: PlayerState, s: OwnedStruct, targets: string[], weapon: WeaponSystem, source?: string) {
    const t = s.type!;
    const cost = weapon === 'primaryWeapon' ? t.primaryWeaponCharge : t.secondaryWeaponCharge;
    return q(p, 'MsgStructAttack', { operatingStructId: s.id, targetStructId: targets, weaponSystem: weapon }, `POUNCE · ${name(s)} → ${targets.map(whoseOf).join(' + ')}`, cost, source);
  },
  infuseGenerator: (p: PlayerState, s: OwnedStruct, ualpha: bigint) => q(p, 'MsgStructGeneratorInfuse', { structId: s.id, infuseAmount: `${ualpha}ualpha` }, `FEED · ${Number(ualpha) / 1e6} α → ${name(s)}`),
  trash: (p: PlayerState, s: OwnedStruct) => q(p, 'MsgStructTrash', { structId: s.id }, `RELEASE · ${name(s)}`, s.type?.buildCharge ?? 8),
  fleetMove: (p: PlayerState, destination: string, source?: string) => q(p, 'MsgFleetMove', { fleetId: p.fleetId, destinationLocationId: destination }, destination === p.planetId ? 'PACK · HOME' : `PROWL · ${denOf(destination)}`, undefined, source),
  explore: (p: PlayerState, source?: string) => q(p, 'MsgPlanetExplore', { playerId: p.playerId }, p.planetId ? 'ROAM · NEW DEN' : 'ROAM · FIRST DEN', undefined, source),
  renamePlanet: (p: PlayerState, nm: string) => q(p, 'MsgPlanetUpdateName', { planetId: p.planetId, name: nm }, `NAME DEN · ${nm.toUpperCase()}`),
  renamePlayer: (p: PlayerState, nm: string) => q(p, 'MsgPlayerUpdateName', { playerId: p.playerId, name: nm }, `NAME · ${nm.toUpperCase()}`),
  setPortrait: (p: PlayerState, attrs: Record<string, number>, source?: string) => q(p, 'MsgPlayerUpdatePfpClientRenderAttributes', { playerId: p.playerId, pfpClientRenderAttributes: JSON.stringify(attrs) }, 'NEW FACE', undefined, source),
  send: (p: PlayerState, to: string, ualpha: bigint, source?: string) => q(p, 'MsgPlayerSend', { from_address: p.address, to_address: to, amount: [{ denom: 'ualpha', amount: ualpha.toString() }] }, `SEND · ${Number(ualpha) / 1e6} α`, undefined, source),
};

/** Why the chain would refuse a build for this player right now (BuildInitiateReadiness and
 * MsgStructBuildInitiate in v0.21), or null when it would take it. */
export function buildBlock(p: PlayerState, t?: StructType): string | null {
  if (!p.online) return 'LOW GLOW';
  const f = p.fleet;
  if (!f || f.status === 'away') return 'PACK AWAY';
  const cmd = f.commandStruct ? p.structs.get(f.commandStruct) : undefined;
  if (!cmd || cmd.destroyed) return 'NO KING';
  if (!cmd.online) return 'KING NAPS';
  if (t && p.load + p.structsLoad + BigInt(t.buildDraw) > p.capacity + p.connectionCapacity) return `LOW GLOW · ${formatDraw(t.buildDraw)}`;
  return null;
}

/** Why struct actions (attack, guard, move, stealth, activate) would be refused for the player, or null. */
export const actionBlock = (p: PlayerState): string | null => (p.online ? null : 'LOW GLOW');

/** Slots a queued build or move is already headed for ("planet:land:0"): don't offer them twice. */
export function reservedSlots(playerId: string): Set<string> {
  const out = new Set<string>();
  for (const j of txq.active) {
    if (j.playerId !== playerId) continue;
    for (const m of j.msgs) {
      const v = m.value as Record<string, unknown>;
      if (m.typeUrl.endsWith('MsgStructBuildInitiate')) out.add(`${typeOf(Number(v.structTypeId))?.category}:${v.operatingAmbit}:${v.slot}`);
      // The king changes zone without taking a slot.
      if (m.typeUrl.endsWith('MsgStructMove') && empire.players.get(playerId)?.structs.get(String(v.structId))?.typeId !== 1) out.add(`${v.locationType}:${v.ambit}:${v.slot}`);
    }
  }
  return out;
}

/** Roaming to a new den completes the old one. The chain allows it only once its ground is dug out and
 * the pack is home (msg_server_planet_explore.go, AttemptComplete), and then destroys every totem on
 * it; the pack, the shards in store and the alpha go with the chief. So it is always asked. */
export async function exploreConfirmed(p: PlayerState, source?: string): Promise<TxJob | null> {
  if (!p.planetId) return act.explore(p, source);
  if (!p.planet) throw new Error('READING');
  const { confirmBox } = await import('../core/dom');
  const ground = Number(p.planet.gridAttributes?.ore || 0);
  if (ground > 0) {
    await confirmBox('DEN NOT EMPTY', [`${shards(ground)} LEFT`, 'DIG FIRST'], null, 'player', { stay: 'OK' });
    return null;
  }
  if (p.fleet?.status === 'away') {
    await confirmBox('PACK AWAY', ['PACK · HOME FIRST'], null, 'player', { stay: 'OK' });
    return null;
  }
  const lost = totemsOn(p);
  const ok = await confirmBox('ROAM?', [
    'OLD DEN · GONE',
    lost.length ? `LOST · ${lost.join(' · ')}` : 'LOST · NONE',
    `KEEP · PACK${p.ore ? ` · ${shards(p.ore)}` : ''} · ALPHA`,
  ], 'ROAM', 'enemy', { stay: 'STAY', safeFirst: true });
  return ok ? act.explore(p, source) : null;
}

/** The totems standing (or being called) on a chief's den, named and counted. */
function totemsOn(p: PlayerState): string[] {
  const count = new Map<string, number>();
  for (const s of p.structs.values()) {
    if (s.destroyed || s.type?.category !== 'planet' || s.locationId !== p.planetId) continue;
    const nm = beastName(s.typeId);
    count.set(nm, (count.get(nm) || 0) + 1);
  }
  return [...count].map(([nm, n]) => (n > 1 ? `${n}× ${nm}` : nm));
}

/** "Again" is for a refusal just heard. Minutes later the den has moved on (another prowler took the
 * shards, a beast fell), and an old deed sent blind can do harm. So it is offered only for a little
 * while, and only while the deed still makes sense. */
export const AGAIN_MS = 2 * 60_000;
export function canRetry(j: TxJob, now = Date.now()): boolean {
  if (j.status !== 'failed' || now - j.updatedAt > AGAIN_MS) return false;
  if (j.playerId && !wallet.byPlayer(j.playerId)) return false;
  const p = j.playerId ? empire.players.get(j.playerId) : undefined;
  for (const m of j.msgs) {
    const v = m.value as Record<string, unknown>;
    const named = [v.structId, v.operatingStructId, v.defenderStructId, v.protectedStructId, ...(Array.isArray(v.targetStructId) ? v.targetStructId : [])];
    if (named.some((id) => typeof id === 'string' && fallen(id))) return false;
    if (m.typeUrl.endsWith('MsgFleetMove') && p?.fleet && p.fleet.locationId === v.destinationLocationId) return false;
    if (m.typeUrl.endsWith('MsgPlanetExplore') && p?.planetId) return false;
  }
  return true;
}
function fallen(id: string) { for (const pl of empire.players.values()) { const s = pl.structs.get(id); if (s) return s.destroyed; } return false; }

/** A struct's name in labels: its kind, never its chain id. */
export const name = (s: OwnedStruct) => beastName(s.typeId);
function nameOf(id: string) { for (const pl of empire.players.values()) { const s = pl.structs.get(id); if (s?.type) return beastName(s.typeId); } return 'KIN'; }
/** A struct with its chief ("KESTRA·STAR BEAR"), so a clash between two of a kind says whose is whose. */
function whoseOf(id: string) {
  for (const pl of empire.players.values()) { const s = pl.structs.get(id); if (s?.type) return `${chiefName(pl)}·${beastName(s.typeId)}`; }
  return 'KIN';
}
function chiefName(pl: PlayerState) { return (pl.name && pl.name !== pl.playerId ? pl.name : `CHIEF ${pl.playerId.split('-')[1] || pl.playerId}`).toUpperCase(); }
function denOf(planetId: string) { for (const pl of empire.players.values()) if (pl.planetId === planetId) return `${chiefName(pl)} DEN`; return 'FAR DEN'; }

/** What a struct can do right now (and what each costs). */
export function verbsFor(p: PlayerState, s: OwnedStruct): Verb[] {
  const t = s.type;
  if (!t || s.destroyed) return [];
  const v: Verb[] = [];
  if (!s.built) {
    v.push({ id: 'cancel', label: 'STOP', cost: 0, hint: 'STOP CALL', danger: true, run: () => act.cancelBuild(p, s) });
    return v;
  }
  if (s.online) v.push({ id: 'off', label: 'NAP', cost: 0, hint: `+${formatDraw(t.passiveDraw)}`, run: () => act.deactivate(p, s) });
  else v.push({ id: 'on', label: 'WAKE', cost: t.activateCharge, hint: `−${formatDraw(t.passiveDraw)}`, run: () => act.activate(p, s) });
  if (t.stealthSystems) {
    if (s.hidden) v.push({ id: 'unstealth', label: 'SHOW', cost: t.stealthActivateCharge, hint: 'SEEN', run: () => act.stealthOff(p, s) });
    else v.push({ id: 'stealth', label: 'HIDE', cost: t.stealthActivateCharge, hint: 'UNSEEN', run: () => act.stealthOn(p, s) });
  }
  if (s.protectedStructIndex) v.push({ id: 'undefend', label: 'FREE', cost: t.defendChangeCharge, hint: 'STOP GUARD', run: () => act.clearDefense(p, s) });
  return v;
}

export function formatDraw(mw: number) { return `${fmtMana(mw)} GLOW`; }

/** Struct types buildable in a slot of this kind and ambit. */
export function buildable(where: 'planet' | 'fleet', ambit: string): StructType[] {
  const flag: Record<string, number> = { water: 2, land: 4, air: 8, space: 16 };
  const out: StructType[] = [];
  for (let id = 1; id < 64; id++) {
    const t = typeOf(id);
    if (!t || t.category !== where || id === 1) continue;
    if (t.possibleAmbit & (flag[ambit] || 0)) out.push(t);
  }
  return out;
}

export const signerFor = (playerId: string) => wallet.byPlayer(playerId);
export const stateOf = (playerId: string) => empire.players.get(playerId) ?? null;
