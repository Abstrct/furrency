/* The den, drawn: a floating island under four zones — STAR at the top, SKY in the clouds, ROOT on
 * the island, TIDE in the water below. Every kin stands in its zone; free slots wait as dashed rings.
 * A ward dome rises over the island with the den's shield; prowlers hang red-eyed in the sky. */
import { INK, PAPER, ell, halftone, letter, mix, paint, shape, spikes, stroke, wob, zig, FONT_BOOM, FONT_UI, type P } from '../art/ink';
import { drawKin } from '../art/totem';
import { Fx } from '../art/fx';
import type { Hit, Scene } from '../art/stage';
import { drawGlyph } from '../ui/glyphs';
import { REALM_COLOR, REALMS, beastName, type Realm } from '../lore';
import { KING, RING, ZONE_ORDER, ZONE_Y, denFrame, placeZone, zoneOf, type Spot } from './den-layout';

export interface DenUnit {
  id: string; type: number; zone: Realm; slot: number; totem: boolean;
  building: number | null; asleep: boolean; hidden: boolean; hp: number; maxHp: number;
  king: boolean; guarding: boolean; work?: number | null; workKind?: 'dig' | 'forge' | null; eta?: string | null;
}
export interface FreeSlot { zone: Realm; slot: number; totem: boolean }
export interface DenView {
  units: DenUnit[];
  free: FreeSlot[];
  name: string;
  ward: number;
  raiders: number;
  away: boolean;
  ghost: boolean;
  enemy: boolean;
  ground: number;
  howl: boolean;
}


export class DenScene implements Scene {
  view: DenView = { units: [], free: [], name: '', ward: 0, raiders: 0, away: false, ghost: false, enemy: false, ground: 0, howl: false };
  fx = new Fx();
  selected: string | null = null;
  hovered: string | null = null;
  /** Where the left and right panels cover the canvas (px), so the den centres between them. */
  inset = { l: 300, r: 370, b: 110 };
  onPick: (id: string | null) => void = () => {};
  onSlot: (s: FreeSlot) => void = () => {};
  private pos = new Map<string, { x: number; y: number; s: number }>();
  private flash = new Map<string, number>();
  private lunge = new Map<string, number>();
  private born = performance.now() / 1000;
  private w = 0; private h = 0;

  set(v: DenView) { this.view = v; }

  /** A unit's head, in canvas px (for effects and bubbles). */
  headOf(id: string): { x: number; y: number; s: number } | null {
    const p = this.pos.get(id);
    return p ? { x: p.x, y: p.y - p.s * 0.7, s: p.s } : null;
  }
  hit(id: string, power = 1) { this.flash.set(id, 1); const h = this.headOf(id); if (h) { this.fx.slash(h.x, h.y, '#FF2E88', h.s); this.fx.word(power > 1 ? 'WHAM!' : 'POW!', h.x + h.s * 0.4, h.y - h.s * 1.1, '#FFE53B', 48, '#FF2E88'); this.fx.sparks(h.x, h.y, 12, '#FFE53B'); } }
  nudge(id: string) { this.lunge.set(id, 1); }
  word(id: string | null, text: string, color = '#FFE53B', back = '#22E4FF') {
    const h = id ? this.headOf(id) : null;
    // the word rises above the kin it names, never over its face
    const x = h ? h.x + h.s * 0.35 : this.mid(), y = h ? h.y - h.s * 1.15 : this.h * 0.4;
    this.fx.word(text, x, y, color, 48, back);
  }
  /** Fly coins or shards from a unit to a point (a meter). */
  fly(id: string | null, kind: 'coin' | 'shard', tx: number, ty: number, n = 6) {
    const h = id ? this.headOf(id) : null;
    this.fx.fly(kind, h ? h.x : this.mid(), h ? h.y : this.h * 0.6, tx, ty, n);
  }
  private mid() { return (this.inset.l + (this.w - this.inset.r)) / 2; }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, hits: Hit[]) {
    this.w = w; this.h = h;
    const v = this.view;
    const frame = denFrame(w, h, this.inset);
    const { l, r, cx, span, H, top0, size } = frame;
    const age = t - this.born;

    sky(ctx, w, h, t, v.enemy);
    // the zone labels are drawn last (on top of the kin), as ink pills at the left of the den
    const zoneLabels = () => {
      for (const z of ZONE_ORDER) {
        const y = top0 + ZONE_Y[z] * (H - top0);
        ctx.save();
        ctx.fillStyle = 'rgba(10,6,18,0.82)';
        ctx.beginPath(); ctx.roundRect(l + 6, y - 44, 44, 54, 8); ctx.fill();
        drawGlyph(ctx, z === 'star' ? 'star' : z === 'sky' ? 'sky' : z === 'root' ? 'root' : 'tide', l + 28, y - 24, 24, REALM_COLOR[z], 3);
        ctx.font = `14px ${FONT_BOOM}`; ctx.fillStyle = REALM_COLOR[z]; ctx.textAlign = 'center';
        ctx.fillText(z.toUpperCase(), l + 28, y + 4);
        ctx.restore();
      }
    };
    clouds(ctx, l, r, h * 0.37, t);
    fireflies(ctx, l, r, h, t);

    // where everything stands: each zone in its own footprints (see den-layout), lines stack when crowded
    const byZone = new Map<Realm, (DenUnit | FreeSlot & { free: true })[]>();
    for (const z of REALMS) byZone.set(z, []);
    for (const u of v.units) byZone.get(u.zone)!.push(u);
    for (const f of v.free) byZone.get(f.zone)!.push({ ...f, free: true });
    const targets = new Map<string, { x: number; y: number; s: number; tag: boolean }>();
    const freeAt: { f: FreeSlot; x: number; y: number; s: number }[] = [];
    for (const z of REALMS) {
      const list = byZone.get(z)!;
      if (!list.length) continue;
      const spots: Spot[] = list.map((u) => 'free' in u
        ? { king: false, totem: u.totem, free: true }
        : { king: u.king, totem: u.totem, free: false, type: u.type });
      const at = placeZone(spots, zoneOf(frame, z));
      list.forEach((u, i) => {
        const p = at[i];
        // clouds drift a little, never into a neighbour
        const x = p.x + (z === 'sky' ? Math.sin(i * 2.3) * Math.min(8, (p.pad - 2) / 2) : 0);
        const y = p.y + (z === 'star' || z === 'sky' ? Math.sin(t * 1.2 + i * 1.7 + p.row) * 5 : 0);
        if ('free' in u) freeAt.push({ f: u, x, y, s: p.s * RING });
        else targets.set(u.id, { x, y, s: u.king ? p.s * KING : p.s, tag: p.room >= 120 && p.row === 0 });
      });
    }
    for (const [id, tg] of targets) {
      const p = this.pos.get(id);
      if (!p) this.pos.set(id, { x: tg.x, y: tg.y, s: tg.s });
      else { const k = 1 - Math.exp(-dt * 6); p.x += (tg.x - p.x) * k; p.y += (tg.y - p.y) * k; p.s += (tg.s - p.s) * k; }
    }
    for (const id of [...this.pos.keys()]) if (!targets.has(id)) this.pos.delete(id);

    const drawUnits = (z: Realm) => {
      const order = v.units.filter((u) => u.zone === z && this.pos.has(u.id)).sort((a, b) => this.pos.get(a.id)!.y - this.pos.get(b.id)!.y);
      for (const u of order) {
        const p = this.pos.get(u.id)!;
        const sel = this.selected === u.id, hov = this.hovered === u.id;
        if (sel || hov) ring(ctx, p.x, p.y, p.s, t, sel ? '#FFE53B' : '#FFF8E7', sel);
        const fl = this.flash.get(u.id) || 0;
        if (fl > 0) this.flash.set(u.id, Math.max(0, fl - dt * 3));
        const lg = this.lunge.get(u.id) || 0;
        if (lg > 0) this.lunge.set(u.id, Math.max(0, lg - dt * 2.5));
        const intro = Math.min(1, Math.max(0, (age - 0.15 - (p.x / w) * 0.4) / 0.45));
        if (intro <= 0) continue;
        ctx.save();
        if (intro < 1) { const k = 1 - Math.pow(1 - intro, 3); ctx.translate(p.x, p.y); ctx.scale(k, 0.6 + 0.4 * k); ctx.translate(-p.x, -p.y); }
        if (z === 'tide') { ctx.beginPath(); ctx.rect(p.x - p.s, p.y - p.s * 2, p.s * 2, p.s * 2 - p.s * 0.12); ctx.clip(); }
        drawKin(ctx, u.type, p.x, p.y, p.s, { t, seed: seedOf(u.id), asleep: u.asleep, hidden: u.hidden, building: u.building, flash: fl, enemy: v.enemy, crown: u.king, hp: u.maxHp ? u.hp / u.maxHp : 1, lunge: Math.sin(lg * Math.PI) });
        ctx.restore();
        if (u.work != null && !u.asleep && u.building == null) workRing(ctx, p.x, p.y - p.s * 1.38, p.s * 0.2, u.work, u.workKind === 'dig' ? '#FF7A1A' : '#FFE53B', t, `${u.workKind === 'dig' ? 'DIG' : 'FORGE'} ${u.eta || ''}`.trim());
        // a call in progress always shows how far along it is, even when the zone is too crowded for name tags
        else if (u.building != null) workRing(ctx, p.x, p.y - p.s * 1.38, p.s * 0.2, u.building, '#22E4FF', t, `CALL ${u.eta || `${Math.round(u.building * 100)}%`}`);
        if (u.guarding && !u.building) drawGlyph(ctx, 'guard', p.x - p.s * 0.48, p.y - p.s * 0.2, p.s * 0.26, '#FFF8E7', 3);
        hits.push({ id: u.id, x: p.x, y: p.y - p.s * 0.6, r: p.s * 0.62 });
        if (sel || hov || targets.get(u.id)?.tag) tagUnder(ctx, u, p.x, p.y, p.s, sel || hov);
      }
      for (const f of freeAt) {
        if (f.f.zone !== z || v.ghost || v.enemy) continue;
        const hov = this.hovered === `free:${f.f.zone}:${f.f.totem ? 'p' : 'f'}:${f.f.slot}`;
        freeRing(ctx, f.x, f.y, f.s, t, f.f.totem, hov);
        hits.push({ id: `free:${f.f.zone}:${f.f.totem ? 'p' : 'f'}:${f.f.slot}`, x: f.x, y: f.y - f.s * 0.45, r: f.s * 0.5 });
      }
    };

    drawUnits('star');
    drawUnits('sky');
    island(ctx, cx, span, H, t, v);
    if (v.ward > 0) dome(ctx, cx, span, H, t, v.ward);
    drawUnits('root');
    water(ctx, w, h, H, t, false);
    drawUnits('tide');
    water(ctx, w, h, H, t, true);

    if (v.howl) howlWaves(ctx, cx, H * 0.7, t);
    if (v.raiders > 0) raidersOverhead(ctx, r - 70, h * 0.12, v.raiders, t);
    if (v.away && !v.enemy) awaySign(ctx, cx, h * 0.33, t);

    if (v.ghost) {
      ctx.save(); ctx.globalAlpha = 0.85;
      drawKin(ctx, 1, cx, H * 0.655, size * 1.4, { t, seed: 7, building: 0.001 });
      ctx.restore();
    }
    zoneLabels();
    this.fx.draw(ctx, dt);
  }

  pick(hit: Hit | null) {
    if (hit?.id.startsWith('free:')) {
      const [, zone, kind, slot] = hit.id.split(':');
      this.onSlot({ zone: zone as Realm, slot: Number(slot), totem: kind === 'p' });
      return;
    }
    this.onPick(hit ? hit.id : null);
  }
  hover(hit: Hit | null) { this.hovered = hit?.id ?? null; }
}

export function seedOf(id: string) { let s = 7; for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return s % 997; }

/* ── painting helpers ─────────────────────────────────────────────── */

function sky(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, enemy: boolean) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  if (enemy) { g.addColorStop(0, '#2A0A26'); g.addColorStop(0.5, '#4A1240'); g.addColorStop(1, '#1A0A30'); }
  else { g.addColorStop(0, '#120A2E'); g.addColorStop(0.3, '#2A1660'); g.addColorStop(0.55, '#1E4F86'); g.addColorStop(1, '#0B2440'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const pat = halftone(ctx, enemy ? '#FF2E88' : '#B89BFF', 13, 1.7, 0.22);
  if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h * 0.7); }
  // twinkling stars
  for (let i = 0; i < 46; i++) {
    const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * w, y = (Math.sin(i * 47.3) * 0.5 + 0.5) * h * 0.42;
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + (i % 5) * 0.4) + i);
    const s = 2 + (i % 4) * 1.5 + tw * 2;
    ctx.save();
    ctx.globalAlpha = 0.35 + tw * 0.65;
    if (i % 6 === 0) paint(ctx, shape(spikes(x, y, s * 0.35, s * 1.6, 4, 0), true, 0, i), '#FFE53B', { lw: 2 });
    else { ctx.fillStyle = '#FFF8E7'; ctx.beginPath(); ctx.arc(x, y, s * 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // a big ringed moon, far off
  ctx.save();
  ctx.globalAlpha = 0.9;
  const mx = w * 0.86, my = h * 0.13, mr = Math.min(w, h) * 0.07;
  paint(ctx, shape(ell(mx, my, mr, mr, 16), true, 0.8, 3), enemy ? '#FF9EC4' : '#FFE9A8', { lw: 4, shadow: mr * 0.35 });
  ctx.restore();
}

function fireflies(ctx: CanvasRenderingContext2D, l: number, r: number, h: number, t: number) {
  // little glowing motes drifting over the den
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const k = (t * (0.02 + (i % 5) * 0.006) + i * 0.137) % 1;
    const x = l + ((Math.sin(i * 12.9) * 0.5 + 0.5) * (r - l)) + Math.sin(t * 0.9 + i) * 30;
    const y = h * (0.85 - k * 0.8);
    const a = Math.sin(k * Math.PI) * (0.5 + 0.5 * Math.sin(t * 4 + i * 2));
    ctx.globalAlpha = a;
    ctx.fillStyle = i % 3 ? '#FFE53B' : '#22E4FF';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x, y, 2.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function clouds(ctx: CanvasRenderingContext2D, l: number, r: number, y: number, t: number) {
  const span = r - l;
  for (let i = 0; i < 4; i++) {
    const x = l + ((i * 0.29 + t * 0.008 * (1 + i * 0.3)) % 1.2 - 0.1) * span;
    const cy = y + (i % 2 ? 26 : -18);
    const s = 34 + i * 6;
    const pts: P[] = [[x - s * 1.8, cy + s * 0.5], ...ell(x - s, cy, s * 0.7, s * 0.6, 5, 0, Math.PI, Math.PI * 1.9), ...ell(x + s * 0.2, cy - s * 0.3, s * 0.9, s * 0.8, 6, 0, Math.PI * 1.05, Math.PI * 1.95), ...ell(x + s * 1.3, cy + s * 0.05, s * 0.6, s * 0.5, 5, 0, Math.PI * 1.1, Math.PI * 2), [x + s * 1.9, cy + s * 0.5]];
    ctx.save(); ctx.globalAlpha = 0.85;
    paint(ctx, shape(pts, true, 1.2, 50 + i), '#E8F4FF', { lw: 4, shadow: 7, shadowColor: '#9FC4E8', dots: false });
    ctx.restore();
  }
}

function island(ctx: CanvasRenderingContext2D, cx: number, span: number, h: number, t: number, v: DenView) {
  const top = h * 0.66, half = Math.min(span * 0.48, 620);
  const rock: P[] = [
    [cx - half, top, true], [cx - half * 0.92, top + h * 0.06], [cx - half * 0.7, top + h * 0.13], [cx - half * 0.35, top + h * 0.2],
    [cx, top + h * 0.26, true], [cx + half * 0.35, top + h * 0.2], [cx + half * 0.7, top + h * 0.13], [cx + half * 0.92, top + h * 0.06], [cx + half, top, true],
  ];
  const base = v.enemy ? '#7A3A5A' : '#B0683A';
  paint(ctx, shape(rock, true, 1.4, 70), base, { lw: 6, shadow: 22, shadowColor: mix(base, '#1a0a2a', 0.45) });
  // strata lines
  for (let i = 1; i < 4; i++) {
    const y = top + h * 0.04 * i;
    stroke(ctx, shape([[cx - half * (0.9 - i * 0.12), y], [cx - half * 0.3, y + 6], [cx + half * 0.2, y - 3], [cx + half * (0.88 - i * 0.12), y + 4]], false, 1.2, 71 + i), 3, mix(base, INK, 0.5));
  }
  // the grass lid with a zig-zag fringe
  const grass: P[] = [[cx - half - 8, top - 4, true], ...zig(cx - half - 8, top + 10, cx + half + 8, top + 10, Math.round(half / 22), -12).map(([x, y, s]) => [x, y + 6, s] as P), [cx + half + 8, top - 4, true], [cx + half * 0.6, top - 16], [cx, top - 20], [cx - half * 0.6, top - 16]];
  paint(ctx, shape(grass, true, 1, 75), v.enemy ? '#FF7AC4' : '#7CFF6B', { lw: 5, shadow: 6 });
  // the den door, eyes glowing inside
  const dw = Math.min(70, half * 0.16), dy = top + h * 0.05;
  paint(ctx, shape([[cx - dw, dy + dw * 0.9, true], ...ell(cx, dy + dw * 0.9, dw, dw * 1.15, 9, 0, Math.PI, Math.PI * 2), [cx + dw, dy + dw * 0.9, true]], true, 0.8, 76), INK, { lw: 5 });
  const blink = (t * 0.6) % 4 < 0.12 ? 0.15 : 1;
  ctx.save(); ctx.shadowColor = '#FFE53B'; ctx.shadowBlur = 14; ctx.fillStyle = '#FFE53B';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * dw * 0.32, dy + dw * 0.35, dw * 0.13, dw * 0.09 * blink, s * 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // the den's name on a banner
  if (v.name) {
    const bw = Math.min(half * 1.1, 40 + v.name.length * 17);
    paint(ctx, shape([[cx - bw / 2 - 16, top + h * 0.17, true], [cx - bw / 2, top + h * 0.15, true], [cx + bw / 2, top + h * 0.15, true], [cx + bw / 2 + 16, top + h * 0.17, true], [cx + bw / 2, top + h * 0.19, true], [cx - bw / 2, top + h * 0.19, true]], true, 0.5, 77), PAPER, { lw: 4 });
    letter(ctx, v.name, cx, top + h * 0.17, 22, INK, { shadow: 'none', outline: 0.01 });
  }
  // shards still in the ground: little crystals sticking out of the rock
  if (v.ground > 0) for (let i = 0; i < 5; i++) {
    const x = cx + (i - 2) * half * 0.28 + wob(80, i, 0) * 10, y = top + h * (0.09 + (i % 2) * 0.05);
    paint(ctx, shape([[x, y - 14, true], [x + 7, y, true], [x, y + 8, true], [x - 7, y, true]], true, 0.4, 81 + i), '#FF2E88', { lw: 3, glow: '#FF2E88' });
  }
}

function dome(ctx: CanvasRenderingContext2D, cx: number, span: number, h: number, t: number, ward: number) {
  const top = h * 0.66, rx = Math.min(span * 0.5, 650), ry = h * 0.5;
  ctx.save();
  ctx.globalAlpha = Math.min(0.55, 0.18 + ward * 0.0025) * (0.85 + 0.15 * Math.sin(t * 2));
  ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, Math.PI, Math.PI * 2); ctx.closePath();
  ctx.clip();
  // hexes
  ctx.strokeStyle = '#B89BFF'; ctx.lineWidth = 2.5;
  const s = 26;
  for (let y = top - ry; y < top; y += s * 1.5) for (let x = cx - rx; x < cx + rx; x += s * 1.73) {
    const ox = (Math.round((y - top) / (s * 1.5)) % 2) * s * 0.866;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; ctx.lineTo(x + ox + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9); }
    ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#B89BFF'; ctx.lineWidth = 4; ctx.shadowColor = '#B89BFF'; ctx.shadowBlur = 16; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function water(ctx: CanvasRenderingContext2D, w: number, h: number, H: number, t: number, front: boolean) {
  const y0 = H * (front ? 0.875 : 0.79);
  ctx.save();
  if (!front) {
    const g = ctx.createLinearGradient(0, y0, 0, h);
    g.addColorStop(0, '#1C6FB8'); g.addColorStop(1, '#0A2A55');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, y0);
    for (let x = 0; x <= w + 40; x += 40) ctx.quadraticCurveTo(x + 20, y0 + Math.sin(t * 1.4 + x * 0.02) * 6 - 6, x + 40, y0);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    const pat = halftone(ctx, '#22E4FF', 10, 1.6, 0.25);
    if (pat) { ctx.fillStyle = pat; ctx.fill(); }
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  } else {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#145A9C';
    ctx.beginPath(); ctx.moveTo(0, y0);
    for (let x = 0; x <= w + 50; x += 50) ctx.quadraticCurveTo(x + 25, y0 + Math.sin(t * 2 + x * 0.03) * 7 + 8, x + 50, y0);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 4; ctx.strokeStyle = '#22E4FF'; ctx.shadowColor = '#22E4FF'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0, y0);
    for (let x = 0; x <= w + 50; x += 50) ctx.quadraticCurveTo(x + 25, y0 + Math.sin(t * 2 + x * 0.03) * 7 + 8, x + 50, y0);
    ctx.stroke();
  }
  ctx.restore();
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, color: string, sel: boolean) {
  ctx.save();
  ctx.strokeStyle = INK; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.ellipse(x, y - 2, s * 0.62, s * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.setLineDash([14, 9]); ctx.lineDashOffset = -t * 40;
  ctx.shadowColor = color; ctx.shadowBlur = sel ? 14 : 0;
  ctx.stroke();
  ctx.restore();
  if (sel) {
    const by = y - s * 1.55 + Math.sin(t * 5) * 6;
    paint(ctx, shape([[x - 12, by - 14, true], [x + 12, by - 14, true], [x, by + 2, true]], true, 0.4, 90), '#FFE53B', { lw: 4 });
  }
}

function freeRing(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, totem: boolean, hov: boolean) {
  ctx.save();
  ctx.globalAlpha = hov ? 1 : 0.55;
  ctx.strokeStyle = totem ? '#FFE53B' : '#22E4FF'; ctx.lineWidth = 3.5; ctx.setLineDash([8, 8]); ctx.lineDashOffset = t * 20;
  ctx.beginPath(); ctx.ellipse(x, y - s * 0.45, s * 0.42, s * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  drawGlyph(ctx, 'call', x, y - s * 0.45, s * (hov ? 0.42 : 0.34), totem ? '#FFE53B' : '#22E4FF', 2.6);
  if (hov) { ctx.font = `16px ${FONT_BOOM}`; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.fillText('CALL', x, y + 14); }
  ctx.restore();
}

function tagUnder(ctx: CanvasRenderingContext2D, u: DenUnit, x: number, y: number, s: number, strong: boolean) {
  const label = u.building != null ? `CALLING ${Math.round((u.building || 0) * 100)}%${u.eta ? ` · ${u.eta}` : ''}` : beastName(u.type);
  ctx.save();
  ctx.font = `${strong ? 18 : 15}px ${FONT_BOOM}`;
  const tw = ctx.measureText(label).width + 14;
  const ty = y + 6;
  ctx.globalAlpha = strong ? 1 : 0.85;
  ctx.fillStyle = INK; ctx.fillRect(x - tw / 2, ty, tw, strong ? 22 : 19);
  ctx.fillStyle = u.asleep ? '#9a90b0' : u.totem ? '#FFE53B' : '#22E4FF';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(label, x, ty + 2);
  // hearts
  if (u.maxHp && u.hp < u.maxHp && u.building == null) {
    ctx.font = `12px ${FONT_UI}`; ctx.fillStyle = '#FF2E88';
    ctx.fillText('♥'.repeat(Math.max(0, u.hp)) + '♡'.repeat(Math.max(0, u.maxHp - u.hp)), x, ty + (strong ? 24 : 21));
  }
  ctx.restore();
  void s;
}

function workRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, frac: number, color: string, t: number, label = '') {
  ctx.save();
  ctx.lineWidth = 7; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.04, frac)); ctx.stroke();
  ctx.restore();
  drawGlyph(ctx, 'howl', x, y, r * 1.1, color, 2.4 + Math.sin(t * 8) * 0.4);
  if (label) {
    ctx.save(); ctx.font = `13px ${FONT_BOOM}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const w = ctx.measureText(label).width + 10;
    ctx.fillStyle = INK; ctx.fillRect(x - w / 2, y - r - 22, w, 17);
    ctx.fillStyle = color; ctx.fillText(label, x, y - r - 6);
    ctx.restore();
  }
}

function raidersOverhead(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, t: number) {
  for (let i = 0; i < Math.min(3, n); i++) {
    const px = x - i * 70, py = y + Math.sin(t * 2 + i) * 8 + 60;
    drawKin(ctx, 1, px, py, 64, { t, seed: 300 + i, enemy: true });
  }
  letter(ctx, 'PROWLERS!', x - 40, y + 86, 26, '#FFF8E7', { shadow: '#FF2E88', rot: -0.05 });
}

function howlWaves(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  // sound rings rising from the den door while the howl engine works
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.6 + i / 4) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - k) * 0.8;
    ctx.strokeStyle = '#B89BFF'; ctx.lineWidth = 5 * (1 - k) + 1; ctx.shadowColor = '#B89BFF'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, 30 + k * 160, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6);
  letter(ctx, 'AWOOO', x, y - 70 - Math.sin(t * 2) * 6, 22, '#B89BFF', { shadow: 'none', outline: 3 });
  ctx.restore();
}

function awaySign(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2) * 4);
  ctx.rotate(-0.04);
  paint(ctx, shape([[-120, -26, true], [120, -26, true], [126, 26, true], [-126, 26, true]], true, 1, 95), '#FF2E88', { lw: 5, shadow: 6 });
  letter(ctx, 'PACK AWAY', 0, 0, 32, '#FFF8E7', { shadow: 'none' });
  ctx.restore();
}
