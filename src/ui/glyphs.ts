/* The glyph set: one sign per idea, drawn as thick ink strokes on a 24-unit grid. The same path data
 * draws in the DOM (svg) and on canvas (Path2D), so a sign looks the same everywhere. */
import { svg } from '../core/dom';

export const G = {
  alpha: 'M16.5 6C15 15.5 13.5 19 9.5 19C6 19 4.5 16 5 13C5.5 10 8 7.5 11 8C13.5 8.5 14.5 13.5 18.5 19 M19.5 2V6 M17.5 4H21.5',
  shard: 'M12 2L18 9L12 22L6 9Z M6 9H18 M10 9L12 22L14 9 M10 9L12 2L14 9',
  glow: 'M13 2L5 13H11L10 22L19 10H13Z',
  pulse: 'M2 12H7L9 6L13 18L15 12H22',
  howl: 'M4 9V15 M8 6V18 M12 3V21 M16 6V18 M20 9V15',
  dig: 'M5 4C7 10 8 15 7 20 M11 3C13 9 14 15 13 21 M17 4C19 10 20 15 19 20',
  forge: 'M12 2C15 7 19 9 19 14C19 18 16 21 12 21C8 21 5 18 5 14C5 10 8 9 9 5C10 8 11 9 12 9C12 6 12 4 12 2Z',
  pounce: 'M12 2L14 9L21 7L16 12L22 17L14 15L12 22L10 15L2 17L8 12L3 7L10 9Z',
  prowl: 'M8 14C8 11 10 10 12 10C14 10 16 11 16 14C16 17 14 18 12 18C10 18 8 17 8 14Z M5 9a1.6 2 0 1 0 0.01 0Z M9 5a1.6 2 0 1 0 0.01 0Z M15 5a1.6 2 0 1 0 0.01 0Z M19 9a1.6 2 0 1 0 0.01 0Z',
  snatch: 'M4 14C4 9 8 6 12 6 M12 6L9 3 M12 6L9 9 M20 10C20 15 16 18 12 18 M12 18L15 15 M12 18L15 21',
  guard: 'M12 2L20 5V11C20 16 16 20 12 22C8 20 4 16 4 11V5Z',
  hide: 'M3 10C6 15 18 15 21 10 M6 13.5L4 17 M12 15V19 M18 13.5L20 17',
  show: 'M2 12C5 6 19 6 22 12C19 18 5 18 2 12Z M12 9a3 3 0 1 0 0.01 0Z',
  wake: 'M3 18H21 M7 18A5 5 0 0 1 17 18 M12 7V10 M5.5 10.5L7.5 12.5 M18.5 10.5L16.5 12.5 M9 3L12 6L15 3',
  nap: 'M20 14A8 8 0 1 1 10 4A6 6 0 0 0 20 14Z',
  call: 'M12 2a10 10 0 1 0 0.01 0Z M12 7V17 M7 12H17',
  roam: 'M12 2a10 10 0 1 0 0.01 0Z M15.5 8.5L13.5 13.5L8.5 15.5L10.5 10.5Z',
  fur: 'M12 21C5 15 2 11 2 7.5C2 5 4 3 6.5 3C8.5 3 10.5 4.5 12 6.5C13.5 4.5 15.5 3 17.5 3C20 3 22 5 22 7.5C22 11 19 15 12 21Z',
  ward: 'M12 2L21 7V17L12 22L3 17V7Z M12 7L16.5 9.5V14.5L12 17L7.5 14.5V9.5Z',
  den: 'M3 21C3 10 7 4 12 4C17 4 21 10 21 21Z M9 21C9 16 10 14 12 14C14 14 15 16 15 21',
  pack: 'M8 8a3 3 0 1 0 0.01 0Z M16 8a3 3 0 1 0 0.01 0Z M2 20C2 15 5 13 8 13C11 13 14 15 14 20 M14 14C15 13 15.5 13 16 13C19 13 22 15 22 20',
  clan: 'M5 22V2 M5 3H19L16 8L19 13H5',
  feed: 'M12 2V12 M8 8L12 12L16 8 M4 15C4 19 8 22 12 22C16 22 20 19 20 15Z',
  pull: 'M12 13V3 M8 7L12 3L16 7 M4 15C4 19 8 22 12 22C16 22 20 19 20 15Z',
  king: 'M3 19L5 7L9 12L12 5L15 12L19 7L21 19Z',
  leap: 'M4 20C4 12 9 6 18 6 M14 2L18 6L14 10',
  hunt: 'M12 2a10 10 0 1 0 0.01 0Z M12 7a5 5 0 1 0 0.01 0Z M12 11a1 1 0 1 0 0.01 0Z',
  kin: 'M6 11L4 3L10 7Z M18 11L20 3L14 7Z M12 6C17 6 20 10 20 14C20 18 16 21 12 21C8 21 4 18 4 14C4 10 7 6 12 6Z M9 13H10 M14 13H15 M10 17C11 18 13 18 14 17',
  glyph: 'M4 4H20V20H4Z M8 9H16 M8 13H16 M8 17H12',
  sun: 'M12 7a5 5 0 1 0 0.01 0Z M12 1V3 M12 21V23 M1 12H3 M21 12H23 M4 4L5.5 5.5 M18.5 18.5L20 20 M4 20L5.5 18.5 M18.5 5.5L20 4',
  release: 'M5 5L19 19 M19 5L5 19',
  stop: 'M6 6H18V18H6Z',
  home: 'M3 12L12 3L21 12 M6 10V21H18V10',
  star: 'M12 2C13 9 15 11 22 12C15 13 13 15 12 22C11 15 9 13 2 12C9 11 11 9 12 2Z',
  sky: 'M7 18H17A4 4 0 0 0 17 10A5 5 0 0 0 7.5 9A4.5 4.5 0 0 0 7 18Z',
  root: 'M2 20L9 8L13 14L16 10L22 20Z',
  tide: 'M2 9C5 6 7 6 9 9S13 12 15 9S20 6 22 9 M2 15C5 12 7 12 9 15S13 18 15 15S20 12 22 15',
  paw: 'M12 2L20 6V13C20 17 16 21 12 22C8 21 4 17 4 13V6Z M9 14a1.4 1.7 0 1 0 0.01 0Z M12 12a1.4 1.7 0 1 0 0.01 0Z M15 14a1.4 1.7 0 1 0 0.01 0Z M12 16C10.5 16 10 17.5 10 18C10 19 11 19.5 12 19.5C13 19.5 14 19 14 18C14 17.5 13.5 16 12 16Z',
  lock: 'M6 11H18V21H6Z M8 11V7A4 4 0 0 1 16 7V11',
  words: 'M4 5H20 M4 10H20 M4 15H14 M4 20H10',
  live: 'M12 9a3 3 0 1 0 0.01 0Z M6 6A8.5 8.5 0 0 0 6 18 M18 6A8.5 8.5 0 0 1 18 18',
  close: 'M6 6L18 18 M18 6L6 18',
  back: 'M15 4L7 12L15 20',
  go: 'M9 4L17 12L9 20',
  sound: 'M4 9H8L13 4V20L8 15H4Z M16 9C17.5 10.5 17.5 13.5 16 15 M19 6C22 9 22 15 19 18',
  mute: 'M4 9H8L13 4V20L8 15H4Z M16 9L22 15 M22 9L16 15',
  eye: 'M2 12C5 6 19 6 22 12C19 18 5 18 2 12Z M12 9a3 3 0 1 0 0.01 0Z',
  warn: 'M12 2L22 20H2Z M12 9V14 M12 17V17.5',
  done: 'M4 12L10 18L20 6',
  wait: 'M12 2a10 10 0 1 0 0.01 0Z M12 6V12L16 15',
  dice: 'M4 4H20V20H4Z M8.5 8.5h.01 M15.5 15.5h.01 M12 12h.01 M15.5 8.5h.01 M8.5 15.5h.01',
  copy: 'M8 8H20V20H8Z M4 16V4H16',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  out: 'M14 4H20V10 M20 4L11 13 M18 14V20H4V6H10',
} as const;

export type GlyphName = keyof typeof G;

export function glyph(name: GlyphName, size = 22, color = 'currentColor', weight = 2.6): SVGSVGElement {
  return svg(`<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${G[name]}"/></svg>`, 'gl');
}

const paths = new Map<string, Path2D>();
/** Draw a glyph on canvas, centred on (x, y), `size` px across. */
export function drawGlyph(ctx: CanvasRenderingContext2D, name: GlyphName, x: number, y: number, size: number, color: string, weight = 2.6) {
  let p = paths.get(name);
  if (!p) { p = new Path2D(G[name]); paths.set(name, p); }
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = color; ctx.lineWidth = weight;
  ctx.stroke(p);
  ctx.restore();
}

export const ZONE_GLYPH = { star: 'star', sky: 'sky', root: 'root', tide: 'tide' } as const;
