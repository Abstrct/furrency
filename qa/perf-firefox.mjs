#!/usr/bin/env node
/* The performance probe in real Firefox (WebDriver BiDi; qa/lib/bidi.mjs).
 *
 *   node qa/perf-firefox.mjs [--app http://127.0.0.1:5196] [--join] [--headed] [--dpr 2] [--secs 6]
 *                            [--canvas gpu|cpu] [--pin 2] [--routes '#/,#/den'] [--shots dir]
 *
 * Per place, over --secs of idling after it settles:
 *   fps            frames the page managed
 *   p50/p95 ms     the frame interval, typical and worst-but-one-in-twenty
 *   dom/s          DOM mutations per second; nodes+/s nodes added
 *   scale          the stage's canvas resolution (the governor's choice, or --pin)
 * --canvas cpu sets gfx.canvas.accelerated=false (Firefox's software canvas, the default on many
 * machines); gpu sets it true. --pin holds the stage resolution (turns the governor off) for a baseline.
 * --join makes a fresh chief first (devnet only). Firefox has no CPU throttling or paint timings over
 * BiDi, so this measures what a player feels: frame rate and frame pacing. */
import { launchFirefox, sleep } from './lib/bidi.mjs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const APP = opt('--app', 'http://127.0.0.1:5196');
const SECS = Number(opt('--secs', 6));
const DPR = Number(opt('--dpr', 2));
const W = Number(opt('--w', 1440)), H = Number(opt('--h', 900));
const ROUTES = String(opt('--routes', '#/,#/den,#/hunt,#/prowl,#/glow,#/kin,#/glyphs')).split(',');
const CANVAS = opt('--canvas', null);
const PIN = opt('--pin', null);
const SHOTS = opt('--shots', null);
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const prefs = CANVAS ? { 'gfx.canvas.accelerated': CANVAS === 'gpu' } : {};
const ff = await launchFirefox({ headless: !args.includes('--headed'), width: W, height: H, prefs });
await ff.viewport(W, H, DPR);
const ua = await ff.eval('navigator.userAgent');

await ff.goto(APP + '/#/');
if (PIN) { await ff.eval(`localStorage.setItem('furrency.stage.pin', ${JSON.stringify(PIN)})`); await ff.goto(APP + '/#/'); }
await sleep(2500);

const vis = (text, sel = 'button, a') => `[...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.textContent.includes(${JSON.stringify(text)}) && e.getBoundingClientRect().width > 0 && !e.disabled)`;
const click = async (text, sel) => {
  await ff.waitFor(`!!${vis(text, sel)}`, { timeout: 30000, what: text });
  const r = await ff.eval(`(() => { const e = ${vis(text, sel)}; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await ff.click(r.x, r.y); await sleep(700);
};
if (args.includes('--join')) {
  await click('JOIN'); await click('NEW PAW');
  await ff.eval(`(document.querySelector('.veil input[type=checkbox]').click(), 1)`); await sleep(300);
  await click('NEXT');
  await ff.eval(`(() => { const i = document.querySelector('.veil input[type=text], .veil input:not([type])'); i.value = 'Fox' + Math.floor(Math.random() * 1e4); i.dispatchEvent(new Event('input', { bubbles: true })); return 1; })()`);
  await sleep(300); await ff.key('Enter');
  await ff.waitFor(`/DEN FOUND/.test(document.body.innerText)`, { timeout: 90000, what: 'a den' });
  await sleep(1500); await ff.key('Escape'); await sleep(500);
}

const rows = [];
for (const r of ROUTES) {
  await ff.eval(`(location.hash = ${JSON.stringify(r)}, 1)`);
  await sleep(3500);
  await ff.eval(`(() => {
    const x = window.__perf = { gaps: [], last: 0, mut: 0, added: 0 };
    const f = (now) => { if (x.last) x.gaps.push(now - x.last); x.last = now; x.raf = requestAnimationFrame(f); }; x.raf = requestAnimationFrame(f);
    x.mo = new MutationObserver((ms) => { for (const m of ms) { x.mut++; x.added += m.addedNodes.length; } });
    x.mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    return 1;
  })()`);
  await sleep(SECS * 1000);
  const s = await ff.eval(`(() => {
    const x = window.__perf; cancelAnimationFrame(x.raf); x.mo.disconnect();
    const g = x.gaps.slice().sort((a, b) => a - b), q = (k) => g.length ? g[Math.min(g.length - 1, Math.floor(g.length * k))] : 0;
    const c = document.querySelector('.view canvas, canvas');
    return { frames: x.gaps.length, p50: q(0.5), p95: q(0.95), mut: x.mut, added: x.added,
      scale: c && c.getBoundingClientRect().width ? (c.width / c.getBoundingClientRect().width).toFixed(2) : '-' };
  })()`);
  rows.push({ place: r, fps: (s.frames / SECS).toFixed(0), 'p50 ms': s.p50.toFixed(1), 'p95 ms': s.p95.toFixed(1), 'dom/s': (s.mut / SECS).toFixed(0), 'nodes+/s': (s.added / SECS).toFixed(0), scale: s.scale });
  if (SHOTS) await ff.screenshot(join(SHOTS, `ff-${r.replace(/\W+/g, '_') || 'gate'}.png`));
}
const errs = ff.errors().map((e) => e.text.slice(0, 160));
console.log(`firefox · ${ua.match(/Firefox\/[\d.]+/)?.[0]} · ${args.includes('--headed') ? 'headed' : 'headless'} · canvas ${CANVAS || 'default'} · ${W}x${H}@${DPR}x · ${PIN ? 'pinned ' + PIN : 'governed'} · ${SECS}s idle per place`);
console.table(rows);
console.log('page errors:', errs.length ? errs : 'none');
await ff.close();
process.exit(0);
