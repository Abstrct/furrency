/* Little living portraits of kin for the DOM (lists, cards, dialogs). One shared loop repaints the
 * portraits on screen, once per boil step (8 a second): the ink only changes then, and motion
 * steps with it. Portraits scrolled away or behind a closed panel aren't painted at all. */
import { drawKinNow } from '../art/totem';
import { boilStep, ctx2d, setBoil } from '../art/ink';
import type { Pose } from '../art/beast';
import { lore } from '../lore';

interface Entry { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; type: number; size: number; wide: number; pose: Partial<Pose>; seed: number; bg?: string; gone: number; seen: boolean }
const live = new Set<Entry>();
const byCanvas = new WeakMap<Element, Entry>();
let raf = 0, lastStep = -1;
const watch = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((xs) => { for (const x of xs) { const e = byCanvas.get(x.target); if (e) e.seen = x.isIntersecting; } })
  : null;

function loop(now: number) {
  raf = 0;
  if (!live.size) return;
  raf = requestAnimationFrame(loop);
  const t = now / 1000;
  setBoil(t);
  if (boilStep() === lastStep) return;
  lastStep = boilStep();
  for (const e of live) {
    // a panel being rebuilt re-attaches its portraits within a moment; gone for a second, it is let go
    if (!e.c.isConnected) { if (++e.gone > 8) { live.delete(e); watch?.unobserve(e.c); } continue; }
    e.gone = 0;
    if (e.seen) paint(e, lastStep / 8);
  }
}

function paint(e: Entry, t: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = e.size * e.wide, h = e.size;
  if (e.c.width !== Math.round(w * dpr) || e.c.height !== Math.round(h * dpr)) { e.c.width = Math.round(w * dpr); e.c.height = Math.round(h * dpr); }
  e.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  e.ctx.clearRect(0, 0, w, h);
  if (e.bg) { e.ctx.fillStyle = e.bg; e.ctx.fillRect(0, 0, w, h); }
  // wings reach ~1.16 sizes from the middle: a winged kin on a square canvas is drawn small enough to keep them
  const wings = !!lore(e.type).look.wings;
  const size = wings && e.wide === 1 ? h / 2.4 : h / 1.48;
  drawKinNow(e.ctx, e.type, w / 2, h * 0.97, size, { t, seed: e.seed, ...e.pose });
}

/** A portrait canvas `size` px square. Pass `still` for a frozen one (no loop). */
/** `wide`: where there is room, winged kin get a wider canvas (1.6×) so the wings show at full size. */
export function kinIcon(typeId: number, size: number, pose: Partial<Pose> & { bg?: string; seedFrom?: string; wide?: boolean } = {}): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const wide = pose.wide && lore(typeId).look.wings ? 1.6 : 1;
  c.style.width = `${size * wide}px`; c.style.height = `${size}px`;
  c.setAttribute('aria-hidden', 'true');
  // a live repaint keeps this canvas while it would show the same kin the same way (stable() in dom.ts)
  c.setAttribute('data-sig', `${typeId}|${size}|${JSON.stringify(pose)}`);
  const ctx = ctx2d(c);
  const seed = pose.seedFrom ? [...pose.seedFrom].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7) % 997 : typeId * 13 + 5;
  const e: Entry = { c, ctx, type: typeId, size, wide, pose, seed, bg: pose.bg, gone: 0, seen: !watch };
  setBoil(performance.now() / 1000);
  paint(e, boilStep() / 8);
  if (!pose.still) { live.add(e); byCanvas.set(c, e); watch?.observe(c); if (!raf) raf = requestAnimationFrame(loop); }
  return c;
}
