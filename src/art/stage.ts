/* A stage: one full-size canvas, sized to its box at the device's pixel ratio, drawn every frame by a
 * scene. Scenes register hit circles while they draw; the stage turns pointer events into picks,
 * hovers and drags. A shake jolts the whole frame (a pounce landing). */
import { ctx2d, setBoil } from './ink';

export interface Hit { id: string; x: number; y: number; r: number; cursor?: string }
export interface Scene {
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, hits: Hit[]): void;
  pick?(hit: Hit | null, x: number, y: number): void;
  hover?(hit: Hit | null, x: number, y: number): void;
  drag?(dx: number, dy: number): void;
  wheel?(dy: number, x: number, y: number): void;
}
export interface StageCtl { dispose(): void; shake(amount: number, ms?: number): void; size(): { w: number; h: number }; canvas: HTMLCanvasElement }

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Quality: how many canvas pixels per screen pixel ────────────────────────────────────────────
 * Painting cost grows with pixels, and a retina canvas has four times as many: on a machine (or a
 * browser: Firefox paints this game's canvases far slower than Chrome) that is the difference between
 * 50 and 12 frames a second. Each place has its own governor, since the title is far heavier than the
 * hunt map: when its frames come too slowly it steps the resolution down; given steady headroom it
 * steps back up, never to a step that already proved too slow there. Steps are remembered per device. */
const STEPS = [2, 1.75, 1.5, 1.25, 1, 0.85, 0.7];
// v3: steps saved before the did-it-help check could leave a place stuck soft; start those over
const QKEY = 'furrency.stage.scale.v3';
const deviceMax = () => Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
// localStorage 'furrency.stage.pin' = '2' (or 1, 1.5…) holds every place there with no governor: for testing
const PIN = (() => { try { const v = Number(localStorage.getItem('furrency.stage.pin')); return v > 0 ? v : 0; } catch { return 0; } })();
const saved: Record<string, number> = (() => { try { return JSON.parse(localStorage.getItem(QKEY) || '{}') || {}; } catch { return {}; } })();

interface Quality { scale: number; tooSlow: number; floor: number; trial: { from: number; avg: number; dropped: number } | null; sum: number; n: number; slow: number; since: number; good: number; listeners: Set<() => void> }
const places = new Map<string, Quality>();
function qualityOf(place: string): Quality {
  let q = places.get(place);
  if (!q) {
    const v = Number(saved[place]);
    q = { scale: PIN || (v > 0 ? Math.min(v, deviceMax()) : deviceMax()), tooSlow: Infinity, floor: 0, trial: null, sum: 0, n: 0, slow: 0, since: 0, good: 0, listeners: new Set() };
    places.set(place, q);
  }
  return q;
}
function remember(place: string, scale: number) {
  saved[place] = scale;
  try { localStorage.setItem(QKEY, JSON.stringify(saved)); } catch { /* private mode: this visit only */ }
}
/** Feed one frame interval (seconds); steps the place's resolution when the trend is clear. */
function govern(place: string, q: Quality, dt: number, now: number) {
  if (PIN || dt <= 0 || dt > 0.25) return;      // pinned, or a hidden tab or a stall, not a trend
  q.sum += dt; q.n++;
  if (dt > 0.024) q.slow++;               // a dropped frame at 60 Hz
  if (!q.since) q.since = now;
  if (now - q.since < 1000) return;
  const avg = q.sum / q.n, dropped = q.slow / q.n;
  q.sum = 0; q.n = 0; q.slow = 0; q.since = now;
  const i = STEPS.findIndex((x) => x <= q.scale + 1e-6);
  let next = q.scale, keep = true;
  // the second after a step down: did fewer pixels make faster frames? When the time goes elsewhere
  // (the howl hashing on the GPU, another busy tab) they don't, and a softer picture buys nothing:
  // go back up and stop lowering this place for the rest of the visit
  if (q.trial) {
    const t = q.trial; q.trial = null;
    if (avg > t.avg * 0.85 && dropped > t.dropped * 0.6) { q.floor = t.from; q.tooSlow = Infinity; next = t.from; keep = false; }
    else remember(place, q.scale);   // it helped: start here next visit
  } else if (avg > 1 / 40 || dropped > 0.125) {
    // under ~40 fps, or uneven: more than one frame in eight dropped reads as sluggish even at a fair average
    q.good = 0;
    if (i >= 0 && i < STEPS.length - 1 && STEPS[i + 1] >= q.floor) {
      q.tooSlow = Math.min(q.tooSlow, q.scale);
      q.trial = { from: q.scale, avg, dropped };
      next = STEPS[i + 1];
    }
  } else if (avg < 1 / 55 && dropped < 0.03 && ++q.good >= 5) {   // five steady seconds: try one step up
    q.good = 0;
    const up = i > 0 ? STEPS[i - 1] : q.scale;
    if (up <= deviceMax() && up < q.tooSlow) next = up;
  }
  if (next !== q.scale) {
    q.scale = next;
    // only a step that proved itself is remembered (a trial is saved once the next second confirms it)
    if (!q.trial || !keep) remember(place, next);
    for (const f of q.listeners) f();
  }
}

/** A still layer, painted once and copied in every frame: repainted only when its size, the canvas
 * resolution or `version` changes. `paint` draws in the stage's own units (w × h). Full-screen
 * gradients, dot screens and big outlined letters are slow to paint on software canvases and never
 * change between frames, so a scene keeps them here. */
export function layer(ctx: CanvasRenderingContext2D, store: Map<string, HTMLCanvasElement>, name: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void, version = '') {
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1;
  const key = `${Math.round(w)}x${Math.round(h)}@${sc.toFixed(3)}|${version}`;
  let cv = store.get(name);
  if (!cv || cv.dataset.key !== key) {
    cv = cv || document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w * sc)); cv.height = Math.max(1, Math.ceil(h * sc));
    const lc = ctx2d(cv);
    lc.setTransform(sc, 0, 0, sc, 0, 0);
    paint(lc);
    cv.dataset.key = key;
    store.set(name, cv);
  }
  ctx.drawImage(cv, 0, 0, w, h);
}

/** `place` names the screen, for its own resolution governor. */
export function mountStage(canvas: HTMLCanvasElement, scene: Scene, place = 'stage'): StageCtl {
  const quality = qualityOf(place);
  quality.sum = 0; quality.n = 0; quality.slow = 0; quality.since = 0; quality.good = 0;   // a fresh window each visit
  const ctx = ctx2d(canvas, { alpha: false });
  let w = 0, h = 0, dpr = 1, dead = false, raf = 0, last = performance.now();
  let hits: Hit[] = [];
  let shakeAmp = 0, shakeUntil = 0;
  let hovered: string | null = null;

  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = PIN || Math.min(quality.scale, deviceMax());
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    // resizing a canvas clears it: only when the size really changed
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  quality.listeners.add(fit);
  fit();

  let covered = false;
  const frame = (now: number) => {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    // a dialog over the stage hides most of it: a few frames a second is plenty, and those slow
    // frames are chosen, so they tell the governor nothing about the machine
    const wasCovered = covered;
    covered = !!document.querySelector('.veil');
    if (covered && now - last < 100) return;
    const gap = (now - last) / 1000;
    const dt = Math.min(0.1, gap);
    last = now;
    if (!covered && !wasCovered) govern(place, quality, gap, now);
    const t = now / 1000;
    setBoil(t, reduced ? 0 : 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (shakeUntil > now && !reduced) {
      const k = (shakeUntil - now) / 400;
      ctx.translate((Math.random() - 0.5) * shakeAmp * k, (Math.random() - 0.5) * shakeAmp * k);
    }
    const next: Hit[] = [];
    if (w < 40 || h < 40) { fit(); return; }
    ctx.save();
    try { scene.draw(ctx, w, h, t, dt, next); } catch (e) { console.error('[stage]', e); }
    ctx.restore();
    hits = next;
    // the playtest probe reads what can be tapped on this canvas (src/qa/probe.ts)
    (canvas as unknown as { __hits?: Hit[] }).__hits = next;
  };
  raf = requestAnimationFrame(frame);

  const local = (e: PointerEvent | WheelEvent) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const find = (x: number, y: number): Hit | null => {
    let best: Hit | null = null, bd = Infinity;
    for (let i = hits.length - 1; i >= 0; i--) {
      const k = hits[i], d = Math.hypot(k.x - x, k.y - y);
      if (d <= k.r && d < bd) { best = k; bd = d; }
    }
    return best;
  };
  let down: { x: number; y: number; moved: boolean; id: number } | null = null;
  const onDown = (e: PointerEvent) => { const [x, y] = local(e); down = { x, y, moved: false, id: e.pointerId }; };
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (down && e.pointerId === down.id && (e.buttons & 1 || e.pointerType !== 'mouse')) {
      const dx = x - down.x, dy = y - down.y;
      if (down.moved || Math.hypot(dx, dy) > 6) {
        if (!down.moved) { try { canvas.setPointerCapture(e.pointerId); } catch { /* fine */ } }
        down.moved = true; scene.drag?.(dx, dy); down.x = x; down.y = y;
        canvas.style.cursor = 'grabbing';
        return;
      }
    }
    const hit = find(x, y);
    canvas.style.cursor = hit ? hit.cursor || 'pointer' : scene.drag ? 'grab' : 'default';
    if ((hit?.id ?? null) !== hovered) { hovered = hit?.id ?? null; scene.hover?.(hit, x, y); }
  };
  const onUp = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (down && !down.moved) scene.pick?.(find(x, y), x, y);
    down = null;
    canvas.style.cursor = 'default';
  };
  const onLeave = () => { if (hovered) { hovered = null; scene.hover?.(null, -1, -1); } };
  const onWheel = (e: WheelEvent) => { if (!scene.wheel) return; e.preventDefault(); const [x, y] = local(e); scene.wheel(e.deltaY, x, y); };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  return {
    canvas,
    size: () => ({ w, h }),
    shake(amount: number, ms = 400) { shakeAmp = Math.max(shakeAmp * (shakeUntil > performance.now() ? 1 : 0), amount); shakeUntil = performance.now() + ms; },
    dispose() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); quality.listeners.delete(fit);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('wheel', onWheel);
    },
  };
}
