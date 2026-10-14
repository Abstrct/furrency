/* A stage: one full-size canvas, sized to its box at the device's pixel ratio, drawn every frame by a
 * scene. Scenes register hit circles while they draw; the stage turns pointer events into picks,
 * hovers and drags. A shake jolts the whole frame (a pounce landing). */
import { setBoil } from './ink';

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

export function mountStage(canvas: HTMLCanvasElement, scene: Scene): StageCtl {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  let w = 0, h = 0, dpr = 1, dead = false, raf = 0, last = performance.now();
  let hits: Hit[] = [];
  let shakeAmp = 0, shakeUntil = 0;
  let hovered: string | null = null;

  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  fit();

  const frame = (now: number) => {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
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
      dead = true; cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('wheel', onWheel);
    },
  };
}
