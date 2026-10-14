/* Where the kin of one den zone stand. Each gets its own footprint (as wide and tall as drawKin really
 * draws it), so two never overlap: one line when it fits, stacked lines when a single line would make
 * them too small, the king up front in the middle and a size bigger, totems at the back, open rings at
 * the ends. Pure numbers, so the tests can check it without a canvas. */
import type { Realm } from '../lore';

export const ZONE_Y: Record<Realm, number> = { star: 0.235, sky: 0.43, root: 0.655, tide: 0.885 };
export const ZONE_ORDER: Realm[] = ['star', 'sky', 'root', 'tide'];

/** A kin (its struct type) or an open ring in a zone. */
export interface Spot { king: boolean; totem: boolean; free: boolean; type?: number }
export interface Zone {
  /** Centre and usable width of the line, in px. */
  cx: number; avail: number;
  /** Where the front line stands, and how much height the zone has above it before the next zone. */
  y: number; band: number;
  /** The biggest a kin may be. */
  size: number;
}
/** `s` is the zone's kin size: the king draws at 1.2×, an open ring at 0.8×. `room` is the distance to the nearest kin in its line (room for a name tag). */
export interface Place { x: number; y: number; s: number; row: number; room: number; pad: number }

/** The den's frame on a w×h canvas: the panels' insets leave [l, r]; on a phone the zones start below
 * the banners (top0) and everything stands above the dock (H). */
export function denFrame(w: number, h: number, inset: { l: number; r: number; b: number }) {
  const narrow = w < 900;
  const l = narrow ? 0 : inset.l, r = narrow ? w : w - inset.r;
  const cx = (l + r) / 2, span = Math.max(260, r - l);
  // the den sits above the dock: zones are placed in the height the dock leaves free
  const H = narrow ? h - inset.b : h - inset.b * 0.55;
  // on a phone the banners and the deed buttons sit at the top: the zones start below them
  const top0 = narrow ? Math.min(150, h * 0.18) : 0;
  const size = Math.max(54, Math.min(112, H * 0.12, span / 6.2));
  return { narrow, l, r, cx, span, H, top0, size };
}
export type DenFrame = ReturnType<typeof denFrame>;

/** A zone's line (clear of the zone labels at the den's left edge) and the height up to the zone above it. */
export function zoneOf(f: DenFrame, z: Realm): Zone {
  const zi = ZONE_ORDER.indexOf(z);
  return {
    cx: f.cx + 23, avail: f.span - 62, size: f.size,
    y: f.top0 + ZONE_Y[z] * (f.H - f.top0),
    band: (ZONE_Y[z] - (zi ? ZONE_Y[ZONE_ORDER[zi - 1]] : 0.04)) * (f.H - f.top0),
  };
}

export const KING = 1.2, RING = 0.8;
const PAD = 6, ROW_GAP = 10, SLACK = 10;

/** [half width, height] of what drawKin draws, per struct type, in units of its size: measured at size 100
 * over the idle animation, asleep (the Zzz), lunging, calling and crowned. A beast is [0.67, 1.58] unless
 * it says otherwise (wings and quills spread wider; totems are their own shapes). */
const FOOT: Record<number, [number, number]> = {
  4: [1.18, 1.58], 6: [1.19, 1.58], 10: [0.76, 1.58],
  14: [0.69, 1.58], 15: [0.66, 1.58], 16: [0.63, 1.52], 17: [0.51, 1.41], 18: [0.54, 0.71],
  19: [0.51, 1.35], 20: [0.51, 0.87], 21: [0.56, 1.17], 22: [0.64, 1.43],
};
const foot = (p: Spot) => (p.type != null && FOOT[p.type]) || [0.67, 1.58];

/** Half the width a spot covers, in units of the zone's kin size (the king's and a ring's own scale included). */
export function halfWidth(p: Spot) { return p.free ? RING * 0.46 : foot(p)[0] * (p.king ? KING : 1); }
/** How far above its feet a spot reaches, in the same units. */
export function height(p: Spot) { return p.free ? RING * 0.9 : foot(p)[1] * (p.king ? KING : 1); }

export function placeZone(spots: Spot[], z: Zone): Place[] {
  const n = spots.length;
  if (!n) return [];
  // backmost first: totems, then the pack, open rings after their kind, the king last (always up front)
  const rank = (p: Spot) => (p.king ? 4 : p.totem ? (p.free ? 1 : 0) : p.free ? 3 : 2);
  const order = spots.map((_, i) => i).sort((a, b) => rank(spots[a]) - rank(spots[b]) || a - b);
  let best: { rows: number[][]; s: number } | null = null;
  for (let r = 1; r <= Math.min(3, n); r++) {
    // the front line holds the most; deeper lines take what is left, backmost spots first
    const rows: number[][] = [];
    let left = order.slice();
    for (let k = 0; k < r; k++) { const take = Math.ceil(left.length / (r - k)); rows.push(left.slice(left.length - take)); left = left.slice(0, left.length - take); }
    const sw = Math.min(...rows.map((row) => (z.avail - (row.length - 1) * PAD) / row.reduce((a, i) => a + 2 * halfWidth(spots[i]), 0)));
    const sh = (z.band - SLACK - (r - 1) * ROW_GAP) / rows.reduce((a, row) => a + Math.max(...row.map((i) => height(spots[i]))), 0);
    const s = Math.min(z.size, sw, sh);
    // another line only when it lets the kin stand clearly bigger
    if (!best || s > best.s * 1.1) best = { rows, s };
  }
  const { rows, s } = best!;
  const out: Place[] = new Array(n);
  let y = z.y;
  rows.forEach((row, k) => {
    // centre-out: the king (or the first kin) in the middle, then alternately left and right, rings at the ends
    const line: number[] = [];
    [...row].sort((a, b) => Number(spots[b].king) - Number(spots[a].king) || Number(spots[a].free) - Number(spots[b].free) || a - b)
      .forEach((i, j) => (j % 2 ? line.unshift(i) : line.push(i)));
    const widths = line.map((i) => 2 * halfWidth(spots[i]) * s);
    const used = widths.reduce((a, b) => a + b, 0);
    const pad = line.length > 1 ? Math.max(PAD, Math.min(z.size * 0.3, (z.avail - used) / (line.length - 1))) : 0;
    let x = z.cx - (used + pad * (line.length - 1)) / 2;
    const xs = widths.map((w) => { const c = x + w / 2; x += w + pad; return c; });
    // room for a name tag under the feet: only the kin beside it carry tags (rings have none)
    const kin = line.map((i, j) => (spots[i].free ? null : xs[j])).filter((x): x is number => x != null);
    line.forEach((i, j) => {
      const room = Math.min(...kin.filter((x) => x !== xs[j]).map((x) => Math.abs(x - xs[j])), Infinity);
      out[i] = { x: xs[j], y, s, row: k, room, pad };
    });
    y -= Math.max(...row.map((i) => height(spots[i]))) * s + ROW_GAP;
  });
  return out;
}
