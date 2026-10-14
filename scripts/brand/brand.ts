/* Brand renders, drawn with the game's own ink: the social share card (1200×630) and the app icons.
 *   /scripts/brand/brand.html?mode=og            → the card pasted links show (Twitter, Discord, Slack…)
 *   /scripts/brand/brand.html?mode=icon&size=512 → the alpha-coin icon (also 192, 180)
 * scripts/brand/render.mjs screenshots these into public/. */
import { INK, burst, halftone, letter, speedLines, FONT_TITLE, FONT_BOOM, FONT_UI } from '../../src/art/ink';
import { setBoil } from '../../src/art/ink';
import { drawKin } from '../../src/art/totem';

const q = new URLSearchParams(location.search);
const mode = q.get('mode') || 'og';
const c = document.getElementById('c') as HTMLCanvasElement;
const ctx = c.getContext('2d')!;
const W = mode === 'og' ? 1200 : Number(q.get('size') || 512), H = mode === 'og' ? 630 : W;
c.width = W; c.height = H; c.style.width = `${W}px`; c.style.height = `${H}px`;
const t = 2.4;

function coin(x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.3, '#FFE53B'); g.addColorStop(1, '#FF7A1A');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = r * 0.12; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = `900 ${r * 1.15}px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('α', x, y + r * 0.04);
}

function og() {
  const g = ctx.createRadialGradient(W * 0.72, H * 0.55, 10, W * 0.72, H * 0.55, W * 0.75);
  g.addColorStop(0, '#FF2E88'); g.addColorStop(0.38, '#7A3CFF'); g.addColorStop(1, '#140C2B');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pat = halftone(ctx, INK, 11, 2.2, 0.3); if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); }
  speedLines(ctx, W * 0.72, H * 0.5, 170, W, 54, 'rgba(255,229,59,0.34)', 4, 1.6);
  // a few kin around the king
  const ring: [number, number, number, number][] = [[6, 1120, 250, 92], [11, 660, 596, 88], [9, 1125, 596, 92], [7, 1010, 150, 62], [3, 690, 230, 70]];
  for (const [type, x, y, s] of ring) drawKin(ctx, type, x, y, s, { t, seed: type * 11, still: true });
  burst(ctx, 905, 265, 190, '#FFE53B', 16, 6, 4, 0.1);
  drawKin(ctx, 1, 905, 596, 290, { t, seed: 1, crown: true, still: true });
  for (const [x, y, r] of [[540, 88, 22], [1150, 72, 26], [600, 470, 18]] as [number, number, number][]) coin(x, y, r);
  ctx.save(); ctx.translate(56, 150); ctx.rotate(-0.06);
  letter(ctx, 'FUR', 0, 0, 150, '#FFE53B', { font: FONT_TITLE, align: 'left', shadow: '#FF2E88', outline: 8 });
  letter(ctx, 'RENCY', 0, 138, 150, '#FFE53B', { font: FONT_TITLE, align: 'left', shadow: '#FF2E88', outline: 8 });
  ctx.restore();
  // the tagline sticker and the four verbs
  ctx.save(); ctx.translate(70, 392); ctx.rotate(-0.06);
  ctx.fillStyle = INK; ctx.fillRect(8, 8, 452, 66); ctx.fillStyle = "#FFF8E7"; ctx.fillRect(0, 0, 452, 66);
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(0, 0, 452, 66);
  ctx.fillStyle = INK; ctx.font = `44px ${FONT_TITLE}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('BE THE ALPHA', 22, 36);
  ctx.restore();
  let x = 70;
  for (const [w, col] of [['DIG', '#22E4FF'], ['FORGE', '#FF7A1A'], ['POUNCE', '#FF2E88'], ['HOWL', '#FFF8E7']] as [string, string][]) {
    ctx.save(); ctx.translate(x, 488); ctx.rotate(-0.06);
    ctx.font = `34px ${FONT_BOOM}`; const ww = ctx.measureText(w).width + 26;
    ctx.fillStyle = INK; ctx.fillRect(5, 5, ww, 48); ctx.fillStyle = col; ctx.fillRect(0, 0, ww, 48);
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(0, 0, ww, 48);
    ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(w, ww / 2, 27);
    ctx.restore(); x += ww + 14;
  }
  ctx.fillStyle = 'rgba(10,6,18,0.82)'; ctx.fillRect(0, H - 40, W, 40);
  ctx.fillStyle = '#7CFF6B'; ctx.font = `20px ${FONT_BOOM}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('● LIVE ON THE STRUCTS NETWORK  ·  FUR BEASTS  ·  REAL CHIEFS  ·  ONE COIN: ALPHA', 22, H - 19);
}

function icon() {
  ctx.clearRect(0, 0, W, H);
  // rounded night tile, halftone, the coin
  const r = W * 0.22;
  ctx.fillStyle = '#140C2B'; ctx.beginPath(); ctx.roundRect(0, 0, W, H, r); ctx.fill();
  const pat = halftone(ctx, '#FF2E88', Math.max(6, W / 24), Math.max(1.5, W / 120), 0.35);
  if (pat) { ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, H, r); ctx.clip(); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  coin(W / 2, H / 2, W * 0.36);
}

setBoil(t, 0);
document.fonts.load(`40px "Dela Gothic One"`).then(() => document.fonts.load('40px Bangers')).then(() => document.fonts.ready).then(() => {
  if (mode === 'og') og(); else icon();
  document.title = 'ready';
});
