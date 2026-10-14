/* Prowl: your pack against a real chief's den. Their kin are read from the chain (their totems and
 * any pack at home); yours are your pack. POUNCE signs MsgStructAttack; the snatch howl
 * (MsgPlanetRaidComplete) is sung by the howl engine once their king no longer guards the den.
 * Always on screen: what wins (fell their king, then snatch), what this blow will likely do, and what
 * every blow did, as the chain tells it. A wise blow is picked for you until you pick. */
import { h, clear, toast, keepFocus, stable } from '../core/dom';
import type { Ctx, Screen } from './types';
import { mountStage } from '../art/stage';
import { ProwlScene, type Fighter } from '../scenes/prowl';
import { glyph, type GlyphName } from '../ui/glyphs';
import { empire, type OwnedStruct, type PlayerState } from '../game/empire';
import { act, actionBlock } from '../game/actions';
import { wallet } from '../wallet/wallet';
import { txq, type TxJob } from '../wallet/queue';
import { live } from '../chain/live';
import { pow } from '../pow/pow';
import { claimJob, releaseClaim } from '../core/claims';
import { typeOf, type Ambit } from '../data/catalogue';
import { REALM_NAME, beastName, tag, shards } from '../lore';
import { playerName, raidersAt, realmOf, skyFull } from '../realm';
import { alive, forecast, guardsOf, inRealm, isWyrm, moves, pct, reach, readBlow, tellBlow, wardKeeper, wisest, wyrmOf, type Blow, type Forecast, type Move } from '../game/war';
import { audio } from '../core/audio';

export function prowl(ctx: Ctx): Screen {
  const canvas = h('canvas', { class: 'stage' }) as HTMLCanvasElement;
  const warbarEl = h('div', { class: 'warbar', role: 'status' });
  const strikeEl = h('section', { class: 'strike', 'aria-label': 'Pounce' });
  const frayList = h('ol');
  const fray = h('section', { class: 'panel dark fray', 'aria-label': 'Blows', hidden: true }, h('h2', { style: { fontSize: '22px', color: 'var(--yellow)' } }, 'BLOWS'), frayList);
  const el = h('div', { class: 'screen' }, canvas, warbarEl, strikeEl, fray);

  const scene = new ProwlScene();
  const stage = mountStage(canvas, scene);
  scene.onPick = (id, side) => { if (side === 'ours') chooseStriker(id); else chooseMark(id); audio.click(); };

  let targetPid: string | null = ctx.param || null;
  let atk: string | null = null, mark: string | null = null, chose = false;
  let fightOn = false, fightNote = '', note = '', autoBusy = false, unheard: string | null = null;
  let guarding = false, unguardedOk = false, armed: { key: string; until: number } | null = null;
  const watched = new Set<string>();
  const fallen = new Set<string>();
  const toldKeys = new Set<string>();
  const told: { blow: Blow; ours: boolean }[] = [];
  const offs: (() => unknown)[] = [];
  const claims = new Set<string>();
  let left = false;

  const me = () => empire.commander;
  const foe = (): PlayerState | null => (targetPid ? empire.players.get(targetPid) ?? null : null);

  let raidLook = 0;
  async function resolveTarget() {
    const p = me();
    if (!targetPid && p?.fleet?.status === 'away' && p.target) targetPid = p.target.Planet.owner;
    if (!targetPid && p?.planet && Date.now() - raidLook > 5000) {
      raidLook = Date.now();
      const r = await raidersAt(p.planet).catch(() => []);
      if (left) return;
      if (r.length && !targetPid) { targetPid = r[0].owner; paint(); return; }
    }
    if (targetPid && !watched.has(targetPid) && !wallet.byPlayer(targetPid)) { watched.add(targetPid); empire.watch(targetPid); }
  }

  const ourKin = (p: PlayerState | null) => (p ? [...p.structs.values()].filter((s) => alive(s) && s.type!.category === 'fleet') : []);
  const abroad = () => { const p = me(), f = foe(); return !!(p && f && p.fleet?.status === 'away' && p.fleet.locationId === f.planetId); };
  const defending = () => { const p = me(), f = foe(); return !!(p && f && f.fleet?.status === 'away' && f.fleet.locationId === p.planetId && p.fleet?.status !== 'away'); };
  function theirKin(f: PlayerState | null) {
    if (!f) return [];
    if (defending()) return [...f.structs.values()].filter((s) => alive(s) && s.type!.category === 'fleet');
    const home = f.fleet?.status !== 'away';
    return [...f.structs.values()].filter((s) => alive(s) && (s.type!.category === 'planet' || home));
  }
  const inFight = () => abroad() || defending();
  const wardOpen = () => abroad() && !wardKeeper(foe());
  const allMoves = (): Move[] => moves(ourKin(me()), theirKin(foe()), me(), foe());
  const suggestion = (list = allMoves()) => wisest(wardOpen() ? list.filter((m) => m.t.type?.category === 'fleet') : list);

  function settle(list: Move[]) {
    const p = me(), f = foe();
    const a = p?.structs.get(atk || ''), t = f?.structs.get(mark || '');
    if (atk && (!a || !alive(a))) { atk = null; chose = false; }
    if (mark && (!t || !alive(t) || !theirKin(f).some((s) => s.id === mark))) { mark = null; chose = false; }
    if (!chose || !atk || !mark) {
      const best = suggestion(list);
      if (best) { atk = best.a.id; mark = best.t.id; return; }
      const ow = wyrmOf(p), tw = wyrmOf(f);
      if (!atk && ow && alive(ow)) atk = ow.id;
      if (!mark && tw && alive(tw) && theirKin(f).some((s) => s.id === tw.id)) mark = tw.id;
      else if (!mark) mark = theirKin(f).find((s) => s.type?.category === 'fleet')?.id || theirKin(f)[0]?.id || null;
    }
  }
  function chooseMark(id: string) {
    const list = allMoves().filter((m) => m.t.id === id);
    if (atk && !list.some((m) => m.a.id === atk)) { if (list[0]) atk = list[0].a.id; }
    else if (!atk && list[0]) atk = list[0].a.id;
    mark = id; chose = true; note = ''; paint();
  }
  function chooseStriker(id: string) {
    atk = id; chose = true; note = '';
    const p = me(), f = foe(), a = p?.structs.get(id), t = f?.structs.get(mark || '');
    if (a && (!t || !reach(a, t).weapon)) { const best = allMoves().find((m) => m.a.id === id); if (best) mark = best.t.id; }
    paint();
  }

  /* ── deeds ── */
  const pendingStrike = (): TxJob | undefined => { const p = me(); return p ? txq.active.find((j) => j.playerId === p.playerId && j.msgs.some((m) => /MsgStructAttack$/.test(m.typeUrl))) : undefined; };
  const say = (t: string) => { note = t; toast(t, 'warn', 5000); paint(); };
  function prowlOut() {
    const p = me(), f = foe();
    if (!p || !f) return;
    const full = skyFull(f.planet, p);
    if (full) { say(full); return; }
    if (!wallet.unlocked) { say('PAW LOCKED'); return; }
    const k = wyrmOf(p);
    if (!k || !alive(k)) { say('NO KING'); return; }
    if (!k.online) { say('KING NAPS'); return; }
    try { act.fleetMove(p, f.planetId); scene.fx.word('PROWL!', canvas.clientWidth * 0.5, canvas.clientHeight * 0.45, '#FFE53B', 72, '#FF2E88'); audio.pop(); } catch (e) { say((e as Error).message); }
  }
  function goHome() { const p = me(); if (!p) return; try { act.fleetMove(p, p.planetId); audio.pop(); } catch (e) { say((e as Error).message); } }
  function guardFor(p: PlayerState, w: OwnedStruct): OwnedStruct | null {
    if (guardsOf(w, p).length) return null;
    const free = ourKin(p).filter((s) => s.id !== w.id && s.online && s.type!.canDefend && !s.protectedStructIndex);
    free.sort((a, b) => Number(b.ambit === w.ambit) - Number(a.ambit === w.ambit) || b.health - a.health);
    return free[0] || null;
  }
  function guardKing(g: OwnedStruct, w: OwnedStruct) {
    const p = me(); if (!p) return;
    if (!wallet.unlocked) { say('PAW LOCKED'); return; }
    try {
      const job = act.defend(p, g, w.id);
      guarding = true; paint();
      const off = txq.onSettled((j) => { if (j.id !== job.id) return; off(); guarding = false; if (j.status === 'failed') { unguardedOk = true; say(j.error || 'NOPE'); } void empire.refresh(p.playerId); paint(); });
      offs.push(off);
    } catch (e) { say((e as Error).message); }
  }
  function leap(a: OwnedStruct, to: Ambit) {
    const p = me(); if (!p) return;
    if (!wallet.unlocked) { say('PAW LOCKED'); return; }
    try { act.move(p, a, 'fleet', to, 0); toast(`LEAP · ${inRealm(to)}`, 'player'); } catch (e) { say((e as Error).message); }
  }
  function pounce() {
    const p = me(), f = foe();
    const a = p?.structs.get(atk || ''), t = f?.structs.get(mark || '');
    if (!p) return;
    if (!a || !alive(a)) { say('PICK YOUR KIN'); return; }
    if (!t || !alive(t)) { say('PICK PREY'); return; }
    if (!wallet.unlocked) { say('PAW LOCKED'); return; }
    const block = actionBlock(p); if (block) { say(block); return; }
    if (!a.online) { say('ASLEEP'); return; }
    const r = reach(a, t);
    if (!r.weapon) { if (r.soar) leap(a, r.soar); else say(r.why); return; }
    const fc = forecast(a, t, r.weapon, f);
    const key = `${a.id}>${t.id}`;
    if (fc && isWyrm(a) && fc.lost >= 0.995 && !fightOn && armed?.key !== key) { armed = { key, until: Date.now() + 5000 }; setTimeout(() => { if (armed?.key === key) { armed = null; paint(); } }, 5000); paint(); return; }
    armed = null; note = '';
    try {
      const job = act.attack(p, a, [t.id], r.weapon);
      claimJob(job.id); claims.add(job.id);
      unheard = job.id;
      audio.zap();
      const off = txq.onSettled((j) => {
        if (j.id !== job.id) return;
        off(); claims.delete(j.id);
        if (unheard === j.id) unheard = null;
        if (j.status === 'success') hear(j.events || [], j.hash || j.id, j.height);
        else if (j.status === 'failed') { if (fightOn) { fightOn = false; fightNote = 'STOP · REFUSED'; } say(j.error || 'NOPE'); audio.thud(); }
        paint();
      });
      offs.push(off);
      chose = true;
      paint();
    } catch (e) { say((e as Error).message); }
  }
  function press() {
    const p = me(), f = foe();
    if (!p || !f) return;
    if (!inFight()) {
      const w = wyrmOf(p), g = w && alive(w) && !unguardedOk ? guardFor(p, w) : null;
      if (g && w && !guarding) { guardKing(g, w); return; }
      prowlOut(); return;
    }
    const job = pendingStrike();
    if (job && ['queued', 'waiting'].includes(job.status)) { txq.cancel(job.id); if (fightOn) { fightOn = false; fightNote = 'STOP'; } paint(); return; }
    pounce();
  }

  /* ── fight on: the wisest safe blow each time pulse fills ── */
  function fightTick() {
    if (!fightOn || autoBusy || left) return;
    const p = me(); if (!p) return;
    const stop = (why: string) => { fightOn = false; fightNote = why; queueMicrotask(paint); };
    if (!inFight()) { stop(''); return; }
    if (abroad() && !wardKeeper(foe())) { stop('KING DOWN · HOLD SKY'); return; }
    if (pendingStrike() || unheard || guarding) return;
    const w = wyrmOf(p);
    const g = w && alive(w) && !unguardedOk ? guardFor(p, w) : null;
    if (g && w) { autoBusy = true; toast(`AUTO · GUARD KING · ${beastName(g.typeId)}`, 'player', 4000); queueMicrotask(() => { try { guardKing(g, w); } finally { autoBusy = false; } }); return; }
    const m = wisest(allMoves(), (x) => (isWyrm(x.a) ? x.f.lost === 0 : x.f.lost < 0.5));
    if (!m) { stop('NO SAFE BLOW'); return; }
    if (w && alive(w) && w.health <= 2 && abroad() && !(isWyrm(m.t) && m.f.fellMark >= 0.995)) { stop('KING LOW'); return; }
    if (atk !== m.a.id || mark !== m.t.id) { atk = m.a.id; mark = m.t.id; chose = false; }
    if (empire.charge(p) < m.f.arm.charge) return;
    autoBusy = true;
    queueMicrotask(() => { try { note = ''; pounce(); chose = false; if (note && !pendingStrike()) { fightOn = false; fightNote = `STOP · ${tag(note)}`; paint(); } } finally { autoBusy = false; } });
  }

  /* ── the chain's word on every blow ── */
  function ownerOf(structId: string): string | undefined { for (const pl of empire.players.values()) if (pl.structs.has(structId)) return pl.playerId; return undefined; }
  const who = (id: string, typeId: number, ownerId?: string) => {
    const o = ownerId || ownerOf(id);
    const mine = !!me() && o === me()!.playerId;
    return `${mine ? 'YOUR' : 'THEIR'} ${beastName(typeId || empire.ownerOf(id)?.structs.get(id)?.typeId || 0)}`;
  };
  function applyBlow(bw: Blow, height?: number) {
    const find = (id: string) => { for (const pl of empire.players.values()) { const st = pl.structs.get(id); if (st) return st; } return null; };
    const set = (id: string | undefined, hp: number | undefined, felled: boolean) => { const st = id ? find(id) : null; if (!st) return; if (hp != null && Number.isFinite(hp)) st.health = hp; if (felled) { st.health = 0; st.destroyed = true; } };
    for (const sh of bw.shots) { set(sh.targetId, sh.targetHpAfter, sh.targetFelled); if (sh.blockerId) set(sh.blockerId, sh.blockerHpAfter, sh.blockerFelled); }
    set(bw.attackerId, bw.attackerHpAfter, bw.attackerFelled);
    const owner = bw.attackerOwner ? empire.players.get(bw.attackerOwner) : null;
    if (owner && height && height > owner.lastAction) owner.lastAction = height;
  }
  function hear(events: { type: string; data: unknown }[], key: string, height?: number) {
    events.forEach((e, i) => {
      if (e.type !== 'EventAttack') return;
      const bw = readBlow(e.data, `${key}:${i}`, (id) => typeOf(id));
      if (!bw) return;
      const sig = `${bw.attackerId}>${bw.shots.map((s) => `${s.targetId}:${s.targetHpAfter}:${s.evaded}:${s.damage}`).join(',')}:${bw.attackerHpAfter}`;
      if (toldKeys.has(sig)) return;
      const p = me(), f = foe();
      const party = new Set([p?.playerId, f?.playerId].filter(Boolean) as string[]);
      if (!party.has(bw.attackerOwner) && !bw.shots.some((s) => party.has(s.targetOwner))) return;
      toldKeys.add(sig);
      applyBlow(bw, height);
      const ours = !!p && bw.attackerOwner === p.playerId;
      told.unshift({ blow: bw, ours });
      if (told.length > 12) told.length = 12;
      show(bw, ours);
    });
    paintFray(); paint();
  }
  function show(bw: Blow, ours: boolean) {
    const sh = bw.shots[0]; if (!sh) return;
    const onId = sh.blockerId || sh.targetId;
    scene.blow(bw.attackerId, onId, { ours, miss: sh.evaded, dmg: sh.damage, blocked: !!sh.blockerId, word: sh.evadedBy ? `${sh.evadedBy}!` : 'MISS' });
    setTimeout(() => {
      if (!sh.evaded) { audio.pow(); stage.shake(sh.damage >= 2 ? 14 : 8); }
      const fell = (id: string) => { if (fallen.has(id)) return; fallen.add(id); scene.fall(id); audio.thud(); stage.shake(18); };
      if (sh.blockerFelled && sh.blockerId) fell(sh.blockerId);
      if (sh.targetFelled) fell(sh.targetId);
      let delay = 300;
      for (const c of sh.counters) if (c.dmg) { setTimeout(() => scene.blow(c.by, bw.attackerId, { ours: !ours, dmg: c.dmg }), delay); delay += 280; }
      if (sh.back) setTimeout(() => scene.blow(sh.targetId, bw.attackerId, { ours: !ours, dmg: sh.back }), delay);
      if (bw.attackerFelled) setTimeout(() => fell(bw.attackerId), delay + 500);
      const p = me(), f = foe();
      const theirKing = wyrmOf(f)?.id, myKing = wyrmOf(p)?.id;
      if (theirKing && (sh.targetFelled && sh.targetId === theirKing)) setTimeout(() => { scene.fx.word(defending() ? 'SAVED!' : 'KING DOWN!', canvas.clientWidth * 0.5, canvas.clientHeight * 0.35, '#FFE53B', 90, '#FF2E88'); audio.howl(0.12); }, 700);
      if (myKing && ((sh.targetFelled && sh.targetId === myKing) || (bw.attackerFelled && bw.attackerId === myKing))) setTimeout(() => scene.fx.word('YOUR KING!', canvas.clientWidth * 0.5, canvas.clientHeight * 0.35, '#FFF8E7', 80, '#0A0612'), 700);
      if (p) void empire.refresh(p.playerId);
      if (f && f.playerId !== p?.playerId) void empire.refresh(f.playerId);
    }, 280);
  }
  const offTx = live.onTx((tx) => {
    if (tx.events.some((e) => e.type === 'EventAttack')) hear(tx.events, tx.hash || String(tx.height), tx.height);
    const f = foe(), p = me();
    for (const e of tx.events) if (e.type === 'EventOreTheft' && p && f) {
      const d = (e.data && typeof e.data === 'object' && 'eventOreTheftDetail' in e.data ? (e.data as { eventOreTheftDetail: Record<string, unknown> }).eventOreTheftDetail : e.data) as Record<string, unknown>;
      if (d?.thiefPlayerId === p.playerId) { scene.fx.word('SNATCH!', canvas.clientWidth * 0.5, canvas.clientHeight * 0.4, '#FFE53B', 96, '#FF2E88'); scene.fx.fly('shard', canvas.clientWidth * 0.75, canvas.clientHeight * 0.5, canvas.clientWidth * 0.25, canvas.clientHeight * 0.5, 12); audio.howl(0.12); won = { seized: Number(d.amount || 0) }; paint(); }
    }
  });
  let won: { seized: number } | null = null;

  /* ── painting ── */
  function fighters(list: OwnedStruct[], owner: PlayerState | null, theirs: boolean, a?: OwnedStruct): Fighter[] {
    const king = wyrmOf(owner)?.id;
    return list.map((s) => ({
      id: s.id, type: s.typeId, zone: s.type!.category === 'planet' ? 'totem' : realmOf(s), hp: s.health, maxHp: s.type!.maxHealth,
      asleep: !s.online, hidden: s.hidden, king: s.id === king, guard: !!s.protectedStructIndex,
      reachable: theirs && a ? !!reach(a, s).weapon : undefined,
    }));
  }

  function paintWarbar(p: PlayerState | null, f: PlayerState | null, warbar: HTMLElement = warbarEl) {
    clear(warbar);
    const steps: [string, GlyphName][] = [['PICK', 'hunt'], ['PROWL', 'prowl'], ['KING', 'king'], ['SNATCH', 'snatch']];
    let at = 0, tone = 'var(--yellow)';
    let line = '', btn: [string, () => void, string] | null = null;
    const myK = wyrmOf(p);
    if (!p) { line = wallet.active?.playerId ? 'READING…' : 'NO CHIEF'; if (!wallet.active?.playerId) btn = ['JOIN', () => ctx.pact(), 'pink']; }
    else if (won) { at = 4; line = won.seized ? `+${shards(won.seized)}!` : 'SNATCH · EMPTY'; btn = abroad() ? ['HOME', goHome, 'yellow'] : ['HUNT', () => ctx.go('#/hunt'), 'cyan']; }
    else if (!targetPid) { line = 'PICK PREY'; btn = ['HUNT', () => ctx.go('#/hunt'), 'cyan']; }
    else if (!f) { line = 'SNIFFING…'; }
    else if (defending()) { at = 2; tone = 'var(--pink)'; line = 'PROWLERS! · FELL THEIR KING'; }
    else if (!abroad() && (!myK || !alive(myK) || !myK.online)) { at = 1; tone = 'var(--orange)'; line = !myK || !alive(myK) ? 'NO KING' : 'KING NAPS'; btn = ['DEN', () => ctx.go('#/den'), 'yellow']; }
    else if (!abroad()) { at = 1; line = f.ore > 0 ? `PROWL · ${shards(f.ore)}` : 'PROWL'; }
    else if (wardKeeper(f)) { at = 2; tone = 'var(--pink)'; line = 'POUNCE THEIR KING'; btn = ['HOME', goHome, 'paper']; }
    else { at = 3; tone = 'var(--green)'; line = 'HOLD · SNATCHING'; btn = ['HOME', goHome, 'paper']; }
    if (p && targetPid && innerWidth >= 700) warbar.append(...steps.map(([w, g], i) => h('span', { class: 'chip', style: { '--c': i < at ? 'var(--green)' : i === at ? tone : 'rgba(255,248,231,.5)', color: i < at ? 'var(--green)' : i === at ? tone : 'rgba(255,248,231,.5)', background: 'var(--ink)' } }, glyph(i < at ? 'done' : g, 14, 'currentColor'), w)));
    warbar.append(h('span', { class: 'chip', style: { background: tone, color: 'var(--ink)', borderColor: 'var(--ink)', fontSize: '16px', fontFamily: 'var(--boom)' } }, line));
    if (btn) warbar.append(h('button', { type: 'button', class: `cbtn small ${btn[2]}`, onclick: btn[1] }, btn[0]));
    const w = myK;
    const g = w && alive(w) && p && !unguardedOk && (inFight() || at === 1) && f ? guardFor(p, w) : null;
    if (g && w) warbar.append(h('button', { type: 'button', class: 'cbtn small cyan', disabled: guarding, onclick: () => guardKing(g, w) }, glyph('guard', 16, '#0A0612'), guarding ? '…' : `GUARD KING · ${beastName(g.typeId)}`));
  }

  function paintStrike(p: PlayerState | null, a?: OwnedStruct, t?: OwnedStruct, fc?: Forecast | null, strike: HTMLElement = strikeEl) {
    clear(strike);
    const f = foe();
    if (!p || !f || won) return;
    const r = a && t ? reach(a, t) : null;
    if (a && t) {
      // the striker and the mark are buttons too: each press steps to the next (a keyboard path to the canvas)
      const cycle = (list: OwnedStruct[], cur: string, pick: (id: string) => void) => { if (!list.length) return; const i = list.findIndex((x) => x.id === cur); pick(list[(i + 1) % list.length].id); };
      strike.append(h('div', { class: 'row center', style: { gap: '8px' } },
        h('button', { type: 'button', class: 'chip fill', 'data-key': 'next-mine', 'aria-label': `Your kin: ${beastName(a.typeId)}. Next`, style: { '--c': 'var(--yellow)', fontSize: '15px', cursor: 'pointer' }, onclick: () => cycle(ourKin(p).filter((x) => x.online), a.id, chooseStriker) }, beastName(a.typeId), ' ⇄'),
        glyph('go', 22, '#FFF8E7', 3.4),
        h('button', { type: 'button', class: 'chip fill', 'data-key': 'next-theirs', 'aria-label': `Their kin: ${beastName(t.typeId)}. Next`, style: { '--c': 'var(--pink)', color: 'var(--paper)', fontSize: '15px', cursor: 'pointer' }, onclick: () => cycle(theirKin(f), t.id, chooseMark) }, beastName(t.typeId), ' ⇄')));
    }
    if (fc) {
      const odds = h('div', { class: 'odds' },
        h('span', { style: { '--c': 'var(--cyan)' } }, `HIT ${pct(fc.land)}`),
        h('span', { style: { '--c': 'var(--paper)' } }, `DMG ${fc.dmg.min === fc.dmg.max ? fc.dmg.max : `${fc.dmg.min}-${fc.dmg.max}`}`),
        h('span', { style: { '--c': 'var(--yellow)' } }, `FELL ${pct(fc.fell)}`),
        fc.backMax ? h('span', { style: { '--c': 'var(--orange)' } }, `BACK −${fc.backMax}`) : null,
        fc.guard ? h('span', { style: { '--c': 'var(--violet)' } }, `${beastName(fc.guard.typeId)} BLOCKS`) : null);
      const toneC = { good: 'var(--green)', fair: 'var(--yellow)', risky: 'var(--orange)', deadly: 'var(--pink)', futile: 'var(--violet)' }[fc.verdict.tone];
      strike.append(odds, h('div', { class: 'verdict', style: { '--c': toneC } }, fc.verdict.text));
    } else if (r && !r.weapon && inFight()) {
      strike.append(h('div', { class: 'verdict', style: { '--c': 'var(--orange)' } }, r.why));
    }
    // the big button
    const job = pendingStrike();
    const ch = empire.charge(p);
    const cost = fc?.arm.charge ?? 0;
    let word = 'POUNCE', sub = cost ? `PULSE ${Math.min(ch, cost)}/${cost}` : '', color = 'yellow', fill = cost ? Math.min(1, ch / cost) : 1;
    if (!inFight()) {
      const w = wyrmOf(p), g = w && alive(w) && !unguardedOk ? guardFor(p, w) : null;
      if (g && !guarding) { word = 'GUARD KING'; sub = beastName(g.typeId); color = 'cyan'; fill = 1; }
      else { word = 'PROWL'; sub = f.ore ? shards(f.ore) : ''; color = 'pink'; fill = 1; }
    } else if (job && ['queued', 'waiting'].includes(job.status)) { word = 'WAIT'; sub = job.waitReason ? tag(job.waitReason) : 'PULSE'; color = 'paper'; }
    else if (job) { word = 'POUNCING…'; color = 'orange'; }
    else if (r && !r.weapon && r.soar && a) { word = `LEAP ${REALM_NAME[realmOf({ ...a, ambit: r.soar } as OwnedStruct)]}`; color = 'cyan'; sub = `${a.type!.moveCharge} PULSE`; }
    if (armed && armed.key === `${atk}>${mark}`) { word = 'SURE? AGAIN'; color = 'pink'; }
    const btn = h('button', { type: 'button', 'data-key': 'big', class: `cbtn big ${color}`, style: { position: 'relative', overflow: 'hidden', minWidth: '320px' }, onclick: press, disabled: !wallet.unlocked && !!wallet.active?.playerId ? false : false },
      h('span', { style: { position: 'absolute', left: '0', bottom: '0', height: '8px', width: `${fill * 100}%`, background: 'var(--ink)' } }),
      glyph(word.startsWith('PROWL') ? 'prowl' : word.startsWith('GUARD') ? 'guard' : word.startsWith('LEAP') ? 'leap' : 'pounce', 36, color === 'pink' ? '#FFF8E7' : '#0A0612'),
      h('span', null, word), sub ? h('span', { class: 'cost' }, sub) : null);
    const row = h('div', { class: 'row center' }, btn);
    if (inFight()) row.append(h('button', { type: 'button', class: `cbtn ${fightOn ? 'green' : 'ink'}`, 'aria-pressed': String(fightOn), onclick: () => { fightOn = !fightOn; fightNote = ''; if (fightOn) chose = false; paint(); } }, glyph(fightOn ? 'howl' : 'pounce', 22, fightOn ? '#0A0612' : '#FFF8E7'), fightOn ? 'AUTO ON' : 'AUTO'));
    strike.append(row);
    if (note) strike.append(h('span', { class: 'refusal', title: note }, tag(note) === 'NOPE' && /^[A-Z ·]+$/.test(note) ? note : tag(note)));
    if (fightNote) strike.append(h('span', { class: 'chip', style: { background: 'var(--ink)', color: 'var(--yellow)' } }, fightNote));
  }

  function paintFray() {
    clear(frayList);
    fray.hidden = !told.length;
    for (const t of told.slice(0, 4)) {
      const { head, bits } = tellBlow(t.blow, who);
      frayList.append(h('li', { style: { '--c': t.ours ? 'var(--yellow)' : 'var(--pink)' } }, h('b', null, head), bits.map((b) => b.text).join(' · ')));
    }
  }

  function paint() { if (!left) keepFocus(el, paintNow); }
  function paintNow() {
    void resolveTarget();
    const p = me(), f = foe();
    const list = allMoves();
    settle(list);
    const a = p?.structs.get(atk || ''), t = f?.structs.get(mark || '');
    const r = a && t ? reach(a, t) : null;
    const fc = a && t && r?.weapon ? forecast(a, t, r.weapon, f) : null;
    const task = p ? pow.active.find((x) => x.kind === 'raid' && x.playerId === p.playerId) : undefined;
    scene.set({
      ours: fighters(ourKin(p), p, false), theirs: fighters(theirKin(f), f, true, a),
      oursName: p ? playerName(p) : 'YOU', theirsName: f ? playerName(f) : '', atk, mark, guardOf: fc?.guard?.id || null,
      abroad: abroad(), defending: defending(), snatch: abroad() && !wardKeeper(f) && task ? Math.min(1, (task.best?.zeros ?? 0) / Math.max(1, pow.required(task))) : null, noFoe: !f,
    });
    stable(warbarEl, (b) => paintWarbar(p, f, b));
    stable(strikeEl, (b) => paintStrike(p, a, t, fc, b));
  }

  // the lanes live between the war bar and the strike panel, whatever size those take on this screen
  const resize = () => {
    const c = canvas.getBoundingClientRect(), wb = warbarEl.getBoundingClientRect(), sk = strikeEl.getBoundingClientRect();
    const top = wb.height ? wb.bottom - c.top + 48 : 92, bottom = sk.height ? c.bottom - sk.top + 12 : 200;
    scene.inset = { top: Math.max(70, Math.min(c.height * 0.4, top)), bottom: Math.max(120, Math.min(c.height * 0.5, bottom)) };
  };
  const fit = window.setInterval(resize, 700);
  resize(); window.addEventListener('resize', resize);
  offs.push(empire.onChange(paint), wallet.onChange(paint), txq.onChange(() => paint()), live.onBlock(() => { fightTick(); paint(); }), pow.onChange(() => { if (abroad()) paint(); }), offTx);
  paint();

  return {
    el, title: 'PROWL',
    leave: () => { left = true; clearInterval(fit); window.removeEventListener('resize', resize); offs.forEach((f) => f()); claims.forEach(releaseClaim); for (const w of watched) empire.unwatch(w); stage.dispose(); },
  };
}
