/* Comic effects that live a moment: onomatopoeia ("DIG!", "POW!") on a starburst, sparks, flying
 * alpha coins and shards, rings and claw slashes. A scene owns one Fx and draws it last. */
import { INK, burst, ell, letter, paint, shape, spikes, stroke, wob, FONT_BOOM, FONT_TITLE } from './ink';

type Kind = 'word' | 'spark' | 'coin' | 'shard' | 'ring' | 'slash' | 'beam';
interface Bit {
  kind: Kind; x: number; y: number; vx: number; vy: number; life: number; age: number;
  size: number; color: string; text?: string; rot: number; spin: number; seed: number;
  tx?: number; ty?: number; x0?: number; y0?: number;
}

export class Fx {
  bits: Bit[] = [];
  private n = 0;

  /** A big comic word on a burst. */
  word(text: string, x: number, y: number, color = '#FFE53B', size = 64, back = '#FF2E88') {
    // a word landing where another still shows stacks above it instead of colliding
    for (let guard = 0; guard < 4; guard++) {
      const clash = this.bits.some((b) => b.kind === 'word' && b.age < b.life * 0.7 && Math.abs(b.x - x) < size * 2.2 && Math.abs(b.y - y) < size * 0.9);
      if (!clash) break;
      y -= size * 0.95;
    }
    this.bits.push({ kind: 'word', x, y, vx: 0, vy: -30, life: 1.3, age: 0, size, color: back, text, rot: (Math.random() - 0.5) * 0.4, spin: 0, seed: this.n++, tx: 0, ty: 0, x0: 0, y0: 0 });
    // the word's own colour rides in `text` styling: fill colour stored on spin's sibling
    (this.bits[this.bits.length - 1] as Bit & { fill?: string }).fill = color;
  }
  sparks(x: number, y: number, n = 10, color = '#FFE53B', speed = 260) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
      this.bits.push({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.5 + Math.random() * 0.5, age: 0, size: 6 + Math.random() * 8, color, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 10, seed: this.n++ });
    }
  }
  /** Alpha coins or shards flying from one point to another along an arc. */
  fly(kind: 'coin' | 'shard', x: number, y: number, tx: number, ty: number, n = 5, color?: string) {
    for (let i = 0; i < n; i++) {
      this.bits.push({ kind, x, y, x0: x + (Math.random() - 0.5) * 30, y0: y + (Math.random() - 0.5) * 20, tx, ty, vx: (Math.random() - 0.5) * 300, vy: -200 - Math.random() * 200, life: 1 + i * 0.08, age: -i * 0.07, size: kind === 'coin' ? 16 : 13, color: color || (kind === 'coin' ? '#FFE53B' : '#FF2E88'), rot: 0, spin: (Math.random() - 0.5) * 8, seed: this.n++ });
    }
  }
  ring(x: number, y: number, color = '#22E4FF', size = 120, life = 0.7) {
    this.bits.push({ kind: 'ring', x, y, vx: 0, vy: 0, life, age: 0, size, color, rot: 0, spin: 0, seed: this.n++ });
  }
  slash(x: number, y: number, color = '#FFF8E7', size = 90) {
    this.bits.push({ kind: 'slash', x, y, vx: 0, vy: 0, life: 0.45, age: 0, size, color, rot: -0.6 + Math.random() * 0.3, spin: 0, seed: this.n++ });
  }
  /** A streak from one point to another (a pounce in flight). */
  beam(x: number, y: number, tx: number, ty: number, color = '#FFE53B') {
    this.bits.push({ kind: 'beam', x, y, tx, ty, vx: 0, vy: 0, life: 0.35, age: 0, size: 10, color, rot: 0, spin: 0, seed: this.n++ });
  }

  get busy() { return this.bits.length > 0; }

  draw(ctx: CanvasRenderingContext2D, dt: number) {
    const keep: Bit[] = [];
    for (const b of this.bits) {
      b.age += dt;
      if (b.age < 0) { keep.push(b); continue; }
      const k = b.age / b.life;
      if (k >= 1) continue;
      keep.push(b);
      switch (b.kind) {
        case 'word': {
          const pop = k < 0.12 ? 0.4 + (k / 0.12) * 0.8 : k < 0.2 ? 1.2 - ((k - 0.12) / 0.08) * 0.2 : 1;
          const fade = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
          ctx.save();
          ctx.globalAlpha *= fade;
          ctx.translate(b.x, b.y + b.vy * b.age * 0.4);
          ctx.rotate(b.rot);
          ctx.scale(pop, pop);
          burst(ctx, 0, 0, b.size * (0.6 + b.text!.length * 0.13), b.color, 11, 4, b.seed);
          letter(ctx, b.text!, 0, 0, b.size, (b as Bit & { fill?: string }).fill || '#FFE53B', { font: FONT_BOOM });
          ctx.restore();
          break;
        }
        case 'spark': {
          b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 500 * dt; b.rot += b.spin * dt;
          ctx.save(); ctx.globalAlpha *= 1 - k;
          paint(ctx, shape(spikes(b.x, b.y, b.size * 0.3, b.size, 4, b.rot), true, 0, b.seed), b.color, { lw: 2.5 });
          ctx.restore();
          break;
        }
        case 'coin': case 'shard': {
          // rise, then home in on the target
          const e = k * k * (3 - 2 * k);
          const mx = (b.x0! + b.tx!) / 2 + b.vx * 0.4, my = Math.min(b.y0!, b.ty!) - 120 + b.vy * 0.2;
          const x = (1 - e) * (1 - e) * b.x0! + 2 * (1 - e) * e * mx + e * e * b.tx!;
          const y = (1 - e) * (1 - e) * b.y0! + 2 * (1 - e) * e * my + e * e * b.ty!;
          b.rot += b.spin * dt;
          ctx.save();
          ctx.translate(x, y); ctx.rotate(b.kind === 'shard' ? b.rot : Math.sin(b.rot) * 0.3);
          const s = b.size * (k > 0.85 ? 1 - (k - 0.85) / 0.15 * 0.6 : 1);
          if (b.kind === 'coin') {
            ctx.scale(Math.max(0.2, Math.abs(Math.cos(b.rot))), 1);
            paint(ctx, shape(ell(0, 0, s, s, 10), true, 0, b.seed), b.color, { lw: 3, shadow: 3 });
            ctx.font = `${s * 1.2}px ${FONT_TITLE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK;
            ctx.fillText('α', 0, 1);
          } else {
            paint(ctx, shape([[0, -s, true], [s * 0.6, -s * 0.2, true], [0, s, true], [-s * 0.6, -s * 0.2, true]], true, 0, b.seed), b.color, { lw: 3, shadow: 2 });
          }
          ctx.restore();
          break;
        }
        case 'ring': {
          ctx.save(); ctx.globalAlpha *= 1 - k;
          ctx.strokeStyle = b.color; ctx.lineWidth = 8 * (1 - k) + 2;
          ctx.shadowColor = b.color; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.size * (0.2 + k * 0.8), 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'slash': {
          const grow = Math.min(1, k / 0.35);
          ctx.save(); ctx.globalAlpha *= k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
          ctx.translate(b.x, b.y); ctx.rotate(b.rot);
          for (let i = -1; i <= 1; i++) {
            const p = shape([[-b.size * 0.5, i * 16], [-b.size * 0.5 + b.size * grow, i * 16 + 10 * Math.sin(i + b.seed)]], false, 1, b.seed + i);
            stroke(ctx, p, 13, INK);
            stroke(ctx, p, 6, b.color);
          }
          ctx.restore();
          break;
        }
        case 'beam': {
          ctx.save(); ctx.globalAlpha *= 1 - k;
          const x = b.x + (b.tx! - b.x) * Math.min(1, k * 2.2), y = b.y + (b.ty! - b.y) * Math.min(1, k * 2.2);
          ctx.lineCap = 'round';
          ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(x, y); ctx.stroke();
          ctx.strokeStyle = b.color; ctx.lineWidth = 8; ctx.shadowColor = b.color; ctx.shadowBlur = 18; ctx.stroke();
          ctx.restore();
          break;
        }
      }
    }
    this.bits = keep;
    void wob;
  }
}
