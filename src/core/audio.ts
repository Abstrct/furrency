/* Furrency's noise: synthesised, no samples, and only after the chief touches the page.
 * Short comic sounds (coin clink, pop, punch, zap, a wolf howl when a proof lands) and a soft
 * night groove underneath: a plucked bass walking four chords with a ticking hat. */

let shared: AudioContext | null = null;
function ac(): AudioContext | null {
  try { shared ??= new AudioContext(); } catch { return null; }
  if (shared.state === 'suspended') void shared.resume();
  return shared;
}

class Sfx {
  muted = false;
  constructor() { try { this.muted = localStorage.getItem('furrency.sfx') === 'off'; } catch { /* default on */ } }
  private go(): AudioContext | null { return this.muted ? null : ac(); }
  private tone(freq: number, dur: number, type: OscillatorType, gain: number, glide?: number, at = 0) {
    const c = this.go(); if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  private noise(dur: number, gain: number, freq = 1200, at = 0) {
    const c = this.go(); if (!c) return;
    const t = c.currentTime + at;
    const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    g.gain.value = gain;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  coin() { this.tone(1318, 0.09, 'square', 0.05); this.tone(1976, 0.22, 'square', 0.05, undefined, 0.07); }
  pop() { this.tone(420, 0.12, 'sine', 0.22, 900); }
  click() { this.tone(760, 0.05, 'triangle', 0.1); }
  pow() { this.noise(0.22, 0.5, 900); this.tone(140, 0.25, 'sawtooth', 0.18, 50); }
  zap() { this.tone(1600, 0.2, 'sawtooth', 0.07, 220); }
  thud() { this.tone(90, 0.3, 'sine', 0.35, 40); this.noise(0.1, 0.25, 300); }
  dig() { this.noise(0.12, 0.3, 500); this.noise(0.1, 0.25, 700, 0.12); }
  forge() { this.tone(980, 0.5, 'triangle', 0.06); this.tone(1470, 0.6, 'triangle', 0.04, undefined, 0.05); this.noise(0.4, 0.08, 3000); }
  /** A small wolf howl: a voice that rises, wavers and falls. */
  howl(gain = 0.08) {
    const c = this.go(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o2.type = 'triangle';
    f.type = 'bandpass'; f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(1300, t + 0.6); f.frequency.linearRampToValueAtTime(600, t + 1.6); f.Q.value = 4;
    for (const x of [o, o2]) { x.frequency.setValueAtTime(330, t); x.frequency.exponentialRampToValueAtTime(620, t + 0.5); x.frequency.setValueAtTime(620, t + 0.9); x.frequency.exponentialRampToValueAtTime(380, t + 1.6); }
    o2.detune.value = 8;
    lfo.frequency.value = 6; lg.gain.value = 12; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.25); g.gain.setValueAtTime(gain, t + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
    o.connect(f); o2.connect(f); f.connect(g).connect(c.destination);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + 1.8); }
  }
  /** Compatibility with the engine's big moments. */
  stinger(name: 'youExploded' | 'vulnerable' | 'secure' | 'alpha', _gain = 0.8) {
    if (name === 'alpha') this.coin();
    else if (name === 'secure') this.howl();
    else if (name === 'youExploded') this.thud();
    else this.zap();
  }
  bell(freq = 523.25, gain = 0.2, decay = 1.2) { this.tone(freq, decay, 'triangle', gain); }
}

/* The night groove. */
class Groove {
  on: boolean;
  private master: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private listeners = new Set<() => void>();
  constructor() { let v: string | null = null; try { v = localStorage.getItem('furrency.music'); } catch { /* none */ } this.on = v === 'on'; }
  onChange(f: () => void) { this.listeners.add(f); return () => this.listeners.delete(f); }
  toggle() {
    this.on = !this.on;
    try { localStorage.setItem('furrency.music', this.on ? 'on' : 'off'); } catch { /* memory only */ }
    if (this.on) this.start(); else this.stop();
    for (const f of this.listeners) f();
  }
  start() {
    if (!this.on || this.timer) return;
    const c = ac(); if (!c) return;
    this.master = c.createGain(); this.master.gain.value = 0.0001; this.master.connect(c.destination);
    this.master.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 2);
    // A minor walk: Am · F · C · G, eighth notes at 92 bpm
    const roots = [110, 87.31, 130.81, 98];
    const tick = () => {
      if (!this.master) return;
      const t = c.currentTime + 0.05, s = this.step++;
      const bar = Math.floor(s / 8) % 4, beat = s % 8;
      const root = roots[bar];
      const pattern = [1, 0, 1, 1, 0, 1, 0, 1.5];
      if (pattern[beat]) this.pluck(c, t, root * (beat === 7 ? 1.5 : beat === 3 ? 2 : 1), 0.16);
      if (beat % 2 === 1) this.hat(c, t);
      if (beat === 0 && bar % 2 === 0) this.pad(c, t, root * 4, 2.4);
    };
    this.timer = window.setInterval(tick, (60 / 92 / 2) * 1000);
  }
  stop() {
    clearInterval(this.timer); this.timer = 0;
    const c = shared, m = this.master;
    if (c && m) { m.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6); setTimeout(() => m.disconnect(), 800); }
    this.master = null;
  }
  private pluck(c: AudioContext, t: number, f: number, gain: number) {
    const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(1400, t); fl.frequency.exponentialRampToValueAtTime(180, t + 0.25);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(fl).connect(g).connect(this.master!); o.start(t); o.stop(t + 0.35);
  }
  private hat(c: AudioContext, t: number) {
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.04), c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = 0.05;
    s.connect(f).connect(g).connect(this.master!); s.start(t);
  }
  private pad(c: AudioContext, t: number, f: number, dur: number) {
    for (const m of [1, 1.2, 1.5]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master!); o.start(t); o.stop(t + dur + 0.1);
    }
  }
}

export const audio = new Sfx();
export const ambience = new Groove();
