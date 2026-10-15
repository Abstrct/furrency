/* The ink kit: comic-book drawing on a 2D canvas. Shapes are point lists (sharp or round corners),
 * re-traced a few times a second with a little wobble — the "line boil" of hand-drawn animation —
 * then filled flat, cel-shaded with a halftone crescent and outlined in thick black ink. */

export const INK = '#0A0612';
export const PAPER = '#FFF8E7';

/** A point: x, y and whether the corner is sharp (true) or rounded (false/omitted). */
export type P = [number, number, boolean?];

/* ── Boil: hand-drawn wobble that ticks at ~8 frames a second ─────────── */

let boilTick = 0;
let boilAmp = 1;
export function setBoil(timeSec: number, amp = 1) { boilTick = Math.floor(timeSec * 8); boilAmp = amp; }
/** The current boil step: line work only changes when this does (8 a second). */
export const boilStep = () => boilTick;
function hash(n: number) { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; }
/** Deterministic wobble for point i of a shape with seed `seed`, in [-1, 1]. */
export function wob(seed: number, i: number, axis: number) { return hash(seed * 7919 + i * 131 + axis * 17 + boilTick * 104729) * 2 - 1; }

/* ── Shapes ──────────────────────────────────────────────────────────── */

/** A closed (or open) path through points: sharp points are corners, others are smoothed. */
export function shape(pts: P[], closed = true, jitter = 0.8, seed = 1): Path2D {
  const p = new Path2D();
  const n = pts.length;
  if (n < 2) return p;
  const j = jitter * boilAmp;
  const q = pts.map((pt, i): P => [pt[0] + (j ? wob(seed, i, 0) * j : 0), pt[1] + (j ? wob(seed, i, 1) * j : 0), pt[2]]);
  if (!closed) {
    p.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const a = q[i], b = q[i + 1];
      if (a[2]) p.lineTo(a[0], a[1]);
      else p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    p.lineTo(q[n - 1][0], q[n - 1][1]);
    return p;
  }
  // start between the last and first point (or on a sharp first point)
  const mid = (a: P, b: P): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = q[0][2] ? [q[0][0], q[0][1]] : mid(q[n - 1], q[0]);
  p.moveTo(start[0], start[1]);
  for (let k = 0; k < n; k++) {
    const i = q[0][2] ? (k + 1) % n : k;
    const a = q[i], b = q[(i + 1) % n];
    if (a[2]) p.lineTo(a[0], a[1]);
    else { const m = mid(a, b); p.quadraticCurveTo(a[0], a[1], m[0], m[1]); }
  }
  p.closePath();
  return p;
}

/** Points around an ellipse (rounded), optionally rotated. */
export function ell(cx: number, cy: number, rx: number, ry: number, n = 12, rot = 0, from = 0, to = Math.PI * 2): P[] {
  const out: P[] = [];
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const full = Math.abs(to - from) >= Math.PI * 2 - 1e-6;
  const steps = full ? n : n - 1;
  for (let i = 0; i < n; i++) {
    const a = from + (to - from) * (i / steps);
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return out;
}

/** A zig-zag fur edge from a to b, `n` teeth of depth `d` (sticking out to the left of a→b). */
export function zig(ax: number, ay: number, bx: number, by: number, n: number, d: number): P[] {
  const out: P[] = [];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = dy / len, ny = -dx / len;
  for (let i = 0; i <= n * 2; i++) {
    const t = i / (n * 2), o = i % 2 ? d : 0;
    out.push([ax + dx * t + nx * o, ay + dy * t + ny * o, true]);
  }
  return out;
}

/** A ring of spikes (a mane, a starburst). */
export function spikes(cx: number, cy: number, r0: number, r1: number, n: number, rot = 0, sharp = true): P[] {
  const out: P[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r0 : r1;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, sharp]);
  }
  return out;
}

export const mirror = (pts: P[]): P[] => pts.map(([x, y, s]) => [-x, y, s] as P).reverse();

/* ── Color ───────────────────────────────────────────────────────────── */

export function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
export function mix(a: string, b: string, t: number): string {
  const x = rgb(a), y = rgb(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
export const shade = (c: string, t = 0.32) => mix(c, '#1a0a2a', t);
export const tint = (c: string, t = 0.35) => mix(c, '#ffffff', t);
export function alphaOf(hex: string, a: number) { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; }

/* ── Halftone ───────────────────────────────────────────────────────── */

const patterns = new Map<string, CanvasPattern | null>();
export function halftone(ctx: CanvasRenderingContext2D, color = INK, cell = 7, r = 1.6, alpha = 0.35): CanvasPattern | null {
  const key = `${color}|${cell}|${r}|${alpha}`;
  if (patterns.has(key)) return patterns.get(key)!;
  const c = document.createElement('canvas');
  c.width = c.height = cell * 2;
  const g = c.getContext('2d')!;
  g.fillStyle = alphaOf(color, alpha);
  for (const [x, y] of [[cell / 2, cell / 2], [cell * 1.5, cell * 1.5]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  const pat = ctx.createPattern(c, 'repeat');
  patterns.set(key, pat);
  return pat;
}

/* ── Painting ───────────────────────────────────────────────────────── */

export interface InkOpts {
  /** Line width in the current (scaled) space. */
  lw: number;
  /** Shadow offset (light from top-left): how far the lit copy is shifted. */
  shadow?: number;
  shadowColor?: string;
  dots?: boolean;
  /** Skip the outline (inner details drawn later). */
  noStroke?: boolean;
  /** Extra glow around the shape (cyber bits). */
  glow?: string;
  alpha?: number;
}

/** Fill a path flat, cel-shade its lower-right with a halftone crescent, then ink it. */
export function paint(ctx: CanvasRenderingContext2D, path: Path2D, fill: string, o: InkOpts) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.lw * 4; }
  ctx.fillStyle = fill;
  ctx.fill(path);
  ctx.shadowBlur = 0;
  const sh = o.shadow ?? 0;
  if (sh) {
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = o.shadowColor || shade(fill);
    ctx.fillRect(-4000, -4000, 8000, 8000);
    if (o.dots !== false) {
      const pat = halftone(ctx, INK, 6, 1.35, 0.3);
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(-4000, -4000, 8000, 8000); }
    }
    ctx.translate(-sh, -sh);
    ctx.fillStyle = fill;
    ctx.fill(path);
    ctx.restore();
  }
  if (!o.noStroke) {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = o.lw;
    ctx.stroke(path);
  }
  ctx.restore();
}

export function stroke(ctx: CanvasRenderingContext2D, path: Path2D, lw: number, color = INK) {
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.stroke(path);
  ctx.restore();
}

/* ── Comic type and effects ─────────────────────────────────────────── */

export const FONT_BOOM = '"AlphaSign", "Bangers", "Impact", sans-serif';
export const FONT_TITLE = '"AlphaSign", "Dela Gothic One", "Arial Black", sans-serif';
export const FONT_UI = '"AlphaSign", "Chakra Petch", "Trebuchet MS", sans-serif';

/** Comic lettering: thick ink outline, flat fill, hard offset shadow. */
export function letter(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fill: string, o: { font?: string; shadow?: string; align?: CanvasTextAlign; rot?: number; outline?: number; spacing?: number } = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.font = `${size}px ${o.font || FONT_BOOM}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx && o.spacing) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${o.spacing}px`;
  const ow = o.outline ?? Math.max(3, size * 0.09);
  const sd = Math.max(2, size * 0.07);
  ctx.lineJoin = 'round';
  ctx.lineWidth = ow * 2;
  // ink letters get a paper outline, or the word is a smear
  const dark = /^#0a0612$/i.test(fill);
  ctx.strokeStyle = INK;
  if (o.shadow !== 'none') {
    ctx.fillStyle = o.shadow || INK;
    ctx.strokeText(text, sd, sd);
    ctx.fillText(text, sd, sd);
  }
  if (dark) ctx.strokeStyle = PAPER;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = fill;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** A spiky comic starburst. */
export function burst(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, n = 12, lw = 4, seed = 3, rot = 0) {
  const pts = spikes(x, y, r * 0.62, r, n, rot);
  paint(ctx, shape(pts, true, r * 0.04, seed), fill, { lw });
}

/** Radial speed lines around a point. */
export function speedLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r1: number, n: number, color: string, seed = 9, width = 1) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + wob(seed, i, 0) * 0.08;
    const w = (0.012 + Math.abs(wob(seed, i, 1)) * 0.02) * width;
    const ra = r0 * (0.85 + Math.abs(wob(seed, i, 2)) * 0.3);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1);
    ctx.lineTo(cx + Math.cos(a) * ra, cy + Math.sin(a) * ra);
    ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1);
    ctx.fill();
  }
  ctx.restore();
}

/** A rounded rectangle path. */
export function rrect(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  return p;
}
