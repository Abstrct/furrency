/* The Den: your island, read live from the chain. Every beast and totem is a struct you own; every
 * button signs a real transaction through the deed queue. `#/den/<playerId>` peeks at another
 * chief's den, read-only. */
import { h, clear, toast, confirmBox, keepFocus, stable, modal } from '../core/dom';
import type { Ctx, Screen } from './types';
import { mountStage } from '../art/stage';
import { DenScene, type DenUnit, type FreeSlot } from '../scenes/den';
import { glyph, type GlyphName } from '../ui/glyphs';
import { kinIcon } from '../ui/portrait';
import { empire, type OwnedStruct, type PlayerState } from '../game/empire';
import { act, actionBlock, buildBlock, canRetry, exploreConfirmed, verbsFor } from '../game/actions';
import { wallet } from '../wallet/wallet';
import { txq, type TxJob } from '../wallet/queue';
import { claimJob, releaseClaim } from '../core/claims';
import { STRUCT_TYPES, typeOf, AMBIT_FLAG, type Ambit, type StructType } from '../data/catalogue';
import { num } from '../chain/lcd';
import { live } from '../chain/live';
import { pow } from '../pow/pow';
import { howlSeconds, howlProgress } from '../pow/howl';
import { pace, fmtSeconds, AMBIT_OF_REALM, REALMS, REALM_COLOR, REALM_NAME, REALM_OF_AMBIT, WARD_CRAFT, beastName, fmtAlpha, fmtMana, lore, reachOf, shards, tag } from '../lore';
import { owned, playerName, raidersAt, realmOf } from '../realm';
import { reservedSlots } from '../game/actions';
import { audio } from '../core/audio';
import { losses } from '../ui/alarms';
import { roster } from '../net/roster';
import { touchedIds } from '../game/empire';

const PATH_KEY = 'furrency.path.done';
const flag = (k: string) => { try { return !!localStorage.getItem(k); } catch { return false; } };
const pathDone = () => { try { return localStorage.getItem(PATH_KEY) === '1'; } catch { return false; } };
const markPathDone = () => { try { localStorage.setItem(PATH_KEY, '1'); } catch { /* fine */ } };

export function den(ctx: Ctx): Screen {
  const watching = ctx.param && !wallet.byPlayer(ctx.param) ? ctx.param : null;
  if (watching) empire.watch(watching);
  const player = (): PlayerState | null => (watching ? empire.players.get(watching) ?? null : ctx.param ? empire.players.get(ctx.param) ?? null : empire.commander);
  const mine = () => { const p = player(); return !!p && empire.commands(p.playerId); };

  let sel: string | null = null;
  const livePlayer = new Proxy({} as PlayerState, { get: (_t, k) => { const q = player() as unknown as Record<string | symbol, unknown> | null; const v = q?.[k]; return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(q) : v; } });
  let raiders: { fleetId: string; owner: string }[] = [];
  let raidCheckAt = 0;
  const checkRaiders = () => {
    const p = player();
    if (!p?.planet || Date.now() - raidCheckAt < 5000) return;
    raidCheckAt = Date.now();
    void raidersAt(p.planet).then((r) => { if (JSON.stringify(r) !== JSON.stringify(raiders)) { raiders = r; paint(); } });
  };

  const canvas = h('canvas', { class: 'stage' }) as HTMLCanvasElement;
  const packEl = h('aside', { class: 'panel den-pack', 'aria-label': 'Pack' });
  const cardEl = h('section', { class: 'panel dark den-card', 'aria-label': 'Chosen' });
  const omensEl = h('div', { class: 'omens', role: 'status' });
  const dockEl = h('nav', { class: 'dock', 'aria-label': 'Deeds' });
  const el = h('div', { class: 'screen' }, canvas, packEl, cardEl, omensEl, dockEl);

  const scene = new DenScene();
  scene.onPick = (id) => pick(id);
  scene.onSlot = (s) => { const p = player(); if (p && mine()) callDialog(p, s); else if (!wallet.active?.playerId) ctx.pact(); };
  const stage = mountStage(canvas, scene);

  function pick(id: string | null) {
    sel = id; scene.selected = id;
    if (id) audio.click();
    paint();
  }

  /* Run a deed, or say why it can't be done. Failures come back as a sign on the card. */
  let note: { sid: string; text: string; again?: () => void } | null = null;
  const pending = new Set<string>();
  const offs: (() => unknown)[] = [];
  function deed(p: PlayerState, run: () => unknown, needsGlow = true, sid?: string) {
    if (!empire.commands(p.playerId)) { toast('NOT YOURS', 'warn'); return; }
    if (!wallet.unlocked) { toast('PAW LOCKED', 'warn', 5000, { label: 'UNLOCK', run: () => ctx.pact() }); return; }
    const why = needsGlow ? actionBlock(p) : null;
    if (why) { toast(why, 'enemy'); return; }
    if (sid && note?.sid === sid) note = null;
    try {
      const ran = run();
      if (ran instanceof Promise) { ran.catch((e) => toast((e as Error).message, 'enemy')); audio.pop(); return; }
      const job = ran as TxJob | undefined;
      audio.pop();
      if (sid && job && typeof job === 'object' && 'id' in job) {
        claimJob(job.id); pending.add(job.id);
        const off = txq.onSettled((j) => {
          if (j.id !== job.id) return;
          off(); pending.delete(j.id);
          if (j.status !== 'failed') return;
          const again = canRetry(j) ? () => { if (canRetry(j)) deed(p, () => { txq.retry(j.id); return j; }, needsGlow, sid); } : undefined;
          if (sel !== sid) toast(j.error || 'NOPE', 'enemy', 7000, again ? { label: 'AGAIN', run: again } : undefined);
          else { note = { sid, text: j.error || 'NOPE', again }; stable(cardEl, (b) => paintCard(player(), b)); }
          audio.thud();
        });
        offs.push(off);
      }
    } catch (e) { toast((e as Error).message, 'enemy'); }
  }

  function stateWord(s: OwnedStruct): [string, string] {
    if (!s.built) return ['CALLING', 'var(--cyan)'];
    if (!s.online) return ['NAP', 'var(--violet)'];
    if (s.hidden) return ['HIDDEN', 'var(--violet)'];
    if (s.protectedStructIndex) return ['GUARD', 'var(--yellow)'];
    if (s.typeId === 14) return ['DIG', 'var(--orange)'];
    if (s.typeId === 15) return ['FORGE', 'var(--yellow)'];
    return ['WAKE', 'var(--green)'];
  }
  const hearts = (n: number, max: number) => h('span', { class: 'hearts', role: 'img', 'aria-label': `FUR ${n}/${max}` }, ...Array.from({ length: max }, (_, i) => h('i', { class: i < n ? '' : 'off' })));

  /* ── the scene's view of the den ── */
  function buildProgress(s: OwnedStruct): number {
    const task = pow.active.find((t) => t.kind === 'build' && t.objectId === s.id);
    if (!task) return 0.02;
    return Math.min(0.98, Math.max(0.03, (task.best?.zeros ?? 0) / Math.max(1, pow.required(task))));
  }
  function taskOf(s: OwnedStruct) {
    const kind = s.typeId === 14 ? 'mine' : s.typeId === 15 ? 'refine' : null;
    return kind ? pow.active.find((t) => t.kind === kind && t.objectId === s.id) : undefined;
  }
  const etaSeconds = howlSeconds;
  function workOf(s: OwnedStruct): number | null { const task = taskOf(s); return task ? howlProgress(task) : null; }
  function etaOf(s: OwnedStruct): string | null {
    const task = taskOf(s) || pow.active.find((t) => t.kind === 'build' && t.objectId === s.id);
    const e = etaSeconds(task);
    return e == null ? null : e < 3 ? 'NOW' : `~${fmtSeconds(e)}`;
  }
  /** A speed word from the live wait when there is one, else from the work's difficulty. */
  function paceOf(s: OwnedStruct, difficulty: number): string {
    const e = etaSeconds(taskOf(s));
    if (e == null) return pace(difficulty);
    return e < 120 ? 'QUICK' : e < 600 ? 'STEADY' : e < 2700 ? 'SLOW' : 'VERY SLOW';
  }
  function freeSlots(p: PlayerState): FreeSlot[] {
    const out: FreeSlot[] = [];
    const held = reservedSlots(p.playerId);
    const planet = p.planet?.Planet as unknown as Record<string, string[] | string> | undefined;
    const fleet = (p.fleet?.status === 'away' ? null : p.fleet) as unknown as Record<string, string[] | string> | null;
    for (const a of ['space', 'air', 'land', 'water'] as Ambit[]) {
      for (const [holder, totem] of [[planet, true], [fleet, false]] as [Record<string, string[] | string> | null | undefined, boolean][]) {
        if (!holder) continue;
        const ids = (holder[a] as string[]) || [];
        const n = Math.max(num(holder[a + 'Slots'] as string), ids.length);
        // one open ring per zone and kind is enough to invite a call
        for (let i = 0; i < n; i++) if (!ids[i] && !held.has(`${totem ? 'planet' : 'fleet'}:${a}:${i}`)) { out.push({ zone: REALM_OF_AMBIT[a], slot: i, totem }); break; }
      }
    }
    return out;
  }
  function sceneView(p: PlayerState | null) {
    if (!p) { scene.set({ units: [], free: [], name: '', ward: 0, raiders: 0, away: false, ghost: true, enemy: false, ground: 0, howl: false }); return; }
    const away = p.fleet?.status === 'away';
    const units: DenUnit[] = [];
    for (const s of p.structs.values()) {
      if (s.destroyed || !s.typeId || !s.type) continue;
      const totem = s.type.category === 'planet';
      if (!totem && away) continue;
      if (totem && s.locationId !== p.planetId) continue;
      units.push({
        id: s.id, type: s.typeId, zone: realmOf(s), slot: s.slot, totem,
        building: s.built ? null : buildProgress(s), asleep: s.built && !s.online, hidden: s.hidden,
        hp: s.health, maxHp: s.type.maxHealth, king: s.typeId === 1, guarding: !!s.protectedStructIndex,
        work: workOf(s), workKind: s.typeId === 14 ? 'dig' : s.typeId === 15 ? 'forge' : null, eta: etaOf(s),
      });
    }
    scene.set({
      units, free: mine() ? freeSlots(p) : [], name: (p.planet?.Planet.name || `${playerName(p)} DEN`).toUpperCase(),
      ward: num(p.planet?.planetAttributes?.planetaryShield), raiders: raiders.length, away, ghost: false, enemy: !!watching, ground: num(p.planet?.gridAttributes?.ore),
      howl: !watching && pow.active.some((t) => t.playerId === p.playerId && t.status === 'hashing'),
    });
  }

  /* ── panels ── */
  function paintPack(p: PlayerState | null, pack: HTMLElement = packEl) {
    clear(pack);
    const list = p ? [...p.structs.values()].filter((s) => !s.destroyed && s.type).sort((a, b) => (a.typeId === 1 ? -1 : 0) - (b.typeId === 1 ? -1 : 0) || (a.type!.category === 'planet' ? 1 : 0) - (b.type!.category === 'planet' ? 1 : 0) || a.typeId - b.typeId) : [];
    pack.append(h('div', { class: 'row between' }, h('h2', { style: { fontSize: '28px' } }, watching ? (p ? playerName(p) : 'PEEK') : 'PACK'), h('span', { class: 'tag' }, `${list.length} KIN`)));
    if (!p) {
      pack.append(h('p', { class: 'boomtxt', style: { fontSize: '22px', margin: '10px 0' } }, watching || wallet.active?.playerId ? 'READING…' : 'NO CHIEF'),
        !watching && !wallet.active?.playerId ? h('button', { type: 'button', class: 'cbtn pink', onclick: () => ctx.pact() }, glyph('paw', 22, '#FFF8E7'), 'JOIN') : '');
      return;
    }
    const ul = h('ul');
    const away = p.fleet?.status === 'away';
    for (const s of list) {
      const [st, color] = stateWord(s);
      const totem = s.type!.category === 'planet';
      ul.append(h('li', null, h('button', { type: 'button', class: 'kinrow' + (sel === s.id ? ' on' : ''), 'data-key': s.id, onclick: () => pick(s.id) },
        kinIcon(s.typeId, 40, { still: true, seedFrom: s.id, asleep: s.built && !s.online, building: s.built ? null : 0.5 }),
        h('span', { style: { flex: '1', minWidth: '0' } }, h('span', { class: 'nm' }, beastName(s.typeId)),
          h('span', { class: 'sub', style: { color: color === 'var(--green)' ? '#1a8a1a' : color === 'var(--yellow)' ? '#a07a00' : color === 'var(--cyan)' ? '#0a7a9a' : color === 'var(--orange)' ? '#b8500a' : '#6a4fd0' } },
            `${totem ? 'TOTEM' : REALM_NAME[realmOf(s)]} · ${!totem && away ? 'AWAY' : st}`)),
        hearts(s.health, s.type!.maxHealth))));
    }
    pack.append(ul);
  }

  const VERB_GLYPH: Record<string, GlyphName> = { on: 'wake', off: 'nap', stealth: 'hide', unstealth: 'show', undefend: 'release', cancel: 'stop' };
  const VERB_COLOR: Record<string, string> = { on: 'yellow', off: 'cyan', stealth: 'violet', unstealth: 'violet', undefend: 'paper', cancel: 'pink' };
  function paintCard(p: PlayerState | null, card: HTMLElement = cardEl) {
    clear(card);
    const s = p && sel ? p.structs.get(sel) : undefined;
    card.classList.toggle('idle', !s);
    if (!p || !s || !s.type) {
      card.hidden = !p || !!watching ? !p : false;
      if (p) card.append(h('div', { class: 'row', style: { gap: '12px' } }, glyph('paw', 40, '#FFE53B'), h('span', { class: 'boomtxt', style: { fontSize: '26px' } }, watching ? 'TAP KIN' : 'TAP KIN · TAP +')));
      else card.hidden = true;
      return;
    }
    card.hidden = false;
    const t = s.type, L = lore(s.typeId), totem = t.category === 'planet';
    const [st, color] = stateWord(s);
    const reach = [...new Set([...reachOf(t.primaryWeaponAmbits), ...reachOf(t.secondaryWeaponAmbits)])];
    const zone = totem ? 'TOTEM' : REALM_NAME[realmOf(s)];
    card.append(
      h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'flex-start', gap: '12px' } },
        h('div', { style: { background: totem ? '#3A2A10' : '#1E1240', border: '4px solid var(--paper)', flex: 'none' } }, kinIcon(s.typeId, 108, { seedFrom: s.id, crown: s.typeId === 1, asleep: s.built && !s.online, building: s.built ? null : buildProgress(s), hp: s.health / t.maxHealth })),
        h('div', { style: { minWidth: '0' } },
          h('div', { class: 'row', style: { gap: '6px' } }, h('span', { class: 'chip', style: { color: totem ? 'var(--yellow)' : REALM_COLOR[realmOf(s)] } }, zone), h('span', { class: 'chip', style: { color } }, st)),
          h('h3', { style: { fontSize: '30px', color: 'var(--yellow)', marginTop: '6px' } }, L.name),
          h('div', { class: 'boomtxt', style: { fontSize: '20px', color: 'var(--pink)' } }, L.role),
          h('div', { style: { marginTop: '4px' } }, hearts(s.health, t.maxHealth)))),
      h('dl', { class: 'facts' },
        h('div', null, h('dt', null, 'GLOW'), h('dd', null, `−${fmtMana(t.passiveDraw)}`)),
        totem ? h('div', null, h('dt', null, s.typeId === 14 ? 'DIG' : s.typeId === 15 ? 'FORGE' : 'CALL'), h('dd', null, `${paceOf(s, s.typeId === 14 ? t.oreMiningDifficulty : s.typeId === 15 ? t.oreRefiningDifficulty : t.buildDifficulty)}${etaOf(s) ? ' · ' + etaOf(s) : ''}`)) : h('div', null, h('dt', null, 'HITS'), h('dd', null, s.typeId === 1 ? 'OWN ZONE' : reach.length ? reach.map((r) => REALM_NAME[r]).join(' ') : '—')),
        totem ? null : h('div', null, h('dt', null, 'SKILL'), h('dd', null, WARD_CRAFT[t.unitDefenses] || 'NONE')),
        totem ? null : h('div', null, h('dt', null, 'DMG'), h('dd', null, `${t.primaryWeaponDamage || 0}`))));
    if (!mine()) { card.append(h('p', { class: 'boomtxt', style: { fontSize: '20px', margin: '8px 0 0', color: 'var(--violet)' } }, 'PEEK ONLY')); return; }
    const acts = h('div', { class: 'acts' });
    for (const v of verbsFor(p, s)) {
      acts.append(h('button', { type: 'button', class: `cbtn small ${VERB_COLOR[v.id] || ''}`, title: v.hint, onclick: async () => {
        if (v.danger && !(await confirmBox(`${v.label}?`, [beastName(s.typeId)], v.label))) return;
        if (v.id === 'off' && s.typeId === 1 && !(await confirmBox('KING NAP?', ['NO CALLS', 'NO PROWL'], 'NAP'))) return;
        deed(p, v.run, v.id !== 'off' && v.id !== 'cancel', s.id);
      } }, glyph(VERB_GLYPH[v.id] || 'go', 20, v.id === 'cancel' ? '#FFF8E7' : '#0A0612'), v.label, v.cost ? h('span', { class: 'cost' }, `${v.cost}`) : null));
    }
    if (s.built && t.generatingRate > 0) acts.append(h('button', { type: 'button', class: 'cbtn small yellow', onclick: () => feedDialog(p, s) }, glyph('feed', 20, '#0A0612'), 'FEED'));
    if (s.built && !totem && s.typeId !== 1 && !s.protectedStructIndex) acts.append(h('button', { type: 'button', class: 'cbtn small', onclick: () => guardDialog(p, s) }, glyph('guard', 20, '#0A0612'), 'GUARD', h('span', { class: 'cost' }, `${t.defendChangeCharge}`)));
    if (!totem && s.built) acts.append(h('a', { class: 'cbtn small pink', href: '#/hunt' }, glyph('hunt', 20, '#FFF8E7'), 'HUNT'));
    if (s.built && s.typeId !== 1) acts.append(h('button', { type: 'button', class: 'cbtn small paper', onclick: async () => {
      if (await confirmBox('RELEASE?', [beastName(s.typeId), 'GONE FOR GOOD'], 'RELEASE')) deed(p, () => act.trash(p, s), true, s.id);
    } }, glyph('release', 18, '#0A0612'), 'RELEASE'));
    card.append(acts);
    if (s.typeId === 1 && s.built) {
      card.append(h('p', { class: 'tag', style: { margin: '14px 0 0', color: 'var(--cyan)' } }, `LEAP · ${t.moveCharge} PULSE`),
        h('div', { class: 'zones', role: 'group', 'aria-label': 'Leap' }, ...REALMS.map((r) => {
          const here = realmOf(s) === r;
          return h('button', { type: 'button', class: here ? 'on' : '', 'aria-pressed': String(here), style: { '--c': REALM_COLOR[r] }, onclick: () => { if (!here) deed(p, () => act.move(p, s, 'fleet', AMBIT_OF_REALM[r], 0), true, s.id); } },
            glyph(r, 18, here ? '#0A0612' : REALM_COLOR[r]), REALM_NAME[r]);
        })));
    }
    if (note && note.sid === s.id) {
      const n = note;
      card.append(h('div', { class: 'row', role: 'alert', style: { marginTop: '12px' } }, h('span', { class: 'refusal', title: n.text }, tag(n.text)),
        n.again ? h('button', { type: 'button', class: 'cbtn small yellow', onclick: () => { note = null; n.again!(); } }, 'AGAIN') : null));
    }
  }

  function paintOmens(p: PlayerState | null, omens: HTMLElement = omensEl) {
    clear(omens);
    const list: { rank: number; c: string; text: string; g: GlyphName; act?: [string, () => void] }[] = [];
    const add = (rank: number, c: string, g: GlyphName, text: string, a?: [string, () => void]) => list.push({ rank, c, g, text, act: a });
    if (!p) {
      if (!watching && !wallet.active?.playerId) add(0, 'var(--pink)', 'paw', 'NO CHIEF', ['JOIN', () => ctx.pact()]);
    } else {
      const m = mine();
      // what was taken from this den, by whom, until the chief has seen it
      const lost = m ? losses.list(p.playerId) : [];
      if (lost.length) {
        const last = lost[lost.length - 1];
        const by = last.by ? (roster.get(last.by)?.name || empire.players.get(last.by)?.name || '').toUpperCase() : '';
        add(-1, 'var(--pink)', 'warn', `LOST · ${lost.map((x) => x.text).slice(-3).join(' · ')}${by ? ` · ${by}` : ''}`, ['SEEN', () => losses.seen(p.playerId)]);
        if (last.by) add(-1, 'var(--orange)', 'pounce', `PAY BACK · ${by || 'THEM'}`, ['FIGHT', () => ctx.go(`#/prowl/${last.by}`)]);
      }
      if (m && wallet.unlocked && wallet.deviceSealed && !wallet.backedUp) add(0, 'var(--pink)', 'words', 'WORDS NOT KEPT', ['KEEP', () => ctx.pact('words')]);
      const king = [...p.structs.values()].find((s) => s.typeId === 1 && !s.destroyed);
      if (p.planetId && !king && m) add(0, 'var(--pink)', 'king', 'NO KING', ['CALL', () => { const t = typeOf(1); if (t) deed(p, () => act.build(p, t, 'land', 0), false); }]);
      if (p.planetId && !king && !m) add(1, 'var(--yellow)', 'king', 'KING DOWN', p.ore > 0 ? ['PROWL', () => ctx.go(`#/prowl/${p.playerId}`)] : undefined);
      for (const r of raiders) add(0, 'var(--pink)', 'pounce', m ? 'PROWLERS!' : 'PROWLED', m ? ['DEFEND', () => ctx.go(`#/prowl/${r.owner}`)] : undefined);
      if (!p.online) add(0, 'var(--orange)', 'glow', 'LOW GLOW', m ? ['GLOW', () => ctx.go('#/glow')] : undefined);
      if (p.ore > 0) {
        const forging = [...p.structs.values()].some((x) => x.typeId === 15 && !x.destroyed && x.built && x.online);
        if (m) add(1, 'var(--yellow)', 'shard', `${shards(p.ore)} · ${forging ? 'FORGING' : 'AT RISK'}`, forging || owned(p, 15) ? undefined : ['+ FORGE BADGER', () => callDialog(p, undefined, 15)]);
        else add(1, 'var(--yellow)', 'shard', `${shards(p.ore)} · SNATCH`, ['PROWL', () => ctx.go(`#/prowl/${p.playerId}`)]);
      }
      if (p.fleet?.status === 'away') add(1, 'var(--cyan)', 'prowl', m ? 'PACK AWAY' : 'PACK AWAY · OPEN', m ? ['HOME', () => deed(p, () => act.fleetMove(p, p.planetId), false)] : undefined);
      const ground = num(p.planet?.gridAttributes?.ore);
      if (!p.planetId || (p.planet && ground <= 0 && p.ore === 0)) add(2, 'var(--cyan)', 'roam', p.planetId ? 'DEN EMPTY' : 'NO DEN', m ? ['ROAM', () => deed(p, () => exploreConfirmed(p), false)] : undefined);
      else if (m && ground > 0 && !owned(p, 14)) add(2, 'var(--green)', 'dig', `${shards(ground)} IN GROUND`, ['+ DIG MOLE', () => callDialog(p, undefined, 14)]);
    }
    list.sort((a, b) => a.rank - b.rank);
    // the first steps, as a strip of signs, until they are all done
    if (p && mine()) {
      const has = (id: number) => [...p.structs.values()].some((x) => x.typeId === id && !x.destroyed && x.built);
      const steps: [GlyphName, string, boolean][] = [
        ['paw', 'CHIEF', true], ['dig', 'MOLE', has(14)], ['shard', 'DIG', flag(`furrency.first.dig.${p.playerId}`) || (has(14) && p.alpha > 0n)], ['forge', 'BADGER', has(15)], ['alpha', 'ALPHA', p.alpha > 0n || flag(`furrency.first.forge.${p.playerId}`)], ['pounce', 'PROWL', p.fleet?.status === 'away' || pathDone()],
      ];
      if (steps.some((x) => !x[2])) {
        const now = steps.findIndex((x) => !x[2]);
        omens.append(h('div', { class: 'path', 'aria-label': 'First steps' }, ...steps.map(([g, w, done], i) => h('span', { class: 'step' + (done ? ' done' : i === now ? ' now' : '') }, glyph(done ? 'done' : g, 18, done ? '#0A0612' : i === now ? '#0A0612' : '#FFF8E7'), w))));
      } else markPathDone();
    }
    for (const o of list.slice(0, 2)) omens.append(h('div', { class: 'omen', style: { '--c': o.c } }, glyph(o.g, 24, '#0A0612'), o.text, o.act ? h('button', { type: 'button', class: 'cbtn small ink', onclick: o.act[1] }, o.act[0]) : null));
  }

  function paintDock(p: PlayerState | null, dock: HTMLElement = dockEl) {
    clear(dock);
    const b = (g: GlyphName, word: string, sub: string, color: string, run: (() => void) | string) => typeof run === 'string'
      ? h('a', { class: `cbtn ${color}`, href: run }, glyph(g, 30, color === 'pink' ? '#FFF8E7' : '#0A0612'), word, h('small', null, sub))
      : h('button', { type: 'button', class: `cbtn ${color}`, onclick: run }, glyph(g, 30, color === 'pink' ? '#FFF8E7' : '#0A0612'), word, h('small', null, sub));
    if (!p || !mine()) {
      if (watching) dock.append(b('pounce', 'PROWL', 'THIS DEN', 'pink', `#/prowl/${p?.playerId || watching}`), b('back', 'MY DEN', 'HOME', 'yellow', '#/den'));
      else if (!wallet.active?.playerId) dock.append(b('paw', 'JOIN', 'START', 'pink', () => ctx.pact()), b('hunt', 'HUNT', 'LOOK', 'cyan', '#/hunt'));
      return;
    }
    dock.append(
      b('call', 'CALL', 'NEW KIN', 'pink', () => callDialog(p)),
      b('glow', 'GLOW', 'POWER', 'cyan', '#/glow'),
      b('hunt', 'HUNT', 'PREY', 'yellow', '#/hunt'),
      p.fleet?.status === 'away' ? b('home', 'HOME', 'PACK', 'orange', () => deed(p, () => act.fleetMove(p, p.planetId), false)) : b('pounce', 'PROWL', 'FIGHT', 'orange', '#/prowl'),
      b('roam', 'ROAM', 'NEW DEN', 'paper', () => deed(p, () => exploreConfirmed(p), false)));
  }

  /* ── dialogs ── */
  function dialog(title: string, color: string, body: (Node | string | null)[], wide = false) {
    const veil = h('div', { class: 'veil', onclick: (e: Event) => { if (e.target === veil) veil.remove(); } },
      h('section', { class: 'panel' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div', { class: 'dlg-head' }, h('h2', { style: { color } }, title), h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: () => veil.remove() }, glyph('close', 20, '#FFF8E7'))), ...body));
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { veil.remove(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
    document.body.append(veil);
    modal(veil, () => veil.querySelector<HTMLElement>('.callcard:not(:disabled), input, .choice'));
    return veil;
  }

  function freeFor(p: PlayerState, t: StructType, want?: FreeSlot): { ambit: Ambit; slot: number } | null {
    const where = t.category;
    const holder = (where === 'planet' ? p.planet?.Planet : p.fleet) as unknown as Record<string, string[] | string> | undefined;
    if (!holder) return null;
    const held = reservedSlots(p.playerId);
    const order: Ambit[] = want ? [AMBIT_OF_REALM[want.zone]] : ['land', 'space', 'air', 'water'];
    for (const a of order) {
      if (!(t.possibleAmbit & AMBIT_FLAG[a])) continue;
      const ids = (holder[a] as string[]) || [];
      const n = Math.max(num(holder[a + 'Slots'] as string), ids.length);
      if (want && want.totem === (where === 'planet') && !ids[want.slot] && !held.has(`${where}:${a}:${want.slot}`)) return { ambit: a, slot: want.slot };
      for (let i = 0; i < n; i++) if (!ids[i] && !held.has(`${where}:${a}:${i}`)) return { ambit: a, slot: i };
    }
    return null;
  }

  function callDialog(p: PlayerState, slot?: FreeSlot, only?: number) {
    const ch = empire.charge(p);
    const spare = p.capacity + p.connectionCapacity - p.load - p.structsLoad;
    const next = ![...p.structs.values()].some((x) => x.typeId === 1 && !x.destroyed) ? 1 : !owned(p, 14) ? 14 : !owned(p, 15) ? 15 : 0;
    const kingGone = !![...p.structs.values()].length && ![...p.structs.values()].some((x) => x.typeId === 1 && !x.destroyed);
    const GROUPS: [string, GlyphName, number[]][] = [
      ...(kingGone && !slot?.totem ? [['KING', 'king', [1]] as [string, GlyphName, number[]]] : []),
      ['GROW', 'dig', [14, 15]],
      ['GLOW', 'glow', [20, 21, 22]],
      ['WARD', 'ward', [16, 17, 18, 19]],
      ['PACK', 'pack', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
    ];
    const box = h('div');
    for (const [title, g, ids] of GROUPS) {
      const types = ids.map((id) => STRUCT_TYPES.find((t) => t.id === id)).filter((t): t is StructType => !!t && (!only || t.id === only))
        .filter((t) => !slot || ((t.category === 'planet') === slot.totem && !!(t.possibleAmbit & AMBIT_FLAG[AMBIT_OF_REALM[slot.zone]])));
      if (!types.length) continue;
      box.append(h('h3', { class: 'grouph' }, glyph(g, 30, '#0A0612'), title),
        h('div', { class: 'callgrid' }, ...types.map((t) => {
          const limit = t.buildLimit && owned(p, t.id) >= t.buildLimit;
          const at = freeFor(p, t, slot);
          // calling a new king is the one call that needs no king
          const why = limit ? 'ONLY ONE' : !at ? 'NO SLOT' : t.id === 1 ? (p.online ? null : 'LOW GLOW') : buildBlock(p, t);
          const zones = REALMS.filter((r) => t.possibleAmbit & AMBIT_FLAG[AMBIT_OF_REALM[r]]);
          return h('button', { type: 'button', class: 'callcard', disabled: !!why, onclick: () => {
            veil.remove();
            deed(p, () => act.build(p, t, at!.ambit, at!.slot));
            scene.word(null, 'CALL!', '#FFE53B', '#22E4FF');
          } },
            t.id === next ? h('span', { class: 'first' }, 'FIRST') : null,
            kinIcon(t.id, 96, { seedFrom: `t${t.id}` }),
            h('span', { class: 'nm' }, beastName(t.id)),
            h('span', { class: 'tag', style: { color: '#c0156a' } }, lore(t.id).role),
            h('span', { class: 'row center', style: { gap: '6px' } },
              h('span', { class: 'chip', style: { color: spare >= BigInt(t.buildDraw) ? '#0a7a9a' : '#c0156a' } }, `${fmtMana(t.buildDraw)} GLOW`),
              h('span', { class: 'chip', style: { color: ch >= t.buildCharge ? '#1a8a1a' : '#a07a00' } }, `PULSE ${t.buildCharge}+`)),
            h('span', { class: 'row center', style: { gap: '4px' } }, ...zones.map((r) => glyph(r, 16, '#0A0612')), h('span', { class: 'tag' }, `CALL ${pace(t.buildDifficulty)}`)),
            why ? h('span', { class: 'why' }, why) : null);
        })));
    }
    const veil = dialog(slot ? `CALL · ${REALM_NAME[slot.zone]}` : 'CALL', 'var(--pink)', [
      h('div', { class: 'row', style: { marginBottom: '10px' } }, h('span', { class: 'chip fill', style: { '--c': 'var(--cyan)' } }, `GLOW ${spare < 0n ? '−' : ''}${fmtMana(spare < 0n ? -spare : spare)}`), h('span', { class: 'chip fill', style: { '--c': 'var(--paper)' } }, `PULSE ${ch >= 99 ? 'FULL' : ch}`)),
      box], true);
  }

  function feedDialog(p: PlayerState, s: OwnedStruct) {
    const amt = h('input', { id: 'feed-amt', type: 'number', min: '0.001', step: '0.1', value: '1', inputMode: 'decimal' }) as HTMLInputElement;
    const veil = dialog(`FEED · ${beastName(s.typeId)}`, 'var(--yellow)', [
      h('div', { class: 'row' }, glyph('alpha', 34, '#0A0612'), h('span', { class: 'big-num' }, fmtAlpha(p.alpha)), h('span', { class: 'tag' }, 'HAVE')),
      h('p', { class: 'boomtxt', style: { fontSize: '22px', margin: '8px 0' } }, 'ALPHA → GLOW · FOREVER'),
      h('div', { class: 'field' }, h('label', { for: 'feed-amt' }, 'ALPHA'), amt),
      h('div', { class: 'row end' },
        h('button', { type: 'button', class: 'cbtn paper', onclick: () => veil.remove() }, 'NO'),
        h('button', { type: 'button', class: 'cbtn yellow', onclick: () => {
          const g = Number(amt.value);
          if (!(g > 0)) return;
          const u = BigInt(Math.round(g * 1e6));
          if (u > p.alpha) { toast('LOW ALPHA', 'warn'); return; }
          veil.remove(); deed(p, () => act.infuseGenerator(p, s, u), false, s.id);
          scene.fly(s.id, 'coin', 0, 0, 0);
        } }, glyph('feed', 20, '#0A0612'), 'FEED'))]);
  }

  function guardDialog(p: PlayerState, s: OwnedStruct) {
    const allies = [...p.structs.values()].filter((x) => x.id !== s.id && !x.destroyed && x.built);
    const veil = dialog(`GUARD · WHO?`, 'var(--cyan)', [
      h('div', { class: 'stack', style: { maxHeight: '55vh', overflowY: 'auto' } }, ...allies.map((a) => h('button', { type: 'button', class: 'choice', onclick: () => { veil.remove(); deed(p, () => act.defend(p, s, a.id), true, s.id); } },
        kinIcon(a.typeId, 52, { still: true, seedFrom: a.id, crown: a.typeId === 1 }),
        h('span', { style: { flex: '1' } }, beastName(a.typeId), h('small', null, a.type?.category === 'planet' ? 'TOTEM' : REALM_NAME[realmOf(a)])),
        hearts(a.health, a.type?.maxHealth || 0))))]);
  }

  /* ── live reactions: the chain's events, as comic moments ── */
  const meterPoint = (word: string) => {
    const m = [...document.querySelectorAll<HTMLElement>('.meter')].find((e) => e.getAttribute('aria-label')?.startsWith(word));
    const c = canvas.getBoundingClientRect();
    if (!m) return { x: c.width / 2, y: 0 };
    const r = m.getBoundingClientRect();
    return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
  };
  const onLanded = txq.onSettled((j) => {
    const p = player();
    if (j.status !== 'success' || !p || j.playerId !== p.playerId) return;
    const urls = j.msgs.map((m) => m.typeUrl).join();
    const v = j.msgs[0]?.value as Record<string, unknown>;
    const sid = String(v?.structId || v?.operatingStructId || '');
    if (/OreMinerComplete/.test(urls)) { scene.word(sid, 'DIG!', '#FFE53B', '#FF7A1A'); const m = meterPoint('SHARD'); scene.fly(sid, 'shard', m.x, m.y, 6); audio.dig(); }
    if (/OreRefineryComplete/.test(urls)) { scene.word(sid, 'FORGE!', '#0A0612', '#FFE53B'); const m = meterPoint('ALPHA'); scene.fly(sid, 'coin', m.x, m.y, 7); audio.forge(); }
    if (/StructBuildComplete/.test(urls)) { scene.word(sid, 'UP!', '#FFE53B', '#FF2E88'); scene.fx.ring(scene.headOf(sid)?.x || 0, scene.headOf(sid)?.y || 0, '#22E4FF', 150); stage.shake(6); }
    if (/StructActivate/.test(urls)) scene.word(sid, 'WAKE!', '#0A0612', '#FFE53B');
    if (/StructDeactivate/.test(urls)) scene.word(sid, 'ZZZ', '#FFF8E7', '#B89BFF');
    if (/StructMove/.test(urls)) { scene.word(sid, 'LEAP!', '#0A0612', '#22E4FF'); scene.nudge(sid); }
    if (/DefenseSet/.test(urls)) scene.word(String(v?.defenderStructId || ''), 'GUARD!', '#0A0612', '#FFF8E7');
    if (/StealthActivate/.test(urls)) scene.word(sid, 'POOF', '#FFF8E7', '#B89BFF');
    if (/PlanetExplore/.test(urls)) { scene.word(null, 'NEW DEN!', '#FFE53B', '#FF2E88'); stage.shake(10); }
    if (/GeneratorInfuse/.test(urls)) { scene.word(sid, 'GLOW!', '#0A0612', '#22E4FF'); scene.fx.ring(scene.headOf(sid)?.x || 0, scene.headOf(sid)?.y || 0, '#22E4FF', 140); }
  });
  // blows on our den, from anyone, as the chain tells them
  const offTx = live.onTx((tx) => {
    const p = player();
    if (!p) return;
    for (const e of tx.events) {
      if (e.type === 'EventAttack') {
        const d = (e.data && typeof e.data === 'object' && 'eventAttackDetail' in e.data ? (e.data as { eventAttackDetail: unknown }).eventAttackDetail : e.data) as { attackerStructId?: string; eventAttackShotDetail?: { targetStructId?: string; damage?: string }[] };
        for (const s of d?.eventAttackShotDetail || []) if (s.targetStructId && p.structs.has(s.targetStructId)) { scene.hit(s.targetStructId, Number(s.damage || 1)); stage.shake(12); audio.pow(); }
        if (d?.attackerStructId && p.structs.has(d.attackerStructId)) scene.nudge(d.attackerStructId);
      }
      if (e.type === 'EventOreTheft') {
        const d = (e.data && typeof e.data === 'object' && 'eventOreTheftDetail' in e.data ? (e.data as { eventOreTheftDetail: Record<string, unknown> }).eventOreTheftDetail : e.data) as Record<string, unknown> | null;
        if (d?.victimPlayerId === p.playerId) { scene.word(null, 'SNATCHED!', '#FFF8E7', '#FF2E88'); stage.shake(14); audio.thud(); }
      }
      if (e.type === 'EventRaid' && touchedIds(e.type, e.data).includes(p.planetId)) { raidCheckAt = 0; checkRaiders(); }
    }
  });

  let shownFor: string | null = null;
  let hatched = false;
  function paint() {
    const p = player();
    if ((p?.playerId ?? null) !== shownFor) { shownFor = p?.playerId ?? null; sel = null; scene.selected = null; raiders = []; raidCheckAt = 0; }
    if (p && sel && !p.structs.get(sel)) { sel = null; scene.selected = null; }
    checkRaiders();
    sceneView(p);
    // panels keep their buttons between repaints (stable), so every handler reads the chief as they are
    // at the moment of the click, never as they were when the button was drawn
    const lp = p ? livePlayer : null;
    keepFocus(el, () => { stable(packEl, (b) => paintPack(lp, b)); stable(cardEl, (b) => paintCard(lp, b)); stable(omensEl, (b) => paintOmens(lp, b)); stable(dockEl, (b) => paintDock(lp, b)); });
    if (p && !hatched && !watching) {
      hatched = true;
      let fresh = false; try { fresh = sessionStorage.getItem('furrency.hatch') === '1'; sessionStorage.removeItem('furrency.hatch'); } catch { /* none */ }
      if (fresh) setTimeout(() => { scene.word(null, 'WELCOME!', '#FFE53B', '#FF2E88'); audio.howl(0.1); stage.shake(8); }, 900);
    }
  }
  const resize = () => { const n = window.innerWidth < 900; scene.inset = { l: n ? 0 : 300, r: n ? 0 : 372, b: n ? 120 : 110 }; };
  resize();
  window.addEventListener('resize', resize);
  const timer = setInterval(() => sceneView(player()), 1000);
  const offAll = [losses.onChange(paint), empire.onChange(paint), wallet.onChange(paint), pow.onChange(() => sceneView(player())), txq.onChange(() => sceneView(player())), onLanded, offTx];
  paint();

  return {
    el, title: watching ? 'PEEK' : 'DEN',
    leave: () => {
      window.removeEventListener('resize', resize); clearInterval(timer);
      offAll.forEach((f) => f()); offs.forEach((f) => f()); pending.forEach(releaseClaim);
      stage.dispose(); if (watching) empire.unwatch(watching);
      document.querySelectorAll('.veil').forEach((v) => v.remove());
    },
  };
}
