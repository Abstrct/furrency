/* Totems: the den's standing things. The Dig Mole and Forge Badger are beasts at work (beast.ts)
 * with their mound and forge in front; the rest are carved poles, moons, burrows, thorns, crystals
 * and a sun tree, drawn in the same ink. Anchor: bottom centre; `size` px per 100 units. */
import { INK, PAPER, ell, mirror, mix, paint, shape, spikes, stroke, wob, zig, type P } from './ink';
import { drawBeast, type Pose } from './beast';
import { lore } from '../lore';

/* ── Sprites: a kin is painted once per boil step and copied in between ────────────────────────
 * A beast is hundreds of inked paths, cel-shading clips and halftone fills. Its line work only
 * changes 8 times a second (the boil), so it is painted into its own small canvas once per step,
 * its motion stepped with it ("on threes", like the ink), and every frame between is one copy.
 * Software canvases (Firefox on many machines, weaker laptops) paint ~8x less per frame this way.
 * Brief effects (a hit flash, a lunge) and a caller's shadow paint directly, as before. */
const PAD = { l: 1.3, r: 1.3, t: 1.8, b: 0.25 };     // measured reach: ±1.16 wide, 1.61 up, 0.08 down
interface Sprite { c: HTMLCanvasElement; step: number; used: number; phase: number }
const sprites = new Map<string, Sprite>();
let sweptAt = 0;

/** Draw any kin: beasts and totems alike. */
export function drawKin(ctx: CanvasRenderingContext2D, typeId: number, x: number, y: number, size: number, pose: Pose) {
  if ((pose.flash ?? 0) > 0 || pose.lunge || ctx.shadowBlur || ctx.shadowOffsetX || ctx.shadowOffsetY || typeof document === 'undefined') return drawKinNow(ctx, typeId, x, y, size, pose);
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1;
  const px = size * sc;
  if (px < 14 || px > 900) return drawKinNow(ctx, typeId, x, y, size, pose);
  // resolution in ~9% steps, so a beast that grows or shrinks reuses its canvas until it really changes
  const res = Math.pow(2, Math.round(Math.log2(px) * 8) / 8);
  const key = `${typeId}|${pose.seed}|${res}|${pose.asleep ? 1 : 0}${pose.hidden ? 1 : 0}${pose.enemy ? 1 : 0}${pose.crown ? 1 : 0}${pose.still ? 1 : 0}|${pose.hp == null ? '' : Math.round(pose.hp * 20)}|${pose.building == null ? '' : Math.round(pose.building * 100)}`;
  const now = performance.now();
  let sp = sprites.get(key);
  if (!sp) {
    // each sprite refreshes at its own moment within the step, so a crowd doesn't repaint all in one frame
    let hsh = 0; for (let i = 0; i < key.length; i++) hsh = (hsh * 31 + key.charCodeAt(i)) >>> 0;
    sp = { c: document.createElement('canvas'), step: NaN, used: now, phase: (hsh % 997) / 997 };
    sp.c.width = Math.ceil((PAD.l + PAD.r) * res); sp.c.height = Math.ceil((PAD.t + PAD.b) * res);
    sprites.set(key, sp);
  }
  sp.used = now;
  const step = Math.floor(pose.t * 8 + sp.phase);
  if (sp.step !== step) {
    sp.step = step;
    const sctx = sp.c.getContext('2d')!;
    const ref = res / sc;   // drawn at the caller's own scale, so line-width floors land exactly as before
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, sp.c.width, sp.c.height);
    sctx.setTransform(sc, 0, 0, sc, 0, 0);
    drawKinNow(sctx, typeId, PAD.l * ref, PAD.t * ref, ref, pose.still ? pose : { ...pose, t: step / 8 });
  }
  ctx.drawImage(sp.c, x - PAD.l * size, y - PAD.t * size, (PAD.l + PAD.r) * size, (PAD.t + PAD.b) * size);
  if (now - sweptAt > 2000) { sweptAt = now; for (const [k, v] of sprites) if (now - v.used > 3000) sprites.delete(k); }
}

/** Paint a kin straight onto `ctx`, every path (portraits and one-offs; drawKin caches this). */
export function drawKinNow(ctx: CanvasRenderingContext2D, typeId: number, x: number, y: number, size: number, pose: Pose) {
  const look = lore(typeId).look;
  if (!look.totem) return drawBeast(ctx, typeId, x, y, size, pose);
  if (look.totem === 'mole' || look.totem === 'badger') {
    drawBeast(ctx, typeId, x, y - size * 0.12, size * 0.92, pose);
    if (pose.building == null || pose.building >= 1) prop(ctx, look.totem, x, y, size, pose);
    return;
  }
  const b = pose.building;
  if (b != null && b < 1) {
    ctx.save(); ctx.globalAlpha *= 0.28; totem(ctx, typeId, x, y, size, { ...pose, still: true }, true); ctx.restore();
    const h = size * 1.3, cut = y - h * b;
    ctx.save(); ctx.beginPath(); ctx.rect(x - size, cut, size * 2, h * b + 4); ctx.clip();
    totem(ctx, typeId, x, y, size, { ...pose, still: true }, false);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#22E4FF'; ctx.lineWidth = Math.max(2, size * 0.03); ctx.shadowColor = '#22E4FF'; ctx.shadowBlur = 12;
    ctx.setLineDash([size * 0.06, size * 0.04]);
    ctx.beginPath(); ctx.moveTo(x - size * 0.5, cut); ctx.lineTo(x + size * 0.5, cut); ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.save();
  if (pose.flash && pose.flash > 0 && 'filter' in ctx) ctx.filter = `brightness(${1 + pose.flash * 2.2}) saturate(${1 - pose.flash})`;
  totem(ctx, typeId, x, y, size, pose, false);
  ctx.restore();
}

function prop(ctx: CanvasRenderingContext2D, kind: 'mole' | 'badger', x: number, y: number, size: number, pose: Pose) {
  const u = size / 100, lw = Math.max(2.2, 4.6 * u) / u, sd = pose.seed, t = pose.still ? 0 : pose.t;
  ctx.save();
  ctx.translate(x, y); ctx.scale(u, u);
  if (kind === 'mole') {
    // the dig mound, dirt flying while it works
    paint(ctx, shape([[-62, 4, true], ...zig(-56, -6, 56, -6, 7, 5), [62, 4, true]], true, 1, sd + 1), '#8A5A3C', { lw, shadow: 6 });
    if (!pose.asleep) for (let i = 0; i < 5; i++) {
      const k = (t * 1.3 + i / 5) % 1;
      const dx = (i % 2 ? 1 : -1) * (20 + k * 50), dy = -12 - Math.sin(k * Math.PI) * 50;
      ctx.save(); ctx.globalAlpha *= 1 - k;
      paint(ctx, shape(ell(dx, dy, 5, 4, 6), true, 0.4, sd + 10 + i), i % 3 ? '#8A5A3C' : '#FF2E88', { lw: lw * 0.6 });
      ctx.restore();
    }
  } else {
    // the forge pot, alpha bubbling up while it works
    const pot: P[] = [[-40, -24, true], [40, -24, true], [35, -4], [26, 4, true], [-26, 4, true], [-35, -4]];
    if (!pose.asleep) {
      ctx.save(); ctx.shadowColor = '#FF7A1A'; ctx.shadowBlur = 30;
      paint(ctx, shape(spikes(0, -26, 9, 17, 7, t * 2, true).map(([px, py, s]) => [px, Math.min(py, -24), s] as P), true, 1.2, sd + 20), '#FF7A1A', { lw });
      paint(ctx, shape(spikes(0, -26, 5, 11, 6, -t * 3, true).map(([px, py, s]) => [px, Math.min(py, -24), s] as P), true, 1, sd + 21), '#FFE53B', { lw: lw * 0.6 });
      ctx.restore();
    }
    paint(ctx, shape(pot, true, 0.6, sd + 22), '#2A2438', { lw, shadow: 7 });
    paint(ctx, shape([[-44, -28, true], [44, -28, true], [44, -21, true], [-44, -21, true]], true, 0.4, sd + 23), '#5A5A6E', { lw: lw * 0.8 });
    ctx.save(); ctx.shadowColor = '#FFE53B'; ctx.shadowBlur = 10;
    ctx.font = 'bold 22px "AlphaSign", "Dela Gothic One", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = pose.asleep ? '#6a6070' : '#FFE53B';
    ctx.fillText('α', 0, -10);
    ctx.restore();
    if (!pose.asleep) for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1;
      ctx.save(); ctx.globalAlpha *= 1 - k;
      ctx.font = `${14 + k * 10}px "AlphaSign", "Dela Gothic One", sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFE53B';
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText('α', (i - 1) * 40 + (i - 1) * k * 20, -30 - k * 50); ctx.fillText('α', (i - 1) * 40 + (i - 1) * k * 20, -30 - k * 50);
      ctx.restore();
    }
  }
  ctx.restore();
}

function totem(ctx: CanvasRenderingContext2D, typeId: number, x: number, y: number, size: number, pose: Pose, ghost: boolean) {
  const look = lore(typeId).look;
  const u = size / 100, lw = Math.max(2.2, 4.6 * u) / u, sd = pose.seed;
  const t = pose.still ? 0 : pose.t;
  const off = !!pose.asleep;
  const dull = (c: string) => (ghost ? '#22E4FF' : off ? mix(c, '#5d5674', 0.5) : c);
  const A = dull(look.fur), B = dull(look.fur2), Cc = dull(look.belly), E = off ? '#4a4458' : look.eye;
  const o = (sh = 6) => (ghost ? { lw } : { lw, shadow: sh });
  const glow = (c: string, k = 18) => { if (!off && !ghost) { ctx.shadowColor = c; ctx.shadowBlur = k * (0.8 + 0.2 * Math.sin(t * 3 + sd)); } };
  ctx.save();
  ctx.translate(x, y); ctx.scale(u, u);
  // a little rock base for everything
  paint(ctx, shape([[-44, 4, true], [-38, -8], [-14, -14], [16, -13], [40, -7], [46, 4, true]], true, 1, sd + 1), dull('#4F4660'), o(5));

  switch (look.totem) {
    case 'pole': {
      const faces = [0, 1, 2];
      for (const i of faces) {
        const y0 = -12 - i * 34;
        const blk: P[] = [[-24, y0, true], [24, y0, true], [26, y0 - 32, true], [-26, y0 - 32, true]];
        paint(ctx, shape(blk, true, 0.6, sd + 10 + i), i % 2 ? B : A, o());
        if (!ghost) {
          // carved face: angry eyes, a mouth of teeth
          ctx.save(); glow(E, 10);
          for (const s of [-1, 1]) paint(ctx, shape([[s * 4, y0 - 22, true], [s * 18, y0 - 25, true], [s * 16, y0 - 17, true], [s * 5, y0 - 16, true]], true, 0.3, sd + 20 + i + s), E, { lw: lw * 0.6 });
          ctx.restore();
          paint(ctx, shape(zig(-12, y0 - 8, 12, y0 - 8, 4, 4), false, 0.3, sd + 24 + i), PAPER, { lw: lw * 0.5 });
        }
      }
      // wings and a star on top
      for (const s of [-1, 1]) paint(ctx, shape([[s * 22, -104, true], [s * 58, -126, true], [s * 52, -112, true], [s * 60, -100, true], [s * 44, -98, true], [s * 48, -88, true], [s * 24, -92, true]], true, 0.8, sd + 30 + s), Cc, o(4));
      ctx.save(); glow('#FFE53B', 22);
      paint(ctx, shape(spikes(0, -128 + Math.sin(t * 2) * 3, 8, 18, 5, -Math.PI / 2 + t * 0.5), true, 0.5, sd + 33), dull('#FFE53B'), { lw: lw * 0.8 });
      ctx.restore();
      break;
    }
    case 'moon': {
      // a crescent moon with one sleepy, watchful eye, wrapped in a soft hush
      const cy = -74 + Math.sin(t * 1.6 + sd) * 4, R = 36;
      const outer = ell(0, cy, R, R, 14, 0, -Math.PI * 0.62, Math.PI * 0.62);
      const inner = ell(-R * 0.55, cy, R * 0.82, R * 0.82, 12, 0, -Math.PI * 0.6, Math.PI * 0.6).reverse();
      ctx.save(); glow('#D9CCFF', 26);
      paint(ctx, shape([...outer, ...inner], true, 0.8, sd + 40), A, o(9));
      ctx.restore();
      if (!ghost) {
        for (const [dx, dy, r] of [[R * 0.62, -R * 0.42, 4], [R * 0.7, R * 0.38, 3]] as [number, number, number][]) paint(ctx, shape(ell(dx, cy + dy, r, r, 7), true, 0.3, sd + 41 + r), B, { lw: lw * 0.5 });
        stroke(ctx, shape([[R * 0.28, cy - 2], [R * 0.48, cy + 4], [R * 0.68, cy - 1]], false, 0.4, sd + 45), lw * 0.8);
        for (const k of [0.34, 0.5, 0.64]) stroke(ctx, shape([[R * k, cy + 4], [R * k - 1, cy + 9]], false, 0.3, sd + 46), lw * 0.4);
        // the hush: two small Z's drifting off the tip
        ctx.save(); ctx.globalAlpha *= 0.8; ctx.fillStyle = E; ctx.font = `bold 13px ${'"Bangers", sans-serif'}`;
        ctx.fillText('z', R * 0.2 + Math.sin(t) * 2, cy - R - 4); ctx.fillText('z', R * 0.45, cy - R - 16 + Math.cos(t) * 2);
        ctx.restore();
      }
      break;
    }
    case 'burrow': {
      const dome: P[] = [[-50, -6, true], ...ell(0, -6, 50, 62, 11, 0, Math.PI, Math.PI * 2), [50, -6, true]];
      paint(ctx, shape(dome, true, 1, sd + 50), A, o(10));
      if (!ghost) {
        for (const [y0, xs] of [[-24, [-34, -10, 16, 38]], [-44, [-24, 2, 28]], [-60, [-14, 12]]] as [number, number[]][]) {
          stroke(ctx, shape([[-48 + Math.abs(y0) * 0.1, y0], [48 - Math.abs(y0) * 0.1, y0]], false, 0.8, sd + 51 + y0), lw * 0.5);
          for (const bx of xs) stroke(ctx, shape([[bx, y0], [bx, y0 + 16]], false, 0.4, sd + 52 + bx), lw * 0.5);
        }
        paint(ctx, shape([[-16, -6, true], ...ell(0, -6, 16, 26, 9, 0, Math.PI, Math.PI * 2), [16, -6, true]], true, 0.5, sd + 55), INK, { lw: lw * 0.8 });
        ctx.save(); glow(E, 14);
        paint(ctx, shape(ell(0, -18, 6, 5, 7), true, 0.3, sd + 56), E, { lw: lw * 0.5 });
        ctx.restore();
      }
      break;
    }
    case 'spire': {
      const tw: P[] = [[-20, -10, true], [-14, -40], [-24, -52, true], [-12, -60], [-16, -86, true], [-6, -96], [0, -132, true], [6, -96], [16, -86, true], [12, -60], [24, -52, true], [14, -40], [20, -10, true]];
      paint(ctx, shape(tw, true, 0.9, sd + 60), A, o(7));
      if (!ghost) {
        for (const [tx, ty, s] of [[-14, -40, -1], [14, -40, 1], [-12, -64, -1], [12, -64, 1], [-6, -92, -1], [6, -92, 1]] as [number, number, number][])
          paint(ctx, shape([[tx, ty, true], [tx + s * 16, ty - 6, true], [tx, ty - 8, true]], true, 0.3, sd + 61 + tx), Cc, { lw: lw * 0.6 });
        ctx.save(); glow(E, 22);
        paint(ctx, shape([[-9, -106, true], [9, -106, true], [6, -98, true], [-6, -98, true]], true, 0.3, sd + 70), E, { lw: lw * 0.6 });
        ctx.restore();
      }
      break;
    }
    case 'stone': {
      const crystal = (cx: number, h: number, w: number, lean: number, k: number) => {
        const pts: P[] = [[cx - w, -8, true], [cx - w + lean, -8 - h, true], [cx + lean, -8 - h - w, true], [cx + w + lean, -8 - h, true], [cx + w, -8, true]];
        ctx.save(); glow(A, 20);
        paint(ctx, shape(pts, true, 0.5, sd + 80 + k), k % 2 ? B : A, o(5));
        ctx.restore();
        if (!ghost) stroke(ctx, shape([[cx + lean * 0.5, -10], [cx + lean, -8 - h - w * 0.6]], false, 0.4, sd + 84 + k), lw * 0.4, PAPER);
      };
      crystal(-20, 34, 9, -6, 1); crystal(20, 40, 10, 6, 2); crystal(0, 62, 13, 0, 3);
      break;
    }
    case 'heart': {
      const beat = 1 + (off ? 0 : Math.max(0, Math.sin(t * 4)) * 0.08);
      const cy = -70 + Math.sin(t * 1.4) * 3;
      ctx.save();
      ctx.translate(0, cy); ctx.scale(beat, beat);
      const heart: P[] = [[0, 30, true], [-30, 2], [-36, -16], [-22, -32], [-6, -26], [0, -16, true], [6, -26], [22, -32], [36, -16], [30, 2]];
      glow(A, 34);
      paint(ctx, shape(heart, true, 0.8, sd + 90), A, o(8));
      ctx.restore();
      if (!ghost) {
        stroke(ctx, shape([[-20 * beat, cy - 18], [-10, cy - 2]], false, 0.4, sd + 91), lw * 0.5, PAPER);
        for (let i = 0; i < 4; i++) {
          const a = t * 1.5 + i * Math.PI / 2;
          ctx.save(); glow(E, 10);
          paint(ctx, shape(spikes(Math.cos(a) * 48, cy + Math.sin(a) * 16, 2, 6, 4), true, 0.2, sd + 92 + i), E, { lw: lw * 0.4 });
          ctx.restore();
        }
      }
      // a stand under it
      paint(ctx, shape([[-10, -10, true], [10, -10, true], [6, -36, true], [-6, -36, true]], true, 0.4, sd + 96), dull('#2A2438'), o(3));
      break;
    }
    case 'tree': {
      paint(ctx, shape([[-12, -8, true], [-9, -50], [-22, -70, true], [-6, -62], [0, -84], [6, -62], [22, -70, true], [9, -50], [12, -8, true]], true, 0.8, sd + 100), dull('#8A5A3C'), o(5));
      const canopy: P[] = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const r = i % 2 ? 46 : 54;
        canopy.push([Math.cos(a) * r * 1.15, -100 + Math.sin(a) * r * 0.75, i % 2 === 0]);
      }
      paint(ctx, shape(canopy, true, 1.2, sd + 101), A, o(9));
      if (!ghost) for (let i = 0; i < 5; i++) {
        const fx = -36 + i * 18 + wob(sd, i, 0) * 4, fy = -100 + (i % 2 ? -18 : 10);
        ctx.save(); glow('#FFE53B', 18);
        paint(ctx, shape(ell(fx, fy + Math.sin(t * 2 + i) * 2, 7, 7, 8), true, 0.3, sd + 102 + i), off ? '#6a6070' : '#FFE53B', { lw: lw * 0.6 });
        ctx.restore();
      }
      break;
    }
    default: break;
  }
  void mirror;
  ctx.restore();
}
