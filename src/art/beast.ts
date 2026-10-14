/* Fur beasts, drawn in ink. Every kin is a bust — shoulders, ruff, head — built from a few parts the
 * lexicon names (ears, snout, markings) and lit with cyber eyes. Totems that are objects (poles,
 * moons, crystals, trees) live in totem.ts; the Dig Mole and Forge Badger are beasts with gear.
 *
 * Local space: the bust's bottom centre is (0, 0), 100 units tall to the brow, ears above that.
 * `size` is how many pixels those 100 units take. */
import { INK, PAPER, ell, mirror, mix, paint, shape, spikes, stroke, wob, zig, letter, FONT_BOOM, type P } from './ink';
import { lore, type Look } from '../lore';

export interface Pose {
  t: number;
  seed: number;
  asleep?: boolean;
  hidden?: boolean;
  /** 0..1 while being called (built); null/undefined when whole. */
  building?: number | null;
  /** 0..1 white flash when hit. */
  flash?: number;
  enemy?: boolean;
  /** -1..1 lean toward a target (a pounce). */
  lunge?: number;
  /** Health 0..1, for a wounded look. */
  hp?: number;
  /** Draw the king's crown. */
  crown?: boolean;
  /** Skip the idle motion (thumbnails). */
  still?: boolean;
}

const BONE = '#F2E6C8';
const STEEL = '#2A2438';

/** Where a beast's head sits, in px from its anchor, for effects (bursts, labels). */
export const headAt = (size: number) => ({ dx: 0, dy: -0.66 * size, r: 0.34 * size });

export function drawBeast(ctx: CanvasRenderingContext2D, typeId: number, x: number, y: number, size: number, pose: Pose) {
  const L = lore(typeId);
  const b = pose.building;
  if (b != null && b < 1) {
    // a calling: the ghost of the beast, filled from the ground up as the howl rises
    ctx.save(); ctx.globalAlpha *= 0.28; body(ctx, typeId, L.look, x, y, size, { ...pose, still: true }, true); ctx.restore();
    const top = y - size * 1.25, h = size * 1.25, cut = y - h * b;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - size, cut, size * 2, h * b + 4); ctx.clip();
    body(ctx, typeId, L.look, x, y, size, { ...pose, still: true }, false);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#22E4FF'; ctx.lineWidth = Math.max(2, size * 0.03); ctx.shadowColor = '#22E4FF'; ctx.shadowBlur = 12;
    ctx.setLineDash([size * 0.06, size * 0.04]);
    ctx.beginPath(); ctx.moveTo(x - size * 0.55, cut); ctx.lineTo(x + size * 0.55, cut); ctx.stroke();
    ctx.restore();
    void top;
    return;
  }
  ctx.save();
  if (pose.hidden) { ctx.globalAlpha *= 0.38; ctx.translate(Math.round(wob(pose.seed, 1, 0) * 2), 0); }
  if (pose.flash && pose.flash > 0 && 'filter' in ctx) ctx.filter = `brightness(${1 + pose.flash * 2.2}) saturate(${1 - pose.flash})`;
  body(ctx, typeId, L.look, x, y, size, pose, false);
  ctx.restore();
  if (pose.asleep) zzz(ctx, x + size * 0.32, y - size * 1.05, size, pose.t);
}

function zzz(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number) {
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.5 + i / 3) % 1;
    ctx.save();
    ctx.globalAlpha *= Math.sin(k * Math.PI);
    letter(ctx, 'Z', x + k * size * 0.25, y - k * size * 0.45, size * (0.14 + k * 0.1), '#B89BFF', { font: FONT_BOOM });
    ctx.restore();
  }
}

/** The beast itself, in its local space. `ghost` draws a flat silhouette (a calling not yet made). */
function body(ctx: CanvasRenderingContext2D, typeId: number, look: Look, x: number, y: number, size: number, pose: Pose, ghost: boolean) {
  const u = size / 100;
  const t = pose.still ? 0 : pose.t;
  const sd = pose.seed;
  const lw = Math.max(2.2, 4.6 * u) / u;
  const sh = 6;
  // the same kin, a little different per beast
  const asleep = !!pose.asleep;
  const dull = (c: string) => (asleep ? mix(c, '#5d5674', 0.45) : c);
  const fur = dull(mix(look.fur, look.fur2, 0.12 + wob(sd, 3, 0) * 0.1));
  const fur2 = dull(look.fur2);
  const belly = dull(look.belly);
  const eye = pose.enemy ? '#FF2E88' : look.eye;
  const o = (_fill: string, extra: Partial<Parameters<typeof paint>[3]> = {}) => (ghost ? { lw, noStroke: false, alpha: 1 } : { lw, shadow: sh, ...extra });
  const col = (c: string) => (ghost ? '#22E4FF' : c);

  const breathe = Math.sin(t * 2.1 + sd) * 0.018;
  const bob = Math.sin(t * 2.1 + sd + 0.6) * 1.6;
  const lunge = (pose.lunge || 0) * 14;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(u, u);

  /* wings and fins behind everything */
  if (look.wings) wings(ctx, typeId, col(fur2), col(fur), t, sd, lw, ghost);

  /* torso */
  const bulk = look.bulk ?? 1;
  ctx.save();
  ctx.scale(bulk, 1 + breathe);
  const torso: P[] = [[-48, 2, true], [-46, -16], [-36, -31], [-17, -39], [17, -39], [36, -31], [46, -16], [48, 2, true]];
  paint(ctx, shape(torso, true, 0.9, sd + 1), col(fur), o(fur));
  if (!ghost) {
    // chest fur and the cyber collar
    paint(ctx, shape([...zig(-20, -38, 20, -38, 4, -9), [14, -16], [0, -10], [-14, -16]], true, 0.6, sd + 2), belly, { lw: lw * 0.8, shadow: 3 });
    const collar = shape([[-30, -36, true], [30, -36, true], [33, -27, true], [-33, -27, true]], true, 0.4, sd + 3);
    paint(ctx, collar, STEEL, { lw: lw * 0.8 });
    ctx.save();
    ctx.shadowColor = eye; ctx.shadowBlur = 10;
    ctx.strokeStyle = eye; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-24, -31.5); ctx.lineTo(24, -31.5); ctx.stroke();
    ctx.restore();
    // a badge on the chest: the alpha mark for the king, a zone dot for the rest
    if (pose.crown) {
      paint(ctx, shape([[0, -24, true], [9, -14, true], [0, -4, true], [-9, -14, true]], true, 0.3, sd + 4), '#FFE53B', { lw: lw * 0.7 });
    }
  }
  ctx.restore();

  ctx.save();
  ctx.translate(lunge * 0.3, bob - lunge * 0.2);
  // big kin carry bigger heads, quick ones smaller (scaled about the neck)
  const hb = 1 + (bulk - 1) * 0.45;
  ctx.translate(0, -36); ctx.scale(hb, hb); ctx.translate(0, 36);

  /* behind the head: mane, quills, fins */
  if (look.ears === 'mane') {
    paint(ctx, shape(spikes(0, -64, 40, 56, 13, t * 0.05 + sd), true, 1.4, sd + 5), col(fur2), o(fur2));
    if (!ghost) paint(ctx, shape(spikes(0, -64, 34, 46, 11, -t * 0.04 + sd * 2), true, 1, sd + 6), mix(fur, fur2, 0.5), { lw: lw * 0.8, shadow: 4 });
  }
  if (look.quills) {
    const q: P[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = -Math.PI * 0.98 + (i / 14) * Math.PI * 0.96;
      const r = i % 2 ? 36 : 64 + (i % 4 === 2 ? 6 : 0);
      q.push([Math.cos(a) * r, -60 + Math.sin(a) * r, true]);
    }
    paint(ctx, shape(q, true, 1, sd + 7), col(fur2), o(fur2));
    if (!ghost) for (let i = 1; i < 14; i += 2) {
      const a = -Math.PI * 0.98 + (i / 14) * Math.PI * 0.96;
      ctx.save(); ctx.fillStyle = belly; ctx.beginPath(); ctx.arc(Math.cos(a) * 60, -60 + Math.sin(a) * 60, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  if (look.fins) for (const s of [-1, 1]) paint(ctx, shape([[s * 26, -70], [s * 50, -84, true], [s * 44, -66], [s * 54, -56, true], [s * 28, -52]], true, 0.8, sd + 8 + s), col(fur2), o(fur2));

  /* ears */
  ears(ctx, look, col(fur), col(fur2), col(belly), t, sd, lw, ghost);

  /* head */
  const head: P[] = [
    ...ell(0, -64, 31, 29, 7, 0, -Math.PI * 0.96, -Math.PI * 0.04),
    ...zig(30, -64, 25, -43, 3, 6),
    [13, -36], [0, -33], [-13, -36],
    ...zig(-25, -43, -30, -64, 3, 6),
  ];
  const headPath = shape(head, true, 0.9, sd + 9);
  paint(ctx, headPath, col(fur), o(fur));
  if (ghost) { ctx.restore(); ctx.restore(); return; }

  /* markings */
  ctx.save();
  ctx.clip(headPath);
  if (look.mark === 'mask') paint(ctx, shape([[-34, -74], [-10, -79], [0, -72, true], [10, -79], [34, -74], [28, -58], [10, -58], [0, -63, true], [-10, -58], [-28, -58]], true, 0.6, sd + 10), fur2, { lw: lw * 0.6 });
  if (look.mark === 'stripe') paint(ctx, shape([[-6, -96], [6, -96], [3, -74], [-3, -74]], true, 0.5, sd + 11), fur2, { lw: lw * 0.6 });
  if (look.mark === 'blaze') paint(ctx, shape([[-5, -96], [5, -96], [7, -60], [-7, -60]], true, 0.5, sd + 12), belly, { lw: lw * 0.6 });
  if (look.mark === 'spots') for (let i = 0; i < 5; i++) { ctx.fillStyle = fur2; ctx.beginPath(); ctx.arc(-20 + i * 10, -84 + (i % 2) * 6, 3, 0, Math.PI * 2); ctx.fill(); }
  // cheek fluff, lighter
  paint(ctx, shape([[-30, -58], [-12, -56], [-8, -40], [-22, -42]], true, 0.6, sd + 13), mix(fur, belly, 0.35), { lw: 0, noStroke: true });
  paint(ctx, shape([[30, -58], [12, -56], [8, -40], [22, -42]], true, 0.6, sd + 14), mix(fur, belly, 0.35), { lw: 0, noStroke: true });
  ctx.restore();
  // re-ink the head outline over the markings
  stroke(ctx, headPath, lw);

  /* cyber cheek line */
  ctx.save();
  ctx.shadowColor = eye; ctx.shadowBlur = 8; ctx.strokeStyle = eye; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(22, -60); ctx.lineTo(27, -55); ctx.lineTo(27, -48); ctx.stroke();
  ctx.fillStyle = eye; ctx.beginPath(); ctx.arc(27, -47, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* snout */
  snout(ctx, typeId, look, fur, fur2, belly, lw, sd);

  /* eyes */
  eyes(ctx, look, eye, t, sd, lw, asleep, pose.hp);

  if (look.whiskers) {
    const w = shape([[-12, -50], [-34, -54]], false, 0.6, sd + 20);
    const w2 = shape([[-12, -47], [-34, -45]], false, 0.6, sd + 21);
    for (const p of [w, w2]) { stroke(ctx, p, lw * 0.35); ctx.save(); ctx.scale(-1, 1); stroke(ctx, p, lw * 0.35); ctx.restore(); }
  }

  /* gear for the working kin */
  if (typeId === 14) moleGear(ctx, lw, sd, t, asleep);
  if (typeId === 15) badgerGear(ctx, lw, sd);

  if (pose.crown) crown(ctx, lw, sd, t);
  // wounds: scratch marks when low
  if (pose.hp != null && pose.hp < 0.55) {
    const s = shape([[-22, -82], [-8, -70]], false, 0.6, sd + 30);
    const s2 = shape([[-16, -86], [-2, -74]], false, 0.6, sd + 31);
    stroke(ctx, s, lw * 0.6, '#FF2E88'); stroke(ctx, s2, lw * 0.6, '#FF2E88');
    if (pose.hp < 0.3) paint(ctx, shape([[8, -50, true], [26, -52, true], [24, -44, true], [10, -42, true]], true, 0.4, sd + 32), PAPER, { lw: lw * 0.6 });
  }
  ctx.restore();
  ctx.restore();
}

function ears(ctx: CanvasRenderingContext2D, look: Look, fur: string, fur2: string, belly: string, t: number, sd: number, lw: number, ghost: boolean) {
  const twitch = (side: number) => {
    const k = (t * 0.7 + sd * 0.37 + side * 0.5) % 5;
    return k < 0.25 ? Math.sin(k / 0.25 * Math.PI) * 0.22 * side : 0;
  };
  const o = { lw, shadow: ghost ? 0 : 4 };
  const pair = (outer: P[], inner: P[] | null, pivot: [number, number], innerFill = '#FF9EC4') => {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(pivot[0] * side, pivot[1]);
      ctx.rotate(twitch(side));
      ctx.translate(-pivot[0] * side, -pivot[1]);
      const out = side < 0 ? outer : mirror(outer);
      paint(ctx, shape(out, true, 0.8, sd + 40 + side), fur, o);
      if (inner && !ghost) { const inn = side < 0 ? inner : mirror(inner); paint(ctx, shape(inn, true, 0.6, sd + 42 + side), innerFill, { lw: lw * 0.6 }); }
      ctx.restore();
    }
  };
  switch (look.ears) {
    case 'sharp': pair([[-29, -76, true], [-34, -118, true], [-8, -90, true]], [[-26, -82, true], [-30, -106, true], [-14, -91, true]], [-20, -84]); break;
    case 'round': pair(ell(-25, -88, 12, 12, 9), ell(-25, -88, 6.5, 6.5, 7), [-22, -82]); break;
    case 'tiny': pair(ell(-24, -86, 7, 6, 7), null, [-22, -82]); break;
    case 'long': pair(ell(-15, -116, 9, 27, 10, -0.18), ell(-15, -114, 4.5, 19, 8, -0.18), [-12, -90], belly === PAPER ? '#FF9EC4' : mix(belly, '#FF9EC4', 0.5)); break;
    case 'bat': pair([[-24, -78, true], [-50, -128, true], [-36, -110], [-34, -122, true], [-22, -104], [-8, -90, true]], [[-24, -86, true], [-40, -116, true], [-14, -94, true]], [-18, -86], fur2); break;
    case 'tufted': pair([[-27, -82, true], [-42, -114, true], [-30, -100], [-30, -110, true], [-12, -90, true]], null, [-20, -86]); break;
    case 'mane': pair(ell(-26, -86, 8, 8, 8), ell(-26, -86, 4, 4, 6), [-24, -82]); break;
    case 'nub': pair([[-28, -80, true], [-30, -100, true], [-15, -88, true]], [[-26, -84, true], [-27, -95, true], [-19, -88, true]], [-22, -84]); break;
    case 'floppy': pair([[-24, -86, true], [-46, -86], [-44, -64, true], [-34, -72]], [[-28, -84, true], [-40, -82], [-39, -70, true]], [-24, -84]); break;
    default: break;
  }
}

function snout(ctx: CanvasRenderingContext2D, typeId: number, look: Look, _fur: string, fur2: string, belly: string, lw: number, sd: number) {
  const nose = () => paint(ctx, shape([[-6, -58, true], [6, -58, true], [0, -51, true]], true, 0.3, sd + 50), INK, { lw: lw * 0.6 });
  const mouth = (y = -45) => stroke(ctx, shape([[-7, y + 1], [-2, y + 3], [0, y], [2, y + 3], [7, y + 1]], false, 0.4, sd + 51), lw * 0.5);
  switch (look.snout) {
    case 'long': {
      paint(ctx, shape([[-15, -62], [15, -62], [7, -40], [0, -36, true], [-7, -40]], true, 0.6, sd + 52), belly, { lw: lw * 0.8, shadow: 3 });
      paint(ctx, shape(ell(0, -40, 5.5, 4.2, 8), true, 0.3, sd + 53), INK, { lw: lw * 0.5 });
      break;
    }
    case 'flat': {
      paint(ctx, shape(ell(0, -50, 17, 10.5, 10), true, 0.6, sd + 54), belly, { lw: lw * 0.8, shadow: 3 });
      paint(ctx, shape(ell(0, -55, 6.5, 4.5, 8), true, 0.3, sd + 55), INK, { lw: lw * 0.5 });
      mouth(-46);
      break;
    }
    case 'beak': {
      paint(ctx, shape([[-8, -62, true], [8, -62, true], [0, -42, true]], true, 0.4, sd + 56), '#FFB627', { lw: lw * 0.8, shadow: 3 });
      break;
    }
    case 'horn': {
      paint(ctx, shape(ell(0, -51, 15, 11, 10), true, 0.6, sd + 57), belly, { lw: lw * 0.8, shadow: 3 });
      paint(ctx, shape([[-8, -57, true], [-4, -76], [4, -98, true], [5, -76], [8, -57, true]], true, 0.6, sd + 58), BONE, { lw: lw * 0.85, shadow: 3 });
      paint(ctx, shape([[-4, -54, true], [4, -54, true], [0, -50, true]], true, 0.2, sd + 59), INK, { lw: lw * 0.5 });
      break;
    }
    case 'tusk': {
      paint(ctx, shape(ell(0, -50, 16, 11, 10), true, 0.6, sd + 60), belly, { lw: lw * 0.8, shadow: 3 });
      if (typeId === 12) {
        for (const s of [-1, 1]) paint(ctx, shape([[s * 9, -46, true], [s * 11, -24], [s * 9, -6, true], [s * 5, -26], [s * 4, -46, true]], true, 0.5, sd + 61 + s), BONE, { lw: lw * 0.8 });
      } else {
        for (const s of [-1, 1]) paint(ctx, shape([[s * 9, -46, true], [s * 20, -60, true], [s * 13, -46, true]], true, 0.4, sd + 63 + s), BONE, { lw: lw * 0.7 });
      }
      if (typeId === 12) paint(ctx, shape(ell(0, -54, 7, 5, 8), true, 0.3, sd + 65), mix(fur2, INK, 0.4), { lw: lw * 0.5 });
      else {
        // a pig's disc nose with two nostrils
        paint(ctx, shape(ell(0, -52, 11, 8, 10), true, 0.4, sd + 65), '#FF9EC4', { lw: lw * 0.7, shadow: 2 });
        for (const s of [-1, 1]) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(s * 4, -52, 1.8, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      break;
    }
    default: {
      paint(ctx, shape(ell(0, -51, 13.5, 10.5, 10), true, 0.6, sd + 66), belly, { lw: lw * 0.8, shadow: 3 });
      nose(); mouth();
      // a few kin show their teeth: the hare's buck teeth, the bat's fangs
      if (typeId === 7) paint(ctx, shape([[-3.5, -45, true], [3.5, -45, true], [3.5, -38, true], [-3.5, -38, true]], true, 0.2, sd + 67), PAPER, { lw: lw * 0.45 });
      if (typeId === 6) for (const k of [-1, 1]) paint(ctx, shape([[k * 6, -45, true], [k * 2.5, -45, true], [k * 4.5, -38, true]], true, 0.2, sd + 68 + k), PAPER, { lw: lw * 0.4 });
    }
  }
}

function eyes(ctx: CanvasRenderingContext2D, look: Look, eye: string, t: number, sd: number, lw: number, asleep: boolean, hp?: number) {
  if (look.mark === 'brow') {
    for (const s of [-1, 1]) stroke(ctx, shape([[s * 25, -80], [s * 8, -74]], false, 0.4, sd + 70 + s), lw * 1.05);
  }
  if (asleep) {
    for (const s of [-1, 1]) stroke(ctx, shape([[s * 21, -67], [s * 14, -63], [s * 7, -67]], false, 0.4, sd + 72 + s), lw * 0.7);
    return;
  }
  const phase = (t + sd * 1.37) % (3.6 + (sd % 5) * 0.4);
  const open = phase < 0.14 ? Math.abs(phase / 0.07 - 1) : 1;
  const big = look.snout === 'beak' ? 1.35 : 1;
  const pulse = 0.75 + 0.25 * Math.sin(t * 3 + sd);
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 14, -67);
    ctx.scale(big, Math.max(0.08, open) * big);
    const p = shape([[s * -10, 0.5, true], [s * -1, -5], [s * 9, -2.5, true], [s * 1, 4.5]], true, 0.25, sd + 74 + s);
    ctx.save();
    ctx.shadowColor = eye; ctx.shadowBlur = 14 * pulse;
    ctx.fillStyle = eye; ctx.fill(p);
    ctx.restore();
    ctx.lineWidth = lw * 0.45 / Math.max(0.08, open); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    ctx.stroke(p);
    if (open > 0.5) {
      // a slit pupil in a bright iris, and a hard glint
      ctx.fillStyle = mix(eye, '#ffffff', 0.55);
      ctx.beginPath(); ctx.ellipse(s * 0.5, 0, 3.6, 3.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(s * 0.5, 0, 1.1, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s * -4.5, -2.6, 2, 2);
    }
    ctx.restore();
  }
  if (hp != null && hp < 0.3) {
    // a bandage over one eye when nearly felled
    paint(ctx, shape([[-26, -74, true], [-2, -62, true], [-4, -57, true], [-28, -69, true]], true, 0.3, sd + 76), PAPER, { lw: lw * 0.6 });
  }
}

function wings(ctx: CanvasRenderingContext2D, typeId: number, fur2: string, fur: string, t: number, sd: number, lw: number, ghost: boolean) {
  const flap = Math.sin(t * 3.2 + sd) * 0.12;
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 34, -26);
    ctx.rotate(s * flap);
    if (typeId === 6) {
      // bat: membrane with fingers
      const pts: P[] = [[0, 0, true], [s * 34, -48, true], [s * 74, -62, true], [s * 66, -34], [s * 70, -14, true], [s * 52, -16], [s * 42, 2, true], [s * 26, -6], [s * 14, 8, true]];
      paint(ctx, shape(pts, true, 1, sd + 80 + s), fur2, { lw, shadow: ghost ? 0 : 5 });
      if (!ghost) for (const [fx, fy] of [[66, -34], [52, -16], [26, -6]]) stroke(ctx, shape([[s * 30, -46], [s * fx, fy]], false, 0.5, sd + 82), lw * 0.5);
    } else {
      // feathers
      const pts: P[] = [[0, 0, true], [s * 30, -52], [s * 72, -58, true], [s * 64, -40, true], [s * 74, -30, true], [s * 58, -18, true], [s * 64, -6, true], [s * 40, -2, true], [s * 18, 10, true]];
      paint(ctx, shape(pts, true, 1, sd + 84 + s), fur2, { lw, shadow: ghost ? 0 : 5 });
      if (!ghost) paint(ctx, shape([[s * 6, -6], [s * 28, -40], [s * 52, -44, true], [s * 34, -18, true]], true, 0.6, sd + 86 + s), fur, { lw: lw * 0.6 });
    }
    ctx.restore();
  }
}

function crown(ctx: CanvasRenderingContext2D, lw: number, sd: number, t: number) {
  const y = -104 + Math.sin(t * 2) * 2;
  const pts: P[] = [[-17, y + 10, true], [-20, y - 10, true], [-9, y, true], [0, y - 16, true], [9, y, true], [20, y - 10, true], [17, y + 10, true]];
  ctx.save();
  ctx.shadowColor = '#FFE53B'; ctx.shadowBlur = 16;
  paint(ctx, shape(pts, true, 0.5, sd + 90), '#FFE53B', { lw: lw * 0.8, shadow: 3 });
  ctx.restore();
  paint(ctx, shape(ell(0, y + 2, 3.5, 3.5, 6), true, 0.2, sd + 91), '#FF2E88', { lw: lw * 0.5 });
}

function moleGear(ctx: CanvasRenderingContext2D, lw: number, sd: number, t: number, asleep: boolean) {
  // a miner's helmet with a lamp, and two huge digging claws
  paint(ctx, shape([...ell(0, -80, 30, 18, 9, 0, Math.PI, Math.PI * 2), [32, -78, true], [-32, -78, true]], true, 0.6, sd + 100), '#FFB627', { lw, shadow: 4 });
  const lamp = shape(ell(0, -92, 7, 6, 8), true, 0.3, sd + 101);
  ctx.save();
  if (!asleep) { ctx.shadowColor = '#FFE53B'; ctx.shadowBlur = 20; }
  paint(ctx, lamp, asleep ? '#7a7058' : '#FFF8E7', { lw: lw * 0.7 });
  ctx.restore();
  if (!asleep) {
    ctx.save();
    ctx.globalAlpha *= 0.18 + 0.06 * Math.sin(t * 5);
    ctx.fillStyle = '#FFE53B';
    ctx.beginPath(); ctx.moveTo(-5, -94); ctx.lineTo(-40, -150); ctx.lineTo(40, -150); ctx.lineTo(5, -94); ctx.fill();
    ctx.restore();
  }
  for (const s of [-1, 1]) {
    const dig = asleep ? 0 : Math.sin(t * 6 + s) * 3;
    ctx.save();
    ctx.translate(s * 30, -12 + dig);
    paint(ctx, shape(ell(0, 0, 15, 12, 9), true, 0.6, sd + 102 + s), '#FF9EC4', { lw, shadow: 3 });
    for (let k = -1; k <= 1; k++) paint(ctx, shape([[k * 8 - 3, 8, true], [k * 9, 24, true], [k * 8 + 3, 8, true]], true, 0.3, sd + 104 + k), BONE, { lw: lw * 0.6 });
    ctx.restore();
  }
}

function badgerGear(ctx: CanvasRenderingContext2D, lw: number, sd: number) {
  // forge goggles on the brow and a leather apron strap
  for (const s of [-1, 1]) {
    paint(ctx, shape(ell(s * 13, -84, 9, 7, 8), true, 0.3, sd + 110 + s), '#FF7A1A', { lw: lw * 0.7 });
    paint(ctx, shape(ell(s * 13, -84, 5, 3.6, 7), true, 0.2, sd + 112 + s), '#FFE53B', { lw: lw * 0.4, glow: '#FF7A1A' });
  }
  stroke(ctx, shape([[-22, -84], [-30, -82]], false, 0.2, sd + 114), lw * 0.9);
  stroke(ctx, shape([[22, -84], [30, -82]], false, 0.2, sd + 115), lw * 0.9);
  paint(ctx, shape([[-30, -26, true], [-22, -26, true], [10, 2, true], [2, 2, true]], true, 0.3, sd + 116), '#8A5A3C', { lw: lw * 0.6 });
}
