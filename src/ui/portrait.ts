/* Little living portraits of kin for the DOM (lists, cards, dialogs). One shared animation loop
 * draws every portrait still on the page, at a gentle frame rate. */
import { drawKin } from '../art/totem';
import { setBoil } from '../art/ink';
import type { Pose } from '../art/beast';

interface Entry { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; type: number; size: number; pose: Partial<Pose>; seed: number; bg?: string; gone: number }
const live = new Set<Entry>();
let raf = 0, lastDraw = 0;

function loop(now: number) {
  raf = 0;
  if (!live.size) return;
  raf = requestAnimationFrame(loop);
  if (now - lastDraw < 1000 / 30) return;
  lastDraw = now;
  const t = now / 1000;
  setBoil(t);
  for (const e of live) {
    if (!e.c.isConnected) { if (++e.gone > 90) live.delete(e); continue; }
    e.gone = 0;
    paint(e, t);
  }
}

function paint(e: Entry, t: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = e.size, h = e.size;
  if (e.c.width !== Math.round(w * dpr) || e.c.height !== Math.round(h * dpr)) { e.c.width = Math.round(w * dpr); e.c.height = Math.round(h * dpr); }
  e.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  e.ctx.clearRect(0, 0, w, h);
  if (e.bg) { e.ctx.fillStyle = e.bg; e.ctx.fillRect(0, 0, w, h); }
  drawKin(e.ctx, e.type, w / 2, h * 0.97, w / 1.48, { t, seed: e.seed, ...e.pose });
}

/** A portrait canvas `size` px square. Pass `still` for a frozen one (no loop). */
export function kinIcon(typeId: number, size: number, pose: Partial<Pose> & { bg?: string; seedFrom?: string } = {}): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.style.width = c.style.height = `${size}px`;
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d')!;
  const seed = pose.seedFrom ? [...pose.seedFrom].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7) % 997 : typeId * 13 + 5;
  const e: Entry = { c, ctx, type: typeId, size, pose, seed, bg: pose.bg, gone: 0 };
  setBoil(performance.now() / 1000);
  paint(e, performance.now() / 1000);
  if (!pose.still) { live.add(e); if (!raf) raf = requestAnimationFrame(loop); }
  return c;
}
