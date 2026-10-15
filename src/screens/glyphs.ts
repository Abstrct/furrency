/* Glyphs: every sign in the game, and the whole game told as three comic strips of signs. */
import { h } from '../core/dom';
import type { Ctx, Screen } from './types';
import { glyph, type GlyphName } from '../ui/glyphs';
import { kinIcon } from '../ui/portrait';

const TILES: [GlyphName, string, string, string][] = [
  ['alpha', 'ALPHA', 'COIN · SAFE', 'var(--yellow)'],
  ['shard', 'SHARD', 'RAW · STEALABLE', 'var(--pink)'],
  ['glow', 'GLOW', 'POWER', 'var(--cyan)'],
  ['pulse', 'PULSE', 'READY · REFILLS', 'var(--paper)'],
  ['live', 'SCENT', 'LIVE NEWS', 'var(--green)'],
  ['howl', 'HOWL', 'WORK · AWOO', 'var(--violet)'],
  ['dig', 'DIG', 'GROUND → SHARD', 'var(--orange)'],
  ['forge', 'FORGE', 'SHARD → ALPHA', 'var(--yellow)'],
  ['call', 'CALL', 'NEW KIN', 'var(--pink)'],
  ['wake', 'WAKE', 'ON', 'var(--yellow)'],
  ['nap', 'NAP', 'OFF · SAVE GLOW', 'var(--cyan)'],
  ['pounce', 'POUNCE', 'HIT', 'var(--pink)'],
  ['prowl', 'PROWL', 'PACK GOES', 'var(--cyan)'],
  ['snatch', 'SNATCH', 'TAKE SHARD', 'var(--orange)'],
  ['guard', 'GUARD', 'BLOCK FOR', 'var(--paper)'],
  ['hide', 'HIDE', 'UNSEEN', 'var(--violet)'],
  ['leap', 'LEAP', 'KING ZONE', 'var(--paper)'],
  ['ward', 'WARD', 'DEN SHIELD', 'var(--violet)'],
  ['feed', 'FEED', 'ALPHA → GLOW', 'var(--orange)'],
  ['roam', 'ROAM', 'NEW DEN', 'var(--orange)'],
  ['king', 'KING', 'PACK LEADER', 'var(--yellow)'],
  ['fur', 'FUR', 'LIFE', 'var(--pink)'],
  ['den', 'DEN', 'HOME', 'var(--yellow)'],
  ['totem', 'TOTEM', 'DEN KIN · STAYS', 'var(--yellow)'],
  ['hunt', 'HUNT', 'FIND PREY', 'var(--cyan)'],
  ['pack', 'PACK', 'YOUR KIN', 'var(--cyan)'],
  ['clan', 'CLAN', 'FRIENDS · GLOW', 'var(--pink)'],
  ['sun', 'SUN', 'CLAN GLOW', 'var(--yellow)'],
  ['paw', 'PAW', 'YOUR KEY', 'var(--paper)'],
  ['star', 'STAR', 'ZONE', 'var(--violet)'],
  ['sky', 'SKY', 'ZONE', 'var(--cyan)'],
  ['root', 'ROOT', 'ZONE', 'var(--green)'],
  ['tide', 'TIDE', 'ZONE', 'var(--blue)'],
];

type Beat = { g?: GlyphName; kin?: number; word: string; c: string };
const STRIPS: [string, string, Beat[]][] = [
  ['GROW', 'var(--yellow)', [
    { kin: 14, word: 'DIG MOLE', c: 'var(--orange)' }, { g: 'dig', word: 'DIG', c: 'var(--orange)' }, { g: 'shard', word: 'SHARD', c: 'var(--pink)' },
    { kin: 15, word: 'FORGE BADGER', c: 'var(--yellow)' }, { g: 'forge', word: 'FORGE', c: 'var(--yellow)' }, { g: 'alpha', word: 'ALPHA!', c: 'var(--yellow)' }]],
  ['FIGHT', 'var(--pink)', [
    { g: 'hunt', word: 'HUNT', c: 'var(--cyan)' }, { g: 'prowl', word: 'PROWL', c: 'var(--cyan)' }, { kin: 1, word: 'THEIR KING', c: 'var(--pink)' },
    { g: 'pounce', word: 'POUNCE', c: 'var(--pink)' }, { g: 'howl', word: 'HOWL', c: 'var(--violet)' }, { g: 'snatch', word: 'SNATCH!', c: 'var(--orange)' }]],
  ['GLOW', 'var(--cyan)', [
    { g: 'alpha', word: 'ALPHA', c: 'var(--yellow)' }, { g: 'feed', word: 'FEED', c: 'var(--orange)' }, { g: 'sun', word: 'CLAN SUN', c: 'var(--yellow)' },
    { g: 'glow', word: 'GLOW', c: 'var(--cyan)' }, { g: 'call', word: 'MORE KIN', c: 'var(--pink)' }, { g: 'pack', word: 'BIG PACK', c: 'var(--yellow)' }]],
];

export function glyphs(_ctx: Ctx): Screen {
  const tiles = h('div', { class: 'codex-grid' }, ...TILES.map(([g, w, was, c]) => h('div', { class: 'gtile', style: { '--c': c } }, glyph(g, 54, '#0A0612', 2.4), h('b', null, w), h('small', null, was))));
  const strips = STRIPS.map(([title, c, beats]) => h('section', { style: { marginTop: '26px' } },
    h('h2', { class: 'h2', style: { color: c } }, title),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0', border: '5px solid var(--ink)', boxShadow: `8px 8px 0 ${c}`, background: 'var(--paper)' } },
      ...beats.map((b, i) => h('div', { style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 6px', minHeight: '170px', borderLeft: i ? '5px solid var(--ink)' : '0', background: i % 2 ? '#FFF3B0' : 'var(--paper)', color: 'var(--ink)' } },
        h('span', { style: { position: 'absolute', top: '6px', left: '8px', font: '16px var(--boom)' } }, String(i + 1)),
        b.kin ? kinIcon(b.kin, 92, { crown: b.kin === 1, enemy: b.word === 'THEIR KING' }) : h('span', { style: { width: '84px', height: '84px', display: 'grid', placeItems: 'center', background: b.c, border: '4px solid var(--ink)', borderRadius: '50%' } }, glyph(b.g!, 50, '#0A0612', 2.4)),
        h('b', { style: { font: '26px var(--boom)', letterSpacing: '.05em' } }, b.word),
        i < beats.length - 1 ? h('span', { style: { position: 'absolute', right: '-21px', top: '50%', transform: 'translateY(-50%)', zIndex: '2', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ink)', display: 'grid', placeItems: 'center' } }, glyph('go', 22, '#FFE53B', 3)) : '')))));
  const el = h('div', { class: 'screen scrolls' }, h('div', { class: 'page' },
    h('h1', { class: 'h1' }, 'GLYPHS'),
    h('p', { class: 'boomtxt', style: { fontSize: '26px', margin: '14px 0 22px', color: 'var(--cyan)' } }, 'ONE SIGN · ONE WORD'),
    tiles, ...strips));
  return { el, title: 'GLYPHS', leave: () => {} };
}
