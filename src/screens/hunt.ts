/* Hunt: every chief on the network, around their clan's sun. Pick prey, peek at their den, and
 * PROWL — a real MsgFleetMove that sends your pack (and its king) to hang over their den. */
import { h, clear, toast, keepFocus, stable } from '../core/dom';
import type { Ctx, Screen } from './types';
import { mountStage } from '../art/stage';
import { HuntScene, type HuntDen } from '../scenes/hunt';
import { glyph, type GlyphName } from '../ui/glyphs';
import { kinIcon } from '../ui/portrait';
import { live } from '../chain/live';
import { skyFull } from '../realm';
import { roster, type Roster } from '../net/roster';
import { guilds, type GuildEntry } from '../guild/directory';
import { empire } from '../game/empire';
import { act } from '../game/actions';
import { wallet } from '../wallet/wallet';
import { alive, guardsOf, reach, wyrmOf } from '../game/war';
import { beatsAsTime, clanColor, clanName, shards, short } from '../lore';
import { audio } from '../core/audio';

type Filter = 'all' | 'rich' | 'nap';

export function hunt(ctx: Ctx): Screen {
  const canvas = h('canvas', { class: 'stage' }) as HTMLCanvasElement;
  const search = h('input', { type: 'search', placeholder: 'NAME', 'aria-label': 'Find a chief', autocomplete: 'off', style: { font: '600 18px var(--ui)', padding: '8px 10px', border: '4px solid var(--ink)', width: '100%' } }) as HTMLInputElement;
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filter' });
  const list = h('ul', { class: 'list' });
  const foot = h('p', { class: 'tag', style: { margin: '8px 0 0' } });
  const legend = h('p', { class: 'tag row', style: { margin: '6px 0 0', gap: '10px' } }, h('span', { style: { color: '#c0156a' } }, '● SHARD'), h('span', null, '● NONE'), h('span', { style: { color: '#a07a00' } }, '♛ YOU'), h('span', { style: { color: '#6a4fd0' } }, 'z IDLE'));
  const left = h('aside', { class: 'panel side l', 'aria-label': 'Prey' }, h('div', { class: 'row between', style: { marginBottom: '8px' } }, h('h2', { style: { fontSize: '30px' } }, 'PREY'), h('span', { class: 'row', style: { gap: '6px' } },
    h('button', { type: 'button', class: 'cbtn small', 'aria-label': 'Zoom out', onclick: () => scene.zoomBy(0.75) }, '−'),
    h('button', { type: 'button', class: 'cbtn small', 'aria-label': 'Zoom in', onclick: () => scene.zoomBy(1.33) }, '+'))), search, h('div', { style: { marginTop: '8px' } }, seg), list, foot, legend);
  const cardEl = h('section', { class: 'panel dark side r', style: { bottom: 'auto' }, 'aria-label': 'Chosen chief', hidden: true });
  const el = h('div', { class: 'screen' }, canvas, left, cardEl);

  const scene = new HuntScene();
  const stage = mountStage(canvas, scene);
  scene.onPick = (id) => choose(id);

  let clans = new Map<string, GuildEntry>();
  let filter: Filter = 'all';
  let sel: string | null = ctx.param || null;
  let loaded = false, failed = false, gone = false, goTimer = 0;

  const isMine = (id: string) => !!wallet.byPlayer(id);
  const pass = (d: { id: string; name: string; ore: number; nap: number }) => {
    const q = search.value.trim().toUpperCase();
    if (q && !d.name.includes(q) && d.id !== q.toLowerCase()) return false;
    if (filter === 'rich') return d.ore > 0;
    if (filter === 'nap') return d.nap > 600;
    return true;
  };

  /** The roster arrives cached first, then fresh (clan or chain), then live from GRASS: each paints. */
  function take(r: Roster) {
    if (gone) return;
    loaded = true; failed = false;
    const dens = r.chiefs.map((c) => ({ id: c.id, name: (c.name || `CHIEF ${c.id.split('-')[1]}`).toUpperCase(), clan: c.guildId || '0-0', ore: c.ore, nap: c.lastAction && live.height ? live.height - c.lastAction : 0, mine: isMine(c.id) }));
    const clanList = [...new Set(dens.map((d) => d.clan))].map((id) => ({ id, name: clanName(id, clans.get(id)?.meta?.name), color: clanColor(id) }));
    scene.set(dens, clanList);
    source = r.source;
    if (sel && !focused) { focused = true; scene.selected = sel; scene.focus(sel); scout(sel); }
    paint();
  }
  let source: Roster['source'] = 'chain', focused = false;
  async function load() {
    guilds().then((g) => { clans = new Map(g.map((x) => [x.id, x])); if (roster.roster) take(roster.roster); }).catch(() => { /* names fall back */ });
    try { await roster.load(); }
    catch { if (gone) return; failed = true; loaded = true; paint(); setTimeout(() => { if (!gone) void load(); }, 9000); }
  }

  let scouted: string | null = null;
  function scout(id: string | null) {
    if (id === scouted) return;
    if (scouted && !isMine(scouted)) empire.unwatch(scouted);
    scouted = id;
    if (id && !isMine(id)) empire.watch(id);
  }

  function choose(id: string | null) {
    sel = id; scene.selected = id;
    if (id) { scene.focus(id); audio.click(); }
    scout(id);
    paint();
  }

  function paintSeg() {
    clear(seg);
    for (const [k, word, g] of [['all', 'ALL', 'paw'], ['rich', 'SHARD', 'shard'], ['nap', 'IDLE', 'wait']] as [Filter, string, GlyphName][])
      seg.append(h('button', { type: 'button', class: filter === k ? 'on' : '', 'aria-pressed': String(filter === k), onclick: () => { filter = k; paint(); } }, glyph(g, 16, filter === k ? '#FFE53B' : '#0A0612'), ' ', word));
  }

  function paintList() {
    clear(list);
    if (!loaded) { list.append(h('li', { class: 'boomtxt', style: { fontSize: '22px' } }, 'SNIFFING…')); return; }
    if (failed && !scene.dens.length) { list.append(h('li', null, h('span', { class: 'refusal' }, 'NET DOWN'))); return; }
    const rows = scene.dens.filter((d) => pass(d)).sort((a, b) => Number(b.mine) - Number(a.mine) || b.ore - a.ore || b.nap - a.nap).slice(0, 120);
    for (const d of rows) {
      list.append(h('li', null, h('button', { type: 'button', class: 'prey' + (sel === d.id ? ' on' : ''), 'data-key': d.id, onclick: () => choose(d.id) },
        h('span', { class: 'flag', style: { background: d.mine ? '#FFE53B' : clanColor(d.clan) } }),
        h('span', { class: 'nm' }, d.mine ? `${d.name} · YOU` : d.name),
        h('span', { class: 'val' }, d.ore ? `◆${short(d.ore)}` : ''),
        h('span', { class: 'sub' }, `${clanName(d.clan, clans.get(d.clan)?.meta?.name)}${d.nap > 600 ? ` · IDLE ${beatsAsTime(d.nap)}` : ''}`))));
    }
    const n = scene.dens.filter(pass).length;
    foot.textContent = `${n} DENS · ${scene.dens.filter((d) => d.ore > 0 && pass(d)).length} WITH SHARD · ${source === 'clan' ? 'CLAN' : source === 'cache' ? 'SAVED' : 'NET'}`;
  }

  function paintCard(card: HTMLElement = cardEl) {
    clear(card);
    const d = scene.dens.find((x) => x.id === sel);
    card.hidden = !d;
    if (!d) return;
    const f = empire.players.get(d.id);
    const me = empire.commander;
    const king = f ? wyrmOf(f) : null;
    const home = f?.fleet?.status !== 'away';
    const kingWord = !f ? '…' : !king || !alive(king) ? 'DOWN' : !home ? 'AWAY' : !king.online ? 'NAP' : 'HOME';
    const guards = king && f ? guardsOf(king, f).length : 0;
    const pack = f ? [...f.structs.values()].filter((s) => alive(s) && s.type!.category === 'fleet' && s.typeId !== 1).length : 0;
    const mine = me ? [...me.structs.values()].filter((s) => alive(s) && s.online && s.type!.category === 'fleet') : [];
    const reachers = king && alive(king) && home ? mine.filter((a) => reach(a, king).weapon).length : 0;
    const open = kingWord === 'DOWN' || kingWord === 'AWAY' || kingWord === 'NAP';
    card.append(
      h('button', { type: 'button', class: 'x', 'aria-label': 'Close', style: { position: 'absolute', right: '8px', top: '8px' }, onclick: () => choose(null) }, glyph('close', 18, '#FFF8E7')),
      h('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '12px', alignItems: 'flex-start', paddingRight: '40px' } },
        h('div', { style: { background: '#2A0A26', border: '4px solid var(--paper)', flex: 'none' } }, kinIcon(1, 96, { enemy: !d.mine, crown: true, seedFrom: d.id, asleep: kingWord === 'NAP', building: kingWord === 'DOWN' ? 0.001 : null })),
        h('div', { style: { minWidth: '0' } },
          h('span', { class: 'chip', style: { color: clanColor(d.clan) } }, glyph('clan', 14, clanColor(d.clan)), clanName(d.clan, clans.get(d.clan)?.meta?.name)),
          h('h3', { style: { fontSize: d.name.length > 14 ? '18px' : d.name.length > 9 ? '22px' : '30px', color: d.mine ? 'var(--yellow)' : 'var(--paper)', marginTop: '6px', overflowWrap: 'break-word', wordBreak: 'normal' } }, d.name),
          d.mine ? h('span', { class: 'boomtxt', style: { color: 'var(--yellow)', fontSize: '22px' } }, 'YOUR DEN') : null)),
      h('dl', { class: 'facts' },
        h('div', null, h('dt', null, 'SHARD'), h('dd', { style: { color: d.ore ? 'var(--pink)' : '' } }, d.ore ? shards(d.ore) : 'NONE')),
        h('div', null, h('dt', null, 'IDLE'), h('dd', null, d.nap ? beatsAsTime(d.nap) : '—')),
        h('div', null, h('dt', null, 'KING'), h('dd', { style: { color: open ? 'var(--green)' : 'var(--pink)' } }, kingWord)),
        h('div', null, h('dt', null, 'GUARDS · PACK'), h('dd', null, f ? `${guards} · ${pack}` : '…'))),
      !d.mine && me && f && !open ? h('p', { class: 'boomtxt', style: { fontSize: '20px', margin: '0 0 6px', color: reachers ? 'var(--green)' : 'var(--orange)' } }, reachers ? `${reachers} KIN CAN HIT KING` : 'NO KIN CAN HIT KING') : '',
      h('div', { class: 'row', style: { marginTop: '6px' } },
        h('a', { class: 'cbtn small', href: `#/den/${d.id}` }, glyph('eye', 18, '#0A0612'), 'PEEK'),
        d.mine ? h('a', { class: 'cbtn small yellow', href: '#/den' }, glyph('den', 18, '#0A0612'), 'DEN') : prowlButton(d)));
  }

  function prowlButton(d: HuntDen) {
    const me = empire.commander;
    const there = me?.fleet?.status === 'away' && me.fleet.locationId === empire.players.get(d.id)?.planetId;
    if (there) return h('a', { class: 'cbtn small pink', href: `#/prowl/${d.id}` }, glyph('pounce', 18, '#FFF8E7'), 'FIGHT');
    return h('button', { type: 'button', class: 'cbtn small pink', onclick: () => prowl(d) }, glyph('prowl', 18, '#FFF8E7'), 'PROWL');
  }

  function prowl(d: HuntDen) {
    const me = empire.commander;
    if (!me) { if (!wallet.active?.playerId) ctx.pact(); else toast('READING', 'warn'); return; }
    if (!wallet.unlocked) { toast('PAW LOCKED', 'warn', 5000, { label: 'UNLOCK', run: () => ctx.pact() }); return; }
    const f = empire.players.get(d.id);
    const planetId = f?.planetId || roster.get(d.id)?.planetId;
    if (!planetId) { toast('NO DEN', 'warn'); return; }
    const king = wyrmOf(me);
    if (!king || !alive(king)) { toast('NO KING', 'enemy'); return; }
    if (!king.online) { toast('KING NAPS', 'enemy'); return; }
    const full = skyFull(f?.planet, me);
    if (full) { toast(full, 'enemy'); return; }
    try {
      act.fleetMove(me, planetId);
      audio.pop();
      scene.fx.word('PROWL!', canvas.clientWidth / 2, canvas.clientHeight / 2, '#FFE53B', 70, '#FF2E88');
      toast(`PROWL · ${d.name}`, 'player');
      goTimer = window.setTimeout(() => ctx.go(`#/prowl/${d.id}`), 900);
    } catch (e) { toast((e as Error).message, 'enemy'); }
  }

  function paint() {
    scene.filter = (d) => pass(d);
    keepFocus(el, () => { paintSeg(); paintList(); stable(cardEl, (b) => paintCard(b)); });
  }

  search.addEventListener('input', () => paint());
  // Enter takes the first chief the search shows
  search.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const first = scene.dens.filter((d) => pass(d) && !d.mine).sort((a, b) => b.ore - a.ore)[0]; if (first) { e.preventDefault(); choose(first.id); } });
  const resize = () => { scene.inset = { l: 350, r: cardEl.hidden ? 0 : 370 }; };
  const timer = setInterval(resize, 500);
  // idle times need the chain's height: fill them in once the heartbeat arrives
  let tookAt = 0;
  const offBeat = live.onBlock(() => { if (roster.roster && (!tookAt || Date.now() - tookAt > 60_000)) { tookAt = Date.now(); take(roster.roster); } });
  const offs = [offBeat, roster.onChange(take), empire.onChange(() => { if (sel) stable(cardEl, (b) => paintCard(b)); }), wallet.onChange(paint)];
  paint();
  void load();

  return {
    el, title: 'HUNT',
    leave: () => { gone = true; clearTimeout(goTimer); clearInterval(timer); offs.forEach((f) => f()); scout(null); stage.dispose(); },
  };
}
