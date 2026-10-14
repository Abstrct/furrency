/* The clash, drawn as a split comic page: your pack on the left (cyan), theirs on the right (pink),
 * a jagged crack between. Four lanes run across — STAR, SKY, ROOT, TIDE — so who can reach whom
 * reads at a glance. Their totems stand at the far right. Blows fly as beams with POW and slashes;
 * the fallen tumble out with a K.O. */
import { INK, PAPER, burst, halftone, letter, paint, shape, FONT_BOOM } from '../art/ink';
import { drawKin } from '../art/totem';
import { headAt } from '../art/beast';
import { Fx } from '../art/fx';
import type { Hit, Scene } from '../art/stage';
import { drawGlyph } from '../ui/glyphs';
import { REALM_COLOR, REALMS, type Realm } from '../lore';
import { seedOf } from './den';

export interface Fighter { id: string; type: number; zone: Realm | 'totem'; hp: number; maxHp: number; asleep: boolean; hidden: boolean; king: boolean; guard: boolean; reachable?: boolean }
export interface ClashView { ours: Fighter[]; theirs: Fighter[]; oursName: string; theirsName: string; atk: string | null; mark: string | null; guardOf: string | null; abroad: boolean; defending: boolean; snatch: number | null; noFoe: boolean }

const LANES: Realm[] = ['star', 'sky', 'root', 'tide'];

export class ProwlScene implements Scene {
  view: ClashView = { ours: [], theirs: [], oursName: '', theirsName: '', atk: null, mark: null, guardOf: null, abroad: false, defending: false, snatch: null, noFoe: true };
  fx = new Fx();
  onPick: (id: string, side: 'ours' | 'theirs') => void = () => {};
  hovered: string | null = null;
  inset = { top: 70, bottom: 190 };
  private pos = new Map<string, { x: number; y: number; s: number }>();
  private falling = new Map<string, { t: number; type: number; x: number; y: number; s: number; enemy: boolean }>();
  private flash = new Map<string, number>();
  private lunge = new Map<string, number>();


  set(v: ClashView) { this.view = v; }
  head(id: string) { const p = this.pos.get(id); if (!p) return null; const a = headAt(p.s); return { x: p.x + a.dx, y: p.y + a.dy, s: p.s }; }

  /** A blow: a beam from striker to the one it lands on, then the words. */
  blow(from: string, to: string, o: { ours: boolean; miss?: boolean; dmg?: number; blocked?: boolean; felled?: boolean; word?: string }) {
    const a = this.head(from), b = this.head(to);
    if (!a || !b) return;
    this.lunge.set(from, 1);
    this.fx.beam(a.x, a.y, b.x, b.y, o.ours ? '#FFE53B' : '#FF2E88');
    setTimeout(() => {
      if (o.miss) { this.fx.word(o.word || 'MISS', b.x, b.y - b.s * 1.05, '#FFF8E7', 44, '#B89BFF'); return; }
      this.flash.set(to, 1);
      this.fx.slash(b.x, b.y, o.ours ? '#FFE53B' : '#FF2E88', b.s * 0.9);
      this.fx.sparks(b.x, b.y, 14, o.ours ? '#FFE53B' : '#FF2E88');
      this.fx.word(o.blocked ? 'BLOCK!' : o.dmg && o.dmg >= 2 ? 'WHAM!' : 'POW!', b.x + (o.ours ? -50 : 50), b.y - b.s * 1.05, '#FFE53B', 54, o.blocked ? '#22E4FF' : '#FF2E88');
      if (o.dmg) this.fx.word(`−${o.dmg}`, b.x + b.s * 0.7, b.y - b.s * 0.2, '#FFF8E7', 30, INK);
    }, 260);
  }
  fall(id: string) {
    const p = this.pos.get(id);
    const f = [...this.view.ours, ...this.view.theirs].find((x) => x.id === id);
    if (!p || !f || this.falling.has(id)) return;
    this.falling.set(id, { t: 0, type: f.type, x: p.x, y: p.y, s: p.s, enemy: this.view.theirs.includes(f) });
    this.fx.word('K.O.!', p.x, p.y - p.s * 1.4, '#FFF8E7', 60, '#FF2E88');
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, hits: Hit[]) {
    const v = this.view;
    const top = this.inset.top, bot = h - this.inset.bottom;
    const laneH = Math.max(60, (bot - top) / 4);
    if (bot - top < 240) { /* a very short screen: lanes overflow downward rather than invert */ }
    // on a narrow screen the split leans left: their side (a whole den) needs the room
    const narrow = w < 700;
    const mid = narrow ? w * 0.4 : w * 0.5;
    // the split page
    ctx.fillStyle = '#22E4FF'; ctx.fillRect(0, 0, w, h);
    const crack = (y: number) => mid + Math.sin(y * 0.02) * 14 + (y / h - 0.5) * -60 + ((Math.floor(y / 40) % 2) ? 10 : -10);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(crack(0), 0);
    for (let y = 0; y <= h; y += 40) ctx.lineTo(crack(y), y);
    ctx.lineTo(w, h); ctx.closePath();
    ctx.fillStyle = v.noFoe ? '#3a2a50' : '#FF2E88'; ctx.fill();
    ctx.restore();
    const pat = halftone(ctx, INK, 12, 2.1, 0.2);
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
    // lanes
    LANES.forEach((z, i) => {
      const y0 = top + i * laneH;
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = i % 2 ? '#FFFFFF' : INK;
      ctx.fillRect(0, y0, w, laneH);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(0, y0 + laneH); ctx.lineTo(w, y0 + laneH); ctx.stroke();
      ctx.restore();
      // lane sign in the middle
      const cy = y0 + laneH / 2;
      ctx.save();
      if (narrow) {
        // a phone: just the zone's sign, tucked at the left edge of the lane
        paint(ctx, shape([[4, y0 + 4, true], [30, y0 + 4, true], [30, y0 + 30, true], [4, y0 + 30, true]], true, 0.4, 30 + i), INK, { lw: 2 });
        drawGlyph(ctx, z, 17, y0 + 17, 18, REALM_COLOR[z], 2.6);
      } else {
        paint(ctx, shape([[mid - 34, cy - 18, true], [mid + 34, cy - 18, true], [mid + 34, cy + 18, true], [mid - 34, cy + 18, true]], true, 0.6, 30 + i), INK, { lw: 3 });
        drawGlyph(ctx, z, mid - 18, cy, 22, REALM_COLOR[z], 3);
        ctx.font = `17px ${FONT_BOOM}`; ctx.fillStyle = REALM_COLOR[z]; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(z.toUpperCase(), mid - 4, cy + 1);
      }
      ctx.restore();
    });
    // names
    letter(ctx, v.oursName || 'YOU', 22, top - 30, 34, PAPER, { align: 'left', shadow: INK });
    if (!v.noFoe) letter(ctx, v.theirsName, w - 22, top - 30, 34, PAPER, { align: 'right', shadow: INK });
    if (v.noFoe) letter(ctx, 'PICK PREY', w * 0.75, h * 0.42, 48, '#FFE53B', { rot: 0.05 });
    if (!v.ours.length) letter(ctx, 'NO PACK', w * 0.25, h * 0.42, 48, '#FFF8E7', { rot: -0.05 });

    // where everyone stands
    const place = (list: Fighter[], side: 'ours' | 'theirs') => {
      const totems = list.filter((f) => f.zone === 'totem');
      for (const z of LANES) {
        const row = list.filter((f) => f.zone === z);
        const n = row.length;
        const totemW = side === 'theirs' && totems.length ? (narrow ? 44 : w * 0.1) : 0;
        const edge = narrow ? 34 : 40;
        const span = (side === 'ours' ? mid : w - mid) - edge - 30 - totemW;
        const s = Math.min(laneH * 0.78, 96, span / Math.max(1, n) * 0.95);
        row.forEach((f, i) => {
          const k = (i + 0.5) / Math.max(1, n);
          const x = side === 'ours' ? edge + span * (1 - k) : w - edge - totemW - span * (1 - k);
          const y = top + LANES.indexOf(z) * laneH + laneH * 0.9;
          this.target(f.id, x, y, f.king ? s * 1.12 : s, dt);
        });
      }
      totems.forEach((f, i) => {
        const n = totems.length;
        const s = Math.max(24, Math.min(laneH * 0.7, narrow ? 44 : 80, (bot - top) / Math.max(1, n) * 0.8));
        const y = top + (bot - top) * ((i + 1) / (n + 0.4));
        this.target(f.id, w - (narrow ? 22 : 30) - s * 0.5 - (narrow ? 0 : (i % 2) * s * 0.5), y, s, dt);
      });
    };
    place(v.ours, 'ours');
    place(v.theirs, 'theirs');
    const alive = new Set([...v.ours, ...v.theirs].map((f) => f.id));
    for (const id of [...this.pos.keys()]) if (!alive.has(id) && !this.falling.has(id)) this.pos.delete(id);

    // the guard tether
    if (v.guardOf && v.mark) {
      const a = this.head(v.guardOf), b = this.head(v.mark);
      if (a && b) { ctx.save(); ctx.strokeStyle = '#22E4FF'; ctx.lineWidth = 4; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore(); }
    }
    // the aim line from striker to mark
    if (v.atk && v.mark) {
      const a = this.head(v.atk), b = this.head(v.mark);
      if (a && b) {
        ctx.save();
        ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.strokeStyle = '#FFE53B'; ctx.lineWidth = 3.5; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 60; ctx.stroke();
        ctx.restore();
      }
    }

    const drawSide = (list: Fighter[], enemy: boolean) => {
      for (const f of [...list].sort((a, b) => (this.pos.get(a.id)?.y || 0) - (this.pos.get(b.id)?.y || 0))) {
        const p = this.pos.get(f.id); if (!p) continue;
        if (this.falling.has(f.id)) continue;
        const isAtk = v.atk === f.id, isMark = v.mark === f.id, hov = this.hovered === f.id;
        if (isAtk || isMark || hov) {
          const hd = headAt(p.s);
          ctx.save();
          ctx.strokeStyle = INK; ctx.lineWidth = 10;
          ctx.beginPath(); ctx.arc(p.x, p.y + hd.dy, p.s * 0.62, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = isAtk ? '#FFE53B' : isMark ? '#FFF8E7' : PAPER; ctx.lineWidth = 5; ctx.setLineDash(isMark ? [6, 6] : [14, 8]); ctx.lineDashOffset = t * (isAtk ? -40 : 40);
          ctx.stroke();
          ctx.restore();
          if (isMark) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + t; ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * p.s * 0.5, p.y + hd.dy + Math.sin(a) * p.s * 0.5); ctx.lineTo(p.x + Math.cos(a) * p.s * 0.78, p.y + hd.dy + Math.sin(a) * p.s * 0.78); ctx.stroke(); ctx.restore(); }
        }
        const fl = this.flash.get(f.id) || 0; if (fl) this.flash.set(f.id, Math.max(0, fl - dt * 3));
        const lg = this.lunge.get(f.id) || 0; if (lg) this.lunge.set(f.id, Math.max(0, lg - dt * 2.2));
        ctx.save();
        if (enemy && v.atk && f.reachable === false && !isMark) ctx.globalAlpha = 0.5;
        const dx = Math.sin(lg * Math.PI) * 26 * (enemy ? -1 : 1);
        drawKin(ctx, f.type, p.x + dx, p.y, p.s, { t, seed: seedOf(f.id), asleep: f.asleep, hidden: f.hidden, enemy, crown: f.king, flash: fl, hp: f.maxHp ? f.hp / f.maxHp : 1 });
        ctx.restore();
        if (f.guard) drawGlyph(ctx, 'guard', p.x - p.s * 0.48, p.y - p.s * 0.25, p.s * 0.28, PAPER, 3.2);
        if (enemy && v.atk && f.reachable) drawGlyph(ctx, 'pounce', p.x + p.s * 0.45, p.y - p.s * 1.1, p.s * 0.24, '#FFE53B', 3);
        // fur pips
        // fur as hearts, the same sign as everywhere else
        const pips = Math.min(f.maxHp, 10), hs = Math.max(7, Math.min(12, p.s * 0.12));
        for (let k = 0; k < pips; k++) heart(ctx, p.x - (pips - 1) * hs * 0.55 + k * hs * 1.1, p.y + 10, hs, k < f.hp ? '#FF2E88' : '#3a2a50');
        hits.push({ id: f.id, x: p.x, y: p.y - p.s * 0.6, r: p.s * 0.6 });
      }
    };
    drawSide(v.ours, false);
    drawSide(v.theirs, true);

    // the fallen tumble out of the panel
    for (const [id, f] of this.falling) {
      f.t += dt;
      if (f.t > 1.4) { this.falling.delete(id); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.4);
      ctx.translate(f.x + (f.enemy ? 1 : -1) * f.t * 120, f.y + f.t * f.t * 260);
      ctx.rotate((f.enemy ? 1 : -1) * f.t * 2.2);
      drawKin(ctx, f.type, 0, 0, f.s, { t, seed: seedOf(id), enemy: f.enemy, flash: Math.max(0, 1 - f.t * 2) });
      ctx.restore();
    }

    // the snatch howl, over their den
    if (v.snatch != null) {
      const cx = w * 0.75, cy = top + 4;
      ctx.save();
      paint(ctx, shape([[cx - 150, cy - 2, true], [cx + 150, cy - 2, true], [cx + 150, cy + 26, true], [cx - 150, cy + 26, true]], true, 0.4, 61), INK, { lw: 3 });
      ctx.fillStyle = '#FFE53B'; ctx.fillRect(cx - 146, cy + 2, 292 * Math.max(0.03, v.snatch), 20);
      ctx.restore();
      letter(ctx, `SNATCH ${Math.round(v.snatch * 100)}%`, cx, cy + 12, 18, PAPER, { shadow: 'none', outline: 3 });
    }
    // VS when the packs are apart
    if (!v.abroad && !v.defending && !v.noFoe) {
      burst(ctx, mid, top - 26, 40, '#FFE53B', 10, 4, 7, t * 0.4);
      letter(ctx, 'VS', mid, top - 26, 34, INK, { shadow: 'none', outline: 0.01 });
    }
    this.fx.draw(ctx, dt);
  }

  private target(id: string, x: number, y: number, s: number, dt: number) {
    const p = this.pos.get(id);
    if (!p) { this.pos.set(id, { x, y, s }); return; }
    const k = 1 - Math.exp(-dt * 6);
    p.x += (x - p.x) * k; p.y += (y - p.y) * k; p.s += (s - p.s) * k;
  }

  pick(hit: Hit | null) {
    if (!hit) return;
    const ours = this.view.ours.some((f) => f.id === hit.id);
    this.onPick(hit.id, ours ? 'ours' : 'theirs');
  }
  hover(hit: Hit | null) { this.hovered = hit?.id ?? null; }
}
function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s / 12, s / 12);
  ctx.beginPath();
  ctx.moveTo(0, 5); ctx.bezierCurveTo(-7, 0, -6, -6, -3, -6); ctx.bezierCurveTo(-1.5, -6, 0, -4.5, 0, -3.5); ctx.bezierCurveTo(0, -4.5, 1.5, -6, 3, -6); ctx.bezierCurveTo(6, -6, 7, 0, 0, 5);
  ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
export { REALMS };
