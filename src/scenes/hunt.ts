/* The hunt map: every chief's den as a little world circling their clan's sun. Dens holding shards
 * glow pink (prey); napping chiefs float with a Z; yours wears a crown. Drag to pan, wheel to zoom. */
import { INK, PAPER, burst, halftone, letter, paint, shape, ell, spikes, FONT_BOOM } from '../art/ink';
import { Fx } from '../art/fx';
import type { Hit, Scene } from '../art/stage';
import { drawGlyph } from '../ui/glyphs';

export interface HuntDen { id: string; name: string; clan: string; ore: number; nap: number; mine: boolean; away?: boolean; x: number; y: number; r: number }
export interface HuntClan { id: string; name: string; color: string; x: number; y: number; n: number }

export class HuntScene implements Scene {
  dens: HuntDen[] = [];
  clans: HuntClan[] = [];
  selected: string | null = null;
  hovered: string | null = null;
  filter: (d: HuntDen) => boolean = () => true;
  onPick: (id: string | null) => void = () => {};
  fx = new Fx();
  cam = { x: 0, y: 0, z: 0.35 };
  private goal = { x: 0, y: 0, z: 0.55 };
  private w = 0; private h = 0;
  inset = { l: 350, r: 370 };

  /** Lay the clans on a ring and their dens on a sunflower spiral around each. */
  set(dens: Omit<HuntDen, 'x' | 'y' | 'r'>[], clans: { id: string; name: string; color: string }[]) {
    const groups = new Map<string, Omit<HuntDen, 'x' | 'y' | 'r'>[]>();
    for (const d of dens) { const g = groups.get(d.clan) || []; g.push(d); groups.set(d.clan, g); }
    const order = [...groups.keys()].sort((a, b) => (groups.get(b)!.length - groups.get(a)!.length));
    // each clan is a little galaxy: its radius grows with the square root of its chiefs
    const STEP = 11;
    const radius = (n: number) => 60 + Math.sqrt(n) * STEP;
    const out: HuntDen[] = [];
    this.clans = [];
    let ringR = 0, angle = 0;
    order.forEach((id, i) => {
      const list = groups.get(id)!.sort((a, b) => b.ore - a.ore);
      const rad = radius(list.length);
      let x = 0, y = 0;
      if (i > 0) {
        // walk around the biggest galaxy, leaving room for each one
        if (!ringR) ringR = radius(groups.get(order[0])!.length) + rad + 120;
        angle += (rad + 60) / ringR;
        x = Math.cos(angle) * ringR; y = Math.sin(angle) * ringR;
        angle += (rad + 60) / ringR;
        if (angle > Math.PI * 2 - 0.3) { angle = 0; ringR += rad * 2 + 160; }
      }
      const c = clans.find((k) => k.id === id);
      this.clans.push({ id, name: c?.name || id, color: c?.color || '#FFE53B', x, y, n: list.length });
      list.forEach((d, k) => {
        const a = k * 2.39996, rr = 46 + Math.sqrt(k) * STEP;
        out.push({ ...d, x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr, r: 3.2 + Math.min(7, Math.sqrt(d.ore) * 0.5) });
      });
    });
    const had = this.dens.length;
    this.dens = out;
    if (!had && out.length) this.frame();
  }

  /** Fit every galaxy in the open part of the screen (between the side panels). */
  frame() {
    const xs = this.dens.map((d) => d.x), ys = this.dens.map((d) => d.y);
    if (!xs.length) return;
    const x0 = Math.min(...xs) - 60, x1 = Math.max(...xs) + 60, y0 = Math.min(...ys) - 80, y1 = Math.max(...ys) + 60;
    const vw = Math.max(200, (this.w || 900) - (this.w < 900 ? 0 : this.inset.l + this.inset.r)), vh = Math.max(200, (this.h || 700) * (this.w < 900 ? 0.5 : 0.9));
    this.goal.x = (x0 + x1) / 2; this.goal.y = (y0 + y1) / 2;
    this.goal.z = Math.min(2.4, Math.max(0.08, Math.min(vw / (x1 - x0), vh / (y1 - y0))));
  }

  focus(id: string) {
    const d = this.dens.find((x) => x.id === id);
    if (!d) return;
    this.goal.x = d.x; this.goal.y = d.y; this.goal.z = Math.max(this.goal.z, 1.6);
  }

  /** New side panels (the prey card opening or closing) without moving the map: the camera shifts by
   * exactly what the view's centre moved, so the den under the pointer stays under it. */
  setInset(next: { l: number; r: number }) {
    if (next.l === this.inset.l && next.r === this.inset.r) return;
    if (this.w >= 900) {
      const shift = ((next.l - next.r) - (this.inset.l - this.inset.r)) / 2;   // the centre's move, in px
      this.cam.x += shift / this.cam.z; this.goal.x += shift / this.goal.z;
    }
    this.inset = next;
  }

  private toScreen(x: number, y: number) {
    const narrow = this.w < 900;
    const cx = narrow ? this.w / 2 : (this.inset.l + this.w - this.inset.r) / 2;
    return { x: cx + (x - this.cam.x) * this.cam.z, y: this.h / 2 + (y - this.cam.y) * this.cam.z };
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, hits: Hit[]) {
    this.w = w; this.h = h;
    const k = 1 - Math.exp(-dt * 4);
    this.cam.x += (this.goal.x - this.cam.x) * k; this.cam.y += (this.goal.y - this.cam.y) * k; this.cam.z += (this.goal.z - this.cam.z) * k;
    // deep space
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.8);
    g.addColorStop(0, '#2A1660'); g.addColorStop(1, '#0B0620');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const pat = halftone(ctx, '#22E4FF', 14, 1.5, 0.16);
    if (pat) { ctx.save(); ctx.translate(-this.cam.x * this.cam.z * 0.2 % 28, -this.cam.y * this.cam.z * 0.2 % 28); ctx.fillStyle = pat; ctx.fillRect(-30, -30, w + 60, h + 60); ctx.restore(); }
    for (let i = 0; i < 70; i++) {
      const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * w, y = ((Math.sin(i * 78.233) * 12543.21) % 1 + 1) % 1 * h;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i));
      ctx.fillStyle = i % 7 ? PAPER : '#FFE53B';
      ctx.fillRect(x, y, i % 9 ? 2 : 3, i % 9 ? 2 : 3);
    }
    ctx.globalAlpha = 1;
    const z = this.cam.z;
    // a nebula behind each clan's galaxy, in its colour
    for (const c of this.clans) {
      const p = this.toScreen(c.x, c.y), rr = (90 + Math.sqrt(c.n) * 14) * z;
      if (p.x < -rr || p.y < -rr || p.x > w + rr || p.y > h + rr) continue;
      const ng = ctx.createRadialGradient(p.x, p.y, rr * 0.1, p.x, p.y, rr * 1.35);
      ng.addColorStop(0, c.color + '55'); ng.addColorStop(0.6, c.color + '18'); ng.addColorStop(1, c.color + '00');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(p.x, p.y, rr * 1.35, 0, Math.PI * 2); ctx.fill();
    }
    // clan suns
    for (const c of this.clans) {
      const p = this.toScreen(c.x, c.y);
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, (60 + Math.sqrt(c.n) * 11) * z, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.shadowColor = c.color; ctx.shadowBlur = 30;
      burst(ctx, p.x, p.y, Math.max(16, 34 * z), c.color, 10, 3.5, c.n, t * 0.3);
      ctx.restore();
      drawGlyph(ctx, 'sun', p.x, p.y, Math.max(12, 22 * z), INK, 3);
    }
    // the path from my den to the chosen one
    const me = this.dens.find((d) => d.mine), sel = this.dens.find((d) => d.id === this.selected);
    if (me && sel && me !== sel) {
      const a = this.toScreen(me.x, me.y), b = this.toScreen(sel.x, sel.y);
      ctx.save();
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = '#FF2E88'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 50; ctx.stroke();
      ctx.restore();
      // a paw print walking the path
      const f = (t * 0.4) % 1;
      drawGlyph(ctx, 'prowl', a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 22, '#FFE53B', 3);
    }
    // dens: thousands of them, so plain dots unless chosen, hovered or yours
    const rich: HuntDen[] = [];
    const special: HuntDen[] = [];
    ctx.lineWidth = Math.max(1.2, 2 * Math.min(1, z));
    ctx.strokeStyle = INK;
    for (const d of this.dens) {
      const p = this.toScreen(d.x, d.y);
      if (p.x < -30 || p.y < -30 || p.x > w + 30 || p.y > h + 30) continue;
      const on = this.filter(d);
      const r = Math.max(2.2, Math.min(d.r * z * 1.2, 11 * z * 0.42));
      if (on) hits.push({ id: d.id, x: p.x, y: p.y, r: Math.max(8, r + 4) });
      if (d.mine || d.id === this.selected || d.id === this.hovered) { special.push(d); continue; }
      const clan = this.clans.find((c) => c.id === d.clan);
      ctx.globalAlpha = on ? 1 : 0.15;
      ctx.fillStyle = d.ore > 0 && on ? '#FF2E88' : clan?.color || '#B89BFF';
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      if (r > 3.5) ctx.stroke();
      // close up, each den is a little world: a lit edge and a paw in the middle
      if (r > 7 && on) {
        ctx.save(); ctx.globalAlpha *= 0.7; ctx.strokeStyle = PAPER; ctx.lineWidth = Math.max(1.5, r * 0.12);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.72, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke(); ctx.restore();
        if (r > 11) drawGlyph(ctx, 'prowl', p.x, p.y + r * 0.1, r * 0.9, INK, 2.4);
      }
      if (on && d.ore > 0 && r > 5) rich.push(d);
    }
    ctx.globalAlpha = 1;
    // the richest prey twinkle, when there is room to see them
    rich.sort((a, b) => b.ore - a.ore);
    for (const d of rich.slice(0, z > 2 ? 80 : 30)) {
      const p = this.toScreen(d.x, d.y), r = Math.max(2.2, Math.min(d.r * z * 1.2, 11 * z * 0.42));
      ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + d.r * 9);
      ctx.strokeStyle = '#FFE53B'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      if (z > 1.3) { ctx.font = `${z > 2.6 ? 13 : 11}px ${FONT_BOOM}`; ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.textAlign = 'center'; ctx.strokeText(d.name, p.x, p.y + r + 13); ctx.fillStyle = '#FF9EC4'; ctx.fillText(d.name, p.x, p.y + r + 13); }
    }
    for (const d of special) {
      const p = this.toScreen(d.x, d.y);
      const r = Math.max(9, Math.min(d.r * z * 1.3, 11 * z * 0.5) + 4);
      const clan = this.clans.find((c) => c.id === d.clan);
      const sel2 = this.selected === d.id;
      ctx.save();
      if (d.ore > 0) { ctx.shadowColor = '#FF2E88'; ctx.shadowBlur = 18; }
      paint(ctx, shape(ell(p.x, p.y, r, r, 10), true, 0.4, 5), d.mine ? '#FFE53B' : d.ore > 0 ? '#FF2E88' : clan?.color || '#B89BFF', { lw: 3.5, shadow: r * 0.3 });
      ctx.restore();
      if (d.mine) paint(ctx, shape(spikes(p.x, p.y - r - 9, 4, 10, 3, -Math.PI / 2), true, 0, 9), '#FFE53B', { lw: 2.5 });
      if (d.nap > 600) letter(ctx, 'z', p.x + r, p.y - r - 4 - Math.sin(t * 2) * 3, 16, '#B89BFF', { shadow: 'none', outline: 2.5 });
      ctx.save();
      ctx.strokeStyle = sel2 ? '#FFE53B' : PAPER; ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 9, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.font = `${sel2 ? 20 : 17}px ${FONT_BOOM}`;
      const label = d.mine ? 'YOU' : d.name;
      const tw = ctx.measureText(label).width + 12;
      ctx.fillStyle = INK; ctx.fillRect(p.x - tw / 2, p.y + r + 12, tw, sel2 ? 23 : 20);
      ctx.fillStyle = d.mine ? '#FFE53B' : d.ore > 0 ? '#FF9EC4' : PAPER;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(label, p.x, p.y + r + 14);
      ctx.restore();
    }
    // clan names last, on ink, so their own crowd of dens never buries them
    for (const c of this.clans) {
      const p = this.toScreen(c.x, c.y), y = p.y + Math.max(26, 50 * z), size = Math.max(15, Math.min(30, 26 * z));
      if (p.x < -200 || p.y < -100 || p.x > w + 200 || y > h + 60) continue;
      ctx.save();
      ctx.font = `${size}px ${FONT_BOOM}`;
      const tw = ctx.measureText(c.name).width + size * 0.9;
      ctx.translate(p.x, y); ctx.rotate(-0.03);
      ctx.fillStyle = INK; ctx.fillRect(-tw / 2, -size * 0.72, tw, size * 1.44);
      ctx.strokeStyle = c.color; ctx.lineWidth = 2.5; ctx.strokeRect(-tw / 2 + 3, -size * 0.72 + 3, tw - 6, size * 1.44 - 6);
      ctx.restore();
      letter(ctx, c.name, p.x, y, size, c.color, { shadow: 'none', outline: 3 });
    }
    this.fx.draw(ctx, dt);
  }

  pick(hit: Hit | null) { this.onPick(hit ? hit.id : null); }
  hover(hit: Hit | null) { this.hovered = hit?.id ?? null; }
  drag(dx: number, dy: number) { this.goal.x -= dx / this.cam.z; this.goal.y -= dy / this.cam.z; this.cam.x = this.goal.x; this.cam.y = this.goal.y; }
  wheel(dy: number) { this.goal.z = Math.max(0.1, Math.min(6, this.goal.z * Math.exp(-dy * 0.0015))); }
  zoomBy(f: number) { this.goal.z = Math.max(0.1, Math.min(6, this.goal.z * f)); }
}
