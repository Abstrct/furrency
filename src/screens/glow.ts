/* Glow: where alpha becomes power. Every clan keeps a sun (the chain's reactors); feed alpha to one
 * and your den's glow rises, pull it back and it falls. Your link (substation) and your glow meter
 * are read live. FEED and PULL sign MsgReactorInfuse / MsgReactorDefuse. */
import { h, toast, confirmBox, keepFocus, modal, stable } from '../core/dom';
import type { Ctx, Screen } from './types';
import { mountStage, type Scene } from '../art/stage';
import { INK, burst, halftone, letter, speedLines, FONT_TITLE } from '../art/ink';
import { Fx } from '../art/fx';
import { glyph } from '../ui/glyphs';
import { lcd, big, type Grid, type RawInfusion, type RawReactor } from '../chain/lcd';
import { guilds, type GuildEntry } from '../guild/directory';
import { empire, type PlayerState } from '../game/empire';
import { wallet } from '../wallet/wallet';
import { txq } from '../wallet/queue';
import { clanColor, clanName, fmtAlpha, fmtMana } from '../lore';
import { audio } from '../core/audio';

interface Sun { r: RawReactor; grid: Grid; commission: number }
const M = (name: string, value: Record<string, unknown>) => ({ typeUrl: `/structs.structs.${name}`, value });

export function glow(ctx: Ctx): Screen {
  const canvas = h('canvas', { class: 'stage', style: { position: 'absolute' } }) as HTMLCanvasElement;
  const mine = h('div', { class: 'grid' });
  const suns = h('div', { class: 'grid' });
  const el = h('div', { class: 'screen scrolls' },
    h('section', { style: { position: 'relative', height: '300px', overflow: 'hidden', borderBottom: '5px solid var(--ink)' } }, canvas,
      h('div', { style: { position: 'absolute', left: '24px', bottom: '22px', zIndex: '2' } }, h('h1', { class: 'h1' }, 'GLOW'),
        h('p', { class: 'boomtxt', style: { fontSize: '26px', margin: '8px 0 0', color: 'var(--paper)', textShadow: '3px 3px 0 #0A0612' } }, 'ALPHA → SUN → GLOW'))),
    h('div', { class: 'page', style: { paddingTop: '10px' } },
      h('h2', { class: 'h2' }, glyph('glow', 34, '#22E4FF'), 'YOUR GLOW'), mine,
      h('h2', { class: 'h2' }, glyph('sun', 34, '#FFE53B'), 'CLAN SUNS'), suns));

  const fx = new Fx();
  let rate = 0.4;
  const scene: Scene = {
    draw(c, w, hh, t, dt) {
      c.fillStyle = '#140C2B'; c.fillRect(0, 0, w, hh);
      const g = c.createRadialGradient(w * 0.7, hh * 0.5, 10, w * 0.7, hh * 0.5, w * 0.6);
      g.addColorStop(0, '#FFB627'); g.addColorStop(0.4, '#FF2E88'); g.addColorStop(1, '#140C2B');
      c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const pat = halftone(c, INK, 10, 2, 0.3);
      if (pat) { c.fillStyle = pat; c.fillRect(0, 0, w, hh); }
      c.save(); c.translate(w * 0.7, hh * 0.5); c.rotate(t * 0.08 * (1 + rate)); c.translate(-w * 0.7, -hh * 0.5);
      speedLines(c, w * 0.7, hh * 0.5, 80, w, 40, 'rgba(255,229,59,0.4)', 3, 1.4);
      c.restore();
      const pulse = 1 + Math.sin(t * (2 + rate * 2)) * 0.05;
      burst(c, w * 0.7, hh * 0.5, 96 * pulse, '#FFE53B', 14, 6, 2, t * 0.2);
      burst(c, w * 0.7, hh * 0.5, 62 * pulse, '#FFF8E7', 10, 5, 5, -t * 0.3);
      letter(c, 'α', w * 0.7, hh * 0.5 + 4, 60, '#FF2E88', { font: FONT_TITLE, shadow: 'none' });
      // glow streams flowing out to little dens
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI * 0.9 + i * 0.36;
        const ex = w * 0.7 + Math.cos(a) * w * 0.32, ey = hh * 0.5 + Math.sin(a) * hh * 0.42 + hh * 0.3;
        c.save(); c.strokeStyle = '#22E4FF'; c.lineWidth = 4; c.setLineDash([10, 12]); c.lineDashOffset = -t * 60 * (0.5 + rate); c.shadowColor = '#22E4FF'; c.shadowBlur = 10;
        c.beginPath(); c.moveTo(w * 0.7, hh * 0.5); c.quadraticCurveTo((w * 0.7 + ex) / 2, Math.min(hh * 0.5, ey) - 60, ex, ey); c.stroke();
        c.restore();
      }
      fx.draw(c, dt);
    },
    pick(_hit, x, y) { fx.word('GLOW!', x, y, '#0A0612', 50, '#22E4FF'); audio.zap(); },
  };
  const stage = mountStage(canvas, scene, 'glow');

  let list: Sun[] = [];
  let feeds: RawInfusion[] = [];
  let link: Grid | null = null;
  let clans = new Map<string, GuildEntry>();
  let loaded = false, failed = false, left = false, gen = 0;
  const name = (gid: string) => clanName(gid, clans.get(gid)?.meta?.name);

  async function load() {
    const g = ++gen;
    const p = empire.commander;
    const [rs, inf, gs, sub] = await Promise.all([
      lcd.list<RawReactor>('reactor', 'Reactor'),
      p ? lcd.list<RawInfusion>('infusion', 'Infusion').catch(() => [] as RawInfusion[]) : Promise.resolve([] as RawInfusion[]),
      guilds().catch(() => [] as GuildEntry[]),
      p?.substationId ? lcd.entity<{ gridAttributes?: Grid }>('substation', p.substationId).then((r) => r.gridAttributes || {}).catch(() => null) : Promise.resolve(null),
    ]);
    const grids = await Promise.all(rs.map((r) => lcd.entity<{ gridAttributes?: Grid }>('reactor', r.id).then((x) => x.gridAttributes || {}).catch(() => ({} as Grid))));
    if (left || g !== gen) return;
    clans = new Map(gs.map((c) => [c.id, c]));
    list = rs.map((r, i) => ({ r, grid: grids[i], commission: Number(r.defaultCommission || 0) })).sort((a, b) => Number(big(b.grid.fuel) - big(a.grid.fuel)));
    feeds = p ? inf.filter((i) => i.address === p.address && i.destinationType === 'reactor') : [];
    link = sub; loaded = true; failed = false;
    paint();
  }

  function guard(): PlayerState | null {
    const p = empire.commander;
    if (!p) { toast('NO CHIEF', 'warn', 5000, { label: 'JOIN', run: () => ctx.pact() }); return null; }
    if (!wallet.unlocked) { toast('PAW LOCKED', 'warn', 5000, { label: 'UNLOCK', run: () => ctx.pact() }); return null; }
    return p;
  }

  function feedDialog(s: Sun, pull = false) {
    const p = guard(); if (!p) return;
    const fed = big(feeds.find((f) => f.destinationId === s.r.id)?.fuel);
    const max = pull ? fed : p.alpha;
    if (!pull && max <= 0n) { toast('NO ALPHA · FORGE FIRST', 'warn', 5000, { label: 'DEN', run: () => ctx.go('#/den') }); return; }
    const amt = h('input', { id: 'feed-amt', type: 'number', min: '0.000001', step: '0.1', value: '1', inputMode: 'decimal' }) as HTMLInputElement;
    const preview = h('p', { class: 'boomtxt', style: { fontSize: '22px', minHeight: '28px', margin: '6px 0' } });
    const upd = () => {
      const u = BigInt(Math.max(0, Math.round(Number(amt.value || 0) * 1e6)));
      const yours = BigInt(Math.round(Number(u) * (1 - s.commission)));
      preview.textContent = u > max ? `MAX ${fmtAlpha(max)} α` : pull ? `−${fmtMana(yours)} GLOW · SLOW` : `+${fmtMana(yours)} GLOW · ${(s.commission * 100).toFixed(0)}% TO SUN`;
      preview.style.color = u > max ? 'var(--pink)' : '';
    };
    amt.addEventListener('input', upd); upd();
    const veil = h('div', { class: 'veil', onclick: (e: Event) => { if (e.target === veil) veil.remove(); } }, h('section', { class: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': pull ? 'Pull' : 'Feed' },
      h('div', { class: 'dlg-head' }, h('h2', { style: { color: pull ? 'var(--pink)' : 'var(--orange)' } }, `${pull ? 'PULL' : 'FEED'} · ${name(s.r.guildId)}`), h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: () => veil.remove() }, glyph('close', 20, '#FFF8E7'))),
      h('div', { class: 'row' }, glyph('alpha', 32, '#0A0612'), h('span', { class: 'big-num' }, fmtAlpha(max)), h('span', { class: 'tag' }, pull ? 'FED HERE' : 'HAVE')),
      h('div', { class: 'field' }, h('label', { for: 'feed-amt' }, 'ALPHA'), amt), preview,
      h('div', { class: 'row end' },
        h('button', { type: 'button', class: 'cbtn paper', onclick: () => veil.remove() }, 'NO'),
        h('button', { type: 'button', class: pull ? 'cbtn pink' : 'cbtn orange', onclick: async () => {
          const u = BigInt(Math.round(Number(amt.value || 0) * 1e6));
          if (u <= 0n || u > max) return;
          if (pull && !(await confirmBox('PULL?', ['GLOW DROPS NOW', 'ALPHA BACK · SLOW'], 'PULL'))) return;
          veil.remove();
          try {
            const job = txq.enqueue(M(pull ? 'MsgReactorDefuse' : 'MsgReactorInfuse', { delegator_address: p.address, validator_address: s.r.validator, amount: { denom: 'ualpha', amount: u.toString() } }),
              { account: p.account, playerId: p.playerId, label: `${pull ? 'PULL' : 'FEED'} · ${fmtAlpha(u)} α · ${name(s.r.guildId)}`, source: 'you' });
            audio.coin();
            fx.fly('coin', 60, 260, canvas.clientWidth * 0.7, 150, 8);
            const off = txq.onSettled((j) => { if (j.id !== job.id || j.status === 'failed') return; off(); if (j.status === 'success' && !left) { fx.word('GLOW!', canvas.clientWidth * 0.7, 100, '#0A0612', 64, '#22E4FF'); setTimeout(() => { if (!left) void load(); }, 1200); } });
            offs.push(off);
          } catch (e) { toast((e as Error).message, 'enemy'); }
        } }, glyph(pull ? 'pull' : 'feed', 20, pull ? '#FFF8E7' : '#0A0612'), pull ? 'PULL' : 'FEED'))));
    document.body.append(veil);
    modal(veil, () => amt);
    setTimeout(() => amt.select(), 60);
  }

  const card = (c: string, g: Parameters<typeof glyph>[0], word: string, big2: string, rows: (Node | string | null)[]) =>
    h('section', { class: 'card', style: { '--c': c } }, h('div', { class: 'row', style: { gap: '8px' } }, glyph(g, 26, '#0A0612'), h('span', { class: 'tag' }, word)), h('div', { class: 'big-num' }, big2), ...rows);

  function paintMine() { stable(mine, fillMine); }
  function fillMine(mine: HTMLElement) {
    const p = empire.commander;
    if (!p) { mine.append(card('var(--pink)', 'paw', 'CHIEF', 'NONE', [h('button', { type: 'button', class: 'cbtn pink', onclick: () => ctx.pact() }, glyph('paw', 20, '#FFF8E7'), 'JOIN')])); return; }
    const cap = p.capacity + p.connectionCapacity, load = p.load + p.structsLoad;
    const fed = feeds.reduce((a, f) => a + big(f.fuel), 0n);
    rate = cap > 0n ? Math.min(2.5, Number(load * 100n / cap) / 40) : 0.2;
    mine.append(
      card('var(--cyan)', 'glow', 'SPARE GLOW', cap >= load ? fmtMana(cap - load) : `−${fmtMana(load - cap)}`, [
        h('div', { class: 'bar', style: { '--c': p.online ? 'var(--cyan)' : 'var(--pink)' } }, h('i', { style: { width: `${cap > 0n ? Math.min(100, Number(load * 100n / cap)) : 0}%` } })),
        h('span', { class: 'tag' }, `USE ${fmtMana(load)} · HAVE ${fmtMana(cap)}`),
        h('span', { class: 'tag' }, `OWN ${fmtMana(p.capacity)} · CLAN SHARE ${fmtMana(p.connectionCapacity)}`),
        p.connectionCapacity > 0n ? h('span', { class: 'chip', style: { color: '#0a7a9a' } }, 'CLAN SHARE · SPLIT') : null,
        p.online ? null : h('span', { class: 'refusal' }, 'LOW GLOW · KIN NAP')]),
      card('var(--green)', 'clan', 'LINK', link ? `${link.connectionCount || 0} DENS` : p.substationId ? '…' : 'NONE', [h('span', { class: 'tag' }, link ? `EACH UP TO ${fmtMana(big(link.connectionCapacity))}` : 'CLAN LINK')]),
      card('var(--yellow)', 'feed', 'YOUR FEED', `${fmtAlpha(fed)} α`, [h('span', { class: 'tag' }, feeds.length ? `${feeds.length} SUN${feeds.length > 1 ? 'S' : ''}` : 'NOTHING FED')]),
      card('var(--pink)', 'alpha', 'ALPHA', fmtAlpha(p.alpha), [h('span', { class: 'tag' }, p.alpha > 0n ? 'READY TO FEED' : 'FORGE FIRST')]));
  }

  function paintSuns() { stable(suns, fillSuns); }
  function fillSuns(suns: HTMLElement) {
    if (!loaded) { suns.append(h('p', { class: 'boomtxt', style: { fontSize: '24px' } }, 'LOOKING…')); return; }
    if (failed && !list.length) { suns.append(h('span', { class: 'refusal' }, 'NET DOWN')); return; }
    const me = empire.commander;
    const ours = me ? clans.get(me.guildId)?.chain?.primaryReactorId : undefined;
    for (const s of list) {
      const c = clanColor(s.r.guildId);
      const fedHere = feeds.find((f) => f.destinationId === s.r.id);
      suns.append(h('section', { class: 'card', style: { '--c': c } },
        h('div', { class: 'row between' }, h('h3', null, name(s.r.guildId)), h('span', { style: { width: '26px', height: '26px', background: c, border: '4px solid var(--ink)', transform: 'rotate(45deg)' } })),
        ours === s.r.id ? h('span', { class: 'chip fill', style: { '--c': 'var(--yellow)' } }, glyph('clan', 14, '#0A0612'), 'YOUR CLAN') : null,
        h('dl', { class: 'facts', style: { color: 'var(--ink)' } },
          h('div', null, h('dt', null, 'FED'), h('dd', null, `${fmtAlpha(big(s.grid.fuel))} α`)),
          h('div', null, h('dt', null, 'CUT'), h('dd', null, `${(s.commission * 100).toFixed(0)}%`)),
          h('div', null, h('dt', null, 'GLOW'), h('dd', null, fmtMana(big(s.grid.capacity) || big(s.grid.power)))),
          h('div', null, h('dt', null, 'YOURS'), h('dd', { style: { color: fedHere ? '#c0156a' : '' } }, fedHere ? `${fmtAlpha(big(fedHere.fuel))} α` : '—'))),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'cbtn small orange', onclick: () => feedDialog(s) }, glyph('feed', 18, '#0A0612'), 'FEED'),
          fedHere ? h('button', { type: 'button', class: 'cbtn small paper', onclick: () => feedDialog(s, true) }, glyph('pull', 18, '#0A0612'), 'PULL') : null)));
    }
  }

  function paint() { if (!left) keepFocus(el, () => { paintMine(); paintSuns(); }); }
  const offs: (() => unknown)[] = [empire.onChange(paint)];
  let retry = 0;
  const read = (): void => { load().catch(() => { if (left) return; loaded = true; failed = true; paint(); clearTimeout(retry); retry = window.setTimeout(read, 9000); }); };
  paint(); read();
  return { el, title: 'GLOW', leave: () => { left = true; clearTimeout(retry); offs.forEach((f) => f()); stage.dispose(); document.querySelectorAll('.veil').forEach((v) => v.remove()); } };
}
