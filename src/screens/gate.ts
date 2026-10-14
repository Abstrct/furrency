/* The Gate: the title. A Sun Lion roars in the middle of a speed-line burst while kin orbit and
 * alpha coins rain; every deed anyone does on the network right now pops up as a comic word, and
 * the ticker names it. */
import { h, clear } from '../core/dom';
import type { Ctx, Screen } from './types';
import { mountStage, type Scene } from '../art/stage';
import { Fx } from '../art/fx';
import { INK, burst, halftone, letter, speedLines, FONT_TITLE, FONT_BOOM } from '../art/ink';
import { drawKin } from '../art/totem';
import { glyph, type GlyphName } from '../ui/glyphs';
import { live } from '../chain/live';
import { wallet } from '../wallet/wallet';
import { empire } from '../game/empire';
import { wardens, wardenName, type Warden } from '../realm';
import { audio } from '../core/audio';
import { grass } from '../grass/grass';
import { roster } from '../net/roster';
import { beastName } from '../lore';

const ORBIT = [3, 7, 11, 9, 4, 13, 2, 6];
const EVENT_WORD: Record<string, [string, string, GlyphName]> = {
  EventAttack: ['POUNCE', '#FF2E88', 'pounce'],
  EventOreMine: ['DIG', '#FF7A1A', 'dig'],
  EventAlphaRefine: ['FORGE', '#FFE53B', 'forge'],
  EventOreTheft: ['SNATCH', '#FF2E88', 'snatch'],
  EventRaid: ['PROWL', '#22E4FF', 'prowl'],
  EventHashSuccess: ['HOWL', '#B89BFF', 'howl'],
  EventPlanet: ['ROAM', '#7CFF6B', 'roam'],
  EventPlayer: ['CHIEF', '#FFE53B', 'paw'],
};

export function gate(ctx: Ctx): Screen {
  const canvas = h('canvas', { class: 'stage' }) as HTMLCanvasElement;
  const run = h('div', { class: 'run' });
  const ticker = h('div', { class: 'ticker', 'aria-label': 'Live' }, run);
  const ui = h('div', { class: 'gate-ui' });
  const stats = h('div', { class: 'gate-stats' });
  const foot = h('nav', { class: 'gate-foot', 'aria-label': 'Structs' },
    h('a', { href: 'https://playstructs.com', target: '_blank', rel: 'noopener' }, 'STRUCTS ↗'),
    h('a', { href: 'https://structs.ai', target: '_blank', rel: 'noopener' }, 'DOCS ↗'));
  const el = h('div', { class: 'screen' }, canvas, ticker, ui, stats, foot);

  const fx = new Fx();
  let roar = 0;
  const scene: Scene = {
    draw(c, w, h2, t, dt) {
      const g = c.createRadialGradient(w * 0.66, h2 * 0.55, 10, w * 0.66, h2 * 0.55, Math.max(w, h2) * 0.8);
      g.addColorStop(0, '#FF2E88'); g.addColorStop(0.35, '#7A3CFF'); g.addColorStop(1, '#140C2B');
      c.fillStyle = g; c.fillRect(0, 0, w, h2);
      const pat = halftone(c, INK, 11, 2.2, 0.28);
      if (pat) { c.fillStyle = pat; c.fillRect(0, 0, w, h2); }
      const cx = w > 900 ? w * 0.69 : w * 0.5, cy = h2 * (w > 900 ? 0.6 : 0.56);
      const R = Math.min(w, h2) * 0.5;
      c.save(); c.translate(cx, cy); c.rotate(t * 0.04); c.translate(-cx, -cy);
      speedLines(c, cx, cy, R * 0.55, Math.max(w, h2), 54, 'rgba(255,229,59,0.32)', 4, 1.6);
      c.restore();
      // orbiting kin
      const size = Math.max(60, R * 0.28);
      const back: [number, number, number, number][] = [], front: [number, number, number, number][] = [];
      ORBIT.forEach((type, i) => {
        const a = t * 0.22 + (i / ORBIT.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * R * 1.05, y = cy - R * 0.1 + Math.sin(a) * R * 0.36;
        (Math.sin(a) < 0 ? back : front).push([type, x, y + size * 0.5, 0.7 + 0.3 * (Math.sin(a) + 1) / 2]);
      });
      const kin = ([type, x, y, k]: [number, number, number, number]) => drawKin(c, type, x, y, size * k, { t, seed: type * 11 });
      back.sort((a, b) => a[2] - b[2]).forEach(kin);
      // the Sun Lion
      roar = Math.max(0, roar - dt * 1.5);
      const ls = R * (w > 900 ? 0.82 : 0.7) * (1 + roar * 0.08);
      burst(c, cx, cy - ls * 0.62, ls * 0.62, '#FFE53B', 16, 6, 4, t * 0.1);
      drawKin(c, 1, cx, cy + ls * 0.38, ls, { t, seed: 1, crown: true, lunge: roar });
      front.sort((a, b) => a[2] - b[2]).forEach(kin);
      // coins falling
      for (let i = 0; i < 14; i++) {
        const x = ((i * 0.137 + Math.sin(i * 7.1) * 0.05) % 1) * w, y = ((t * (0.05 + (i % 5) * 0.012) + i * 0.173) % 1.2 - 0.1) * h2;
        c.save(); c.translate(x, y); c.scale(Math.abs(Math.cos(t * 2 + i)), 1);
        c.fillStyle = '#FFE53B'; c.strokeStyle = INK; c.lineWidth = 4;
        c.beginPath(); c.arc(0, 0, 13, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = INK; c.font = `16px ${FONT_TITLE}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('α', 0, 1);
        c.restore();
      }
      // the title
      const ts = Math.min(w * (w > 900 ? 0.11 : 0.17), 168);
      c.save();
      c.translate(w > 900 ? w * 0.05 : w * 0.06, h2 * (w > 900 ? 0.2 : 0.16));
      c.rotate(-0.06);
      letter(c, 'FUR', 0, 0, ts, '#FFE53B', { font: FONT_TITLE, align: 'left', shadow: '#FF2E88', outline: ts * 0.05 });
      letter(c, 'RENCY', 0, ts * 0.92, ts, '#FFE53B', { font: FONT_TITLE, align: 'left', shadow: '#FF2E88', outline: ts * 0.05 });
      c.restore();
      const words: [string, string][] = [['DIG', '#22E4FF'], ['FORGE', '#FF7A1A'], ['POUNCE', '#FF2E88'], ['HOWL', '#FFF8E7']];
      let x = w > 900 ? w * 0.055 : w * 0.06;
      const wy = h2 * (w > 900 ? 0.2 : 0.16) + ts * 1.75;
      c.font = `${Math.min(40, ts * 0.27)}px ${FONT_BOOM}`;
      for (const [word, col] of words) {
        const ww = c.measureText(word).width + 26, hh = Math.min(52, ts * 0.36);
        c.save(); c.translate(x, wy); c.rotate(-0.06);
        c.fillStyle = INK; c.fillRect(5, 5, ww, hh);
        c.fillStyle = col; c.fillRect(0, 0, ww, hh); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(0, 0, ww, hh);
        c.fillStyle = INK; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(word, ww / 2, hh / 2 + 2);
        c.restore();
        x += ww + 12;
      }
      c.save();
      c.translate(w > 900 ? w * 0.055 : w * 0.06, wy + Math.min(52, ts * 0.36) + Math.min(46, ts * 0.32));
      c.rotate(-0.06);
      letter(c, 'BE THE ALPHA', 0, 0, Math.min(44, ts * 0.3), '#FFF8E7', { font: FONT_TITLE, align: 'left', shadow: '#0A0612', outline: 3 });
      c.restore();
      fx.draw(c, dt);
    },
    pick() { roar = 1; fx.word('ROAR!', canvas.clientWidth * 0.66, canvas.clientHeight * 0.3, '#FFE53B', 70, '#FF2E88'); audio.howl(0.12); },
  };
  const stage = mountStage(canvas, scene);

  function paintUi() {
    clear(ui);
    const sworn = !!wallet.active?.playerId;
    if (sworn) ui.append(h('div', { class: 'row' },
      h('a', { class: 'cbtn big yellow', href: '#/den' }, glyph('den', 34, '#0A0612'), 'ENTER DEN'),
      h('a', { class: 'cbtn big cyan', href: '#/hunt' }, glyph('hunt', 34, '#0A0612'), 'HUNT')));
    else ui.append(h('div', { class: 'row' },
      h('button', { type: 'button', class: 'cbtn big pink', onclick: () => ctx.pact() }, glyph('paw', 34, '#FFF8E7'), 'JOIN'),
      h('a', { class: 'cbtn big', href: '#/hunt' }, glyph('eye', 34, '#0A0612'), 'PEEK')));
    ui.append(h('div', { class: 'row' },
      h('a', { class: 'cbtn small violet', href: '#/glyphs' }, glyph('glyph', 18, '#0A0612'), 'GLYPHS'),
      h('a', { class: 'cbtn small orange', href: '#/kin' }, glyph('kin', 18, '#0A0612'), 'KIN')));
  }

  let chiefs: Warden[] = [];
  const names = new Map<string, string>();
  function paintStats() {
    clear(stats);
    const card = (g: GlyphName, v: string, word: string, c: string) => h('div', { class: 'card', style: { '--c': c } }, h('div', { class: 'row', style: { gap: '6px' } }, glyph(g, 22, '#0A0612'), h('small', null, word)), h('b', null, v));
    const nChiefs = roster.roster?.chiefs.length || chiefs.length;
    stats.append(card('paw', nChiefs ? (nChiefs >= 400 && !roster.roster ? '400+' : nChiefs.toLocaleString('en-US')) : '…', 'CHIEFS', 'var(--yellow)'),
      card('live', live.height ? `#${live.height.toLocaleString('en-US')}` : '…', 'BEAT', 'var(--cyan)'));
    const me = empire.commander;
    if (me) stats.append(card('alpha', (Number(me.alpha) / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 }), 'YOUR ALPHA', 'var(--pink)'));
  }
  wardens().then((w) => { chiefs = w; for (const x of w) names.set(x.id, wardenName(x)); paintStats(); }).catch(() => { /* quiet */ });

  /* the ticker: what the whole network is doing */
  const said: HTMLElement[] = [];
  const say = (g: GlyphName, color: string, word: string, who: string) => {
    const s = h('span', null, glyph(g, 20, color), h('b', { style: { color } }, word), who ? h('span', { style: { color: '#FFF8E7' } }, who) : '');
    said.push(s);
    run.append(s);
    while (said.length > 24) said.shift()?.remove();
  };
  say('live', '#7CFF6B', 'LIVE', '');
  // GRASS, when it is live, tells the network's story better (who raided whom, who mined, who forged)
  const GRASS_WORD: Record<string, [string, string, GlyphName]> = {
    struct_attack: ['POUNCE', '#FF2E88', 'pounce'], raid_status: ['PROWL', '#22E4FF', 'prowl'], fleet_arrive: ['PROWL', '#22E4FF', 'prowl'],
    mined: ['DIG', '#FF7A1A', 'dig'], refined: ['FORGE', '#FFE53B', 'forge'], seized: ['SNATCH', '#FF2E88', 'snatch'], infused: ['FEED', '#7CFF6B', 'feed'],
    struct_block_build_start: ['CALL', '#22E4FF', 'call'], player_consensus: ['CHIEF', '#FFE53B', 'paw'],
  };
  const offGrass = grass.on({ kind: ['planet', 'inventory', 'player'] }, (e) => {
    const key = e.kind === 'inventory' ? String(e.data.action || e.category) : e.category;
    const m = GRASS_WORD[key];
    if (!m) return;
    if (key === 'raid_status' && e.detail.status !== 'raidSuccessful') return;
    const pid = String(e.detail.attackerPlayerId || e.playerId || '');
    const who = roster.get(pid)?.name?.toUpperCase() || names.get(pid) || '';
    say(m[2], m[1], m[0], who);
    const w = canvas.clientWidth, hh = canvas.clientHeight;
    if (fx.bits.length < 8) fx.word(m[0] + '!', w * (0.45 + Math.random() * 0.5), hh * (0.25 + Math.random() * 0.55), '#FFF8E7', 40 + Math.random() * 16, m[1]);
  });
  void roster.load().catch(() => { /* names fall back */ });
  const offTx = live.onTx((tx) => {
    if (grass.state === 'live') return;
    let shown = 0;
    for (const e of tx.events) {
      const m = EVENT_WORD[e.type];
      if (!m || shown > 1) continue;
      shown++;
      const d = (e.data && typeof e.data === 'object' ? Object.values(e.data)[0] : null) as Record<string, unknown> | null;
      const pid = String(d?.attackerPlayerId || d?.playerId || d?.thiefPlayerId || d?.owner || '');
      const who = names.get(pid) || '';
      const tid = Number((d as { attackerStructTypeId?: unknown })?.attackerStructTypeId || 0);
      say(m[2], m[1], m[0], who + (tid ? ` · ${beastName(tid)}` : ''));
      const w = canvas.clientWidth, hh = canvas.clientHeight;
      if (fx.bits.length < 8) fx.word(m[0] + '!', w * (0.45 + Math.random() * 0.5), hh * (0.25 + Math.random() * 0.55), '#FFF8E7', 40 + Math.random() * 16, m[1]);
    }
  });
  const offBlock = live.onBlock(() => paintStats());
  const offW = wallet.onChange(paintUi);
  const offE = empire.onChange(paintStats);
  const offR = roster.onChange(() => paintStats());
  paintUi(); paintStats();

  return { el, title: '', leave: () => { stage.dispose(); offTx(); offGrass(); offR(); offBlock(); offW(); offE(); } };
}
