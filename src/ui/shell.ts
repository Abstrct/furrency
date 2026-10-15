/* The frame around every screen: the top bar of meters (alpha, shard, glow, pulse, howl), the live
 * heartbeat, the paw button, the rail of places, the deeds feed (every signed action, as it lands)
 * and the Howl drawer (the proof-of-work engine at work). */
import { h, clear, stable } from '../core/dom';
import { glyph, type GlyphName } from './glyphs';
import { empire } from '../game/empire';
import { live } from '../chain/live';
import { pow, type PowTask } from '../pow/pow';
import { howlProgress, howlEtaWord } from '../pow/howl';
import { wallet } from '../wallet/wallet';
import { txq, type TxJob } from '../wallet/queue';
import { enlisting } from '../game/enlist';
import { fmtAlpha, fmtMana, short, tag } from '../lore';
import { audio, ambience } from '../core/audio';
import { grass } from '../grass/grass';
import { clan } from '../net/clan';

const PLACES: [string, string, GlyphName, string][] = [
  ['den', 'DEN', 'den', 'var(--yellow)'],
  ['hunt', 'HUNT', 'hunt', 'var(--cyan)'],
  ['prowl', 'PROWL', 'prowl', 'var(--pink)'],
  ['glow', 'GLOW', 'glow', 'var(--green)'],
  ['kin', 'KIN', 'kin', 'var(--orange)'],
  ['glyphs', 'GLYPHS', 'glyph', 'var(--violet)'],
];

export interface Shell { slot: HTMLElement; setRoute(name: string): void; toggleHowl(open?: boolean): void }

export function mountShell(app: HTMLElement, pact: () => void): Shell {
  const meters = h('div', { class: 'meters', role: 'group', 'aria-label': 'Meters', tabIndex: -1 });
  const liveEl = h('div', { class: 'live connecting', title: 'NET' }, h('i'), h('span', null, 'LIVE'), h('b', { class: 'beat' }, ''));
  const linkDots = h('div', { class: 'links', 'aria-label': 'Links' });
  const sound = h('button', { type: 'button', class: 'ibtn', 'aria-label': 'Sound', onclick: () => { ambience.toggle(); paintSound(); } });
  const paw = h('button', { type: 'button', class: 'paw-btn', onclick: pact });
  const top = h('header', { class: 'top' },
    h('a', { class: 'logo', href: '#/', 'aria-label': 'Furrency' }, h('span', { class: 'logo-coin' }, 'α'), h('span', { class: 'logo-word' }, 'FURRENCY')),
    meters,
    h('div', { class: 'top-r' }, linkDots, liveEl, sound, paw));
  const rail = h('nav', { class: 'rail', 'aria-label': 'Places' });
  const links = new Map<string, HTMLAnchorElement>();
  for (const [key, word, g, c] of PLACES) {
    const a = h('a', { href: `#/${key}`, style: { '--c': c } }, glyph(g, 30, 'currentColor', 2.6), word) as HTMLAnchorElement;
    links.set(key, a);
    rail.append(a);
  }
  // MORE: tucked away at the foot of the rail — the official game, the docs, sound
  const moreMenu = h('div', { class: 'panel dark more-menu', hidden: true, role: 'menu', 'aria-label': 'More' },
    h('a', { class: 'more-item', role: 'menuitem', href: 'https://playstructs.com', target: '_blank', rel: 'noopener' }, glyph('star', 22, '#FFE53B'), h('span', null, 'STRUCTS', h('small', null, 'OFFICIAL GAME')), glyph('out', 16, '#FFF8E7')),
    h('a', { class: 'more-item', role: 'menuitem', href: 'https://structs.ai', target: '_blank', rel: 'noopener' }, glyph('words', 22, '#22E4FF'), h('span', null, 'DOCS', h('small', null, 'STRUCTS.AI')), glyph('out', 16, '#FFF8E7')),
    h('a', { class: 'more-item', role: 'menuitem', href: '#/glyphs' }, glyph('glyph', 22, '#B89BFF'), h('span', null, 'GLYPHS', h('small', null, 'HOW TO PLAY'))),
    h('a', { class: 'more-item', role: 'menuitem', href: '#/' }, glyph('home', 22, '#FF2E88'), h('span', null, 'TITLE', h('small', null, 'BE THE ALPHA'))));
  const moreBtn = h('button', { type: 'button', class: 'rail-more', 'aria-label': 'More', 'aria-haspopup': 'menu', 'aria-expanded': 'false', onclick: (e: Event) => { e.stopPropagation(); setMore(!!moreMenu.hidden); } }, glyph('more', 30, 'currentColor', 4), 'MORE');
  const setMore = (open: boolean) => { moreMenu.hidden = !open; moreBtn.setAttribute('aria-expanded', String(open)); if (open) (moreMenu.querySelector('a') as HTMLElement | null)?.focus(); };
  document.addEventListener('click', (e) => { if (!moreMenu.hidden && !moreMenu.contains(e.target as Node)) setMore(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !moreMenu.hidden) { setMore(false); moreBtn.focus(); } });
  moreMenu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMore(false); });
  rail.append(h('div', { class: 'rail-spacer' }), moreBtn);
  const slot = h('div', { class: 'screen-slot' });
  const deeds = h('div', { class: 'deeds', 'aria-live': 'polite' });
  const howl = h('section', { class: 'panel dark howl', hidden: true, 'aria-label': 'Howl' });
  const view = h('main', { class: 'view' }, slot, deeds, howl, moreMenu);
  app.append(h('div', { class: 'shell' }, top, rail, view));

  /* ── meters ── */
  const last = new Map<string, number>();
  const meter = (key: string, g: GlyphName, value: string, word: string, color: string, raw: number, o: { low?: boolean; title?: string; onclick?: () => void; opt?: boolean; fill?: number } = {}) => {
    const el = h(o.onclick ? 'button' : 'div', { type: o.onclick ? 'button' : null, class: 'meter' + (o.low ? ' low' : '') + (o.opt ? ' opt' : ''), style: { '--c': color }, title: o.title || word, onclick: o.onclick || null, 'aria-label': `${word} ${value}` },
      glyph(g, 22, '#0A0612', 2.8), h('b', null, value), h('small', null, word),
      o.fill != null ? h('i', { class: 'bar', style: { width: `${Math.max(0, Math.min(100, o.fill * 100))}%` } }) : null);
    const was = last.get(key);
    if (was != null && raw > was) { el.classList.add('bump'); if (key === 'alpha') audio.coin(); }
    last.set(key, raw);
    return el;
  };
  function paintMeters() { stable(meters, fillMeters); }
  function fillMeters(meters: HTMLElement) {
    clear(meters);
    const p = empire.commander;
    if (!p) {
      meters.append(meter('alpha', 'alpha', '—', 'ALPHA', 'var(--yellow)', 0), meter('shard', 'shard', '—', 'SHARD', 'var(--pink)', 0), meter('glow', 'glow', '—', 'GLOW', 'var(--cyan)', 0, { opt: true }));
    } else {
      const cap = p.capacity + p.connectionCapacity, load = p.load + p.structsLoad, spare = cap - load;
      const ch = empire.charge(p);
      meters.append(
        meter('alpha', 'alpha', fmtAlpha(p.alpha), 'ALPHA', 'var(--yellow)', Number(p.alpha), { title: 'ALPHA' }),
        meter('shard', 'shard', short(p.ore), 'SHARD', 'var(--pink)', p.ore, { low: p.ore > 0, title: p.ore > 0 ? 'SHARD · CAN BE SNATCHED' : 'SHARD' }),
        meter('glow', 'glow', (spare < 0n ? '−' : '') + fmtMana(spare < 0n ? -spare : spare), 'GLOW', 'var(--cyan)', Number(spare), { low: spare < 0n, title: `GLOW · USE ${fmtMana(load)} · OWN ${fmtMana(p.capacity)} · CLAN SHARE ${fmtMana(p.connectionCapacity)}`, fill: cap > 0n ? Number(load * 1000n / cap) / 1000 : 0 }),
        meter('pulse', 'pulse', ch >= 99 ? 'FULL' : String(ch), 'PULSE', 'var(--paper)', ch, { opt: true, title: 'PULSE' }),
      );
    }
    const tasks = pow.active.length;
    meters.append(meter('howl', 'howl', tasks ? String(tasks) : 'QUIET', 'HOWL', 'var(--violet)', 0, { onclick: () => toggleHowl(), title: tasks ? `HOWL · ${tasks} AT WORK` : 'HOWL · QUIET' }));
  }

  /* ── live heartbeat ── */
  const paintLive = () => {
    liveEl.className = 'live ' + live.state;
    (liveEl.querySelector('span') as HTMLElement).textContent = live.state === 'live' ? 'LIVE' : live.state === 'down' ? 'DOWN' : 'LINK';
    (liveEl.querySelector('.beat') as HTMLElement).textContent = live.height ? `#${live.height.toLocaleString('en-US')}` : '';
  };

  // the three links: the chain node, GRASS (the clan's live feed) and the clan's Guild API
  const paintLinks = () => stable(linkDots, fillLinks);
  const fillLinks = (linkDots: HTMLElement) => {
    const dot = (word: string, state: string, title: string) => h('span', { class: `lk ${state}`, title }, h('i'), word);
    const g = grass.state, c = clan.state;
    linkDots.append(
      dot('SCENT', g === 'live' ? 'on' : g === 'connecting' ? 'wait' : g === 'idle' ? 'off' : 'bad', `SCENT ${g === 'live' ? 'LIVE' : g === 'connecting' ? 'SNIFFING' : 'GONE'}`),
      dot('CLAN', c === 'on' ? (clan.lag > 4 ? 'wait' : 'on') : c === 'signing' ? 'wait' : c === 'failed' ? 'bad' : 'off', `CLAN ${c === 'on' ? 'LINKED' : c === 'signing' ? 'LINKING' : 'NOT LINKED'}`));
  };
  grass.onState(paintLinks); clan.onChange(paintLinks); setInterval(paintLinks, 5000);

  const paintSound = () => { clear(sound); sound.append(glyph(ambience.on ? 'sound' : 'mute', 24, '#0A0612')); sound.classList.toggle('on', ambience.on); };

  const paintPaw = () => stable(paw, fillPaw);
  const fillPaw = (paw: HTMLElement) => {
    const a = wallet.active;
    const sworn = !!a?.playerId;
    paw.className = 'paw-btn' + (sworn ? '' : ' new');
    if (wallet.state === 'locked') paw.append(glyph('lock', 22, '#0A0612'), h('span', null, 'UNLOCK'));
    else if (sworn) paw.append(glyph('paw', 22, '#0A0612'), h('span', null, (a?.label || 'CHIEF').toUpperCase()));
    else if (enlisting.running) paw.append(glyph('wait', 22, '#FFF8E7'), h('span', null, 'JOINING'));
    else paw.append(glyph('paw', 22, '#FFF8E7'), h('span', null, 'JOIN'));
  };

  /* ── deeds feed ── */
  const recent = new Map<string, { job: TxJob; until: number }>();
  const paintDeeds = (jobs: TxJob[]) => {
    const now = Date.now();
    for (const j of jobs) if ((j.status === 'success' || j.status === 'failed') && now - j.updatedAt < 6000 && j.source !== 'pow') recent.set(j.id, { job: j, until: j.updatedAt + 6000 });
    for (const [k, v] of recent) if (v.until < now) recent.delete(k);
    const act = jobs.filter((j) => ['queued', 'waiting', 'signing', 'pending'].includes(j.status));
    const show = [...act, ...[...recent.values()].map((r) => r.job).filter((j) => !act.includes(j))].slice(-5);
    // patched in place: a deed already showing never slides in again
    stable(deeds, (deeds) => { for (const j of show) {
      const st = j.status === 'success' ? glyph('done', 18, '#7CFF6B') : j.status === 'failed' ? glyph('warn', 18, '#FF2E88') : j.status === 'pending' || j.status === 'signing' ? glyph('howl', 18, '#22E4FF') : glyph('wait', 18, '#FFE53B');
      deeds.append(h('div', { class: `deed ${j.status === 'signing' ? 'pending' : j.status}`, title: j.error || j.waitReason || j.label },
        h('span', { class: 'st' }, st), h('span', { class: 'lbl' }, j.label), j.status === 'failed' ? h('span', { class: 'refusal', style: { fontSize: '15px', padding: '0 6px' } }, tag(j.error)) : j.status === 'waiting' && j.waitReason ? h('small', { class: 'tag', style: { color: '#FFE53B' } }, tag(j.waitReason)) : null));
    } });
  };
  setInterval(() => paintDeeds(txq.jobs), 1500);

  /* ── the Howl drawer ── */
  let howlOpen = false;
  function toggleHowl(open?: boolean) { howlOpen = open ?? !howlOpen; howl.hidden = !howlOpen; if (howlOpen) paintHowl(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && howlOpen && !document.querySelector('.veil')) toggleHowl(false); });
  function paintHowl() { if (howlOpen) stable(howl, fillHowl); }
  function fillHowl(howl: HTMLElement) {
    clear(howl);
    const tasks = pow.active;
    const s = pow.settings;
    howl.append(
      h('div', { class: 'dlg-head' }, h('h2', { style: { color: 'var(--violet)' } }, 'HOWL'), h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: () => toggleHowl(false) }, glyph('close', 20, '#FFF8E7'))),
      h('div', { class: 'row', style: { marginBottom: '8px' } },
        pow.rate > 0 ? h('span', { class: 'chip', style: { color: 'var(--violet)' } }, 'AWOOO') : null,
        h('span', { class: 'chip', style: { color: 'var(--cyan)' } }, `${s.threads} ${s.threads === 1 ? 'VOICE' : 'VOICES'}`),
        pow.gpu.available ? h('span', { class: 'chip', style: { color: 'var(--green)' } }, 'GPU') : null),
      h('div', { class: 'row', style: { marginBottom: '10px' } },
        h('button', { type: 'button', class: 'cbtn small ' + (s.enabled ? 'violet' : 'paper'), onclick: () => { pow.save({ enabled: !s.enabled }); paintHowl(); } }, glyph(s.enabled ? 'howl' : 'nap', 18, '#0A0612'), s.enabled ? 'ON' : 'OFF'),
        h('button', { type: 'button', class: 'cbtn small', 'aria-label': 'Fewer paws', onclick: () => { pow.save({ threads: Math.max(1, s.threads - 1) }); paintHowl(); } }, '−'),
        h('button', { type: 'button', class: 'cbtn small', 'aria-label': 'More paws', onclick: () => { pow.save({ threads: Math.min(16, s.threads + 1) }); paintHowl(); } }, '+')),
      tasks.length ? '' : h('p', { class: 'boomtxt', style: { fontSize: '24px', margin: '6px 0', color: 'var(--paper)' } }, 'QUIET'),
      ...tasks.map(taskRow));
  }
  function taskRow(t: PowTask) {
    const frac = howlProgress(t);
    const eta = howlEtaWord(t);
    const g: GlyphName = t.kind === 'build' ? 'call' : t.kind === 'mine' ? 'dig' : t.kind === 'refine' ? 'forge' : 'snatch';
    const color = t.kind === 'build' ? 'var(--cyan)' : t.kind === 'mine' ? 'var(--orange)' : t.kind === 'refine' ? 'var(--yellow)' : 'var(--pink)';
    const st = t.waits ? tag(t.waits) : t.status === 'submitting' ? 'SEND' : t.status === 'hashing' ? 'AWOO' : t.error ? tag(t.error) : 'GATHER';
    return h('div', { class: 'task' },
      glyph(g, 26, color),
      h('div', null, h('div', { class: 'nm' }, t.label.replace(/^HOWL · /, '')), h('div', { class: 'st', style: { color } }, `${st}${eta ? ` · ${eta}` : ''}`)),
      h('b', { class: 'boomtxt', style: { fontSize: '22px' } }, `${Math.round(frac * 100)}%`),
      h('div', { class: 'bar', style: { '--c': color } }, h('i', { style: { width: `${frac * 100}%` } })));
  }

  empire.onChange(paintMeters);
  live.onBlock(() => { paintMeters(); paintLive(); });
  live.onState(paintLive);
  wallet.onChange(() => { paintMeters(); paintPaw(); });
  enlisting.onChange(paintPaw);
  pow.onChange(() => { paintHowl(); });
  setInterval(paintMeters, 4000);
  txq.onChange(paintDeeds);
  ambience.onChange?.(paintSound);
  paintMeters(); paintLive(); paintSound(); paintPaw();

  return {
    slot,
    toggleHowl,
    setRoute(name: string) {
      for (const [k, a] of links) { a.classList.toggle('on', k === name); if (k === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
    },
  };
}
