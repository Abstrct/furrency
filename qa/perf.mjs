#!/usr/bin/env node
/* Performance probe: how much work each place does while the player only looks at it.
 *
 *   node qa/perf.mjs [--app http://127.0.0.1:5196] [--join] [--gpu] [--headed] [--secs 6] [--cpu 4] [--dpr 2] [--routes '#/,#/den']
 *
 * For each place, after it settles, over --secs of idling it reports:
 *   fps          frames the page managed (rAF callbacks per second)
 *   ms/frame     main-thread time per frame (Chrome's TaskDuration), and how much was script / layout / style
 *   dom/s        DOM mutations per second (childList + attributes + text), and nodes added per second
 *   canvas+/s    canvases created per second (portraits redrawn from scratch)
 *   layouts/s    forced layouts and style recalcs per second
 * --join makes a fresh chief first (devnet only: the app must point at a local chain).
 * --cpu-canvas paints canvases in the page's own thread (a stand-in for Firefox's software canvas).
 * --gpu uses the machine's real GPU (default: software, which exaggerates painting cost); --headed shows the window.
 * --cpu slows the CPU (Chrome's throttling) to stand in for a weaker machine. */
import { launchChrome, sleep } from './lib/cdp.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const APP = opt('--app', 'http://127.0.0.1:5196');
const SECS = Number(opt('--secs', 6));
const CPU = Number(opt('--cpu', 1));
const DPR = Number(opt('--dpr', 1));
const ROUTES = String(opt('--routes', '#/,#/den,#/hunt,#/prowl,#/glow,#/kin,#/glyphs')).split(',');
const W = Number(opt('--w', 1440)), H = Number(opt('--h', 900));

// --cpu-canvas paints 2D canvases on the CPU inside the page (as Firefox does when its canvas acceleration is off)
const b = await launchChrome({ width: W, height: H, gpu: args.includes('--gpu') || args.includes('--cpu-canvas'), headed: args.includes('--headed'), extraArgs: args.includes('--cpu-canvas') ? ['--disable-accelerated-2d-canvas'] : [] });
const p = await b.newPage({ width: W, height: H, isolated: true });
await p.setViewport(W, H, { scale: DPR });
await p.send('Performance.enable', { timeDomain: 'threadTicks' });
// --inject 'js' runs before the page's own code: switch a feature off to see what it costs
if (opt('--inject', null)) await p.send('Page.addScriptToEvaluateOnNewDocument', { source: opt('--inject') });

if (args.includes('--join')) {
  await p.goto(APP + '/#/');
  await sleep(2500);
  // the first visible match: the top bar's own JOIN hides on the title screen
  const click = async (sel, text) => {
    const find = `[...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.textContent.includes(${JSON.stringify(text)}) && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden')`;
    await p.waitFor(`!!${find}`, { timeout: 20000, what: text });
    const box = await p.eval(`(() => { const r = ${find}.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    await p.click(box.x, box.y); await sleep(700);
  };
  await click('button', 'JOIN');
  await click('button', 'NEW PAW');
  await p.eval(`document.querySelector('.veil input[type=checkbox]')?.click()`); await sleep(300);
  await click('button', 'NEXT');
  await p.eval(`(() => { const i = document.querySelector('.veil input[type=text], .veil input:not([type])'); i.value = 'Perf' + Math.floor(Math.random() * 1e4); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(300);
  await p.key('Enter');
  await p.waitFor(`/chief|CHIEF|DEN FOUND/.test(document.body.innerText) && !!document.querySelector('.top .chief, .top [class*=chief]') || /DEN FOUND/.test(document.body.innerText)`, { timeout: 60000 }).catch(() => {});
  await sleep(3000);
  await p.key('Escape');
}

if (CPU > 1) await p.send('Emulation.setCPUThrottlingRate', { rate: CPU });

const metrics = async () => Object.fromEntries((await p.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const rows = [];
for (const r of ROUTES) {
  await p.eval(`location.hash = ${JSON.stringify(r)}`);
  await sleep(3500);   // the wipe, the first paint, the first chain answers
  await p.eval(`(() => {
    window.__perf = { frames: 0, mut: 0, added: 0, canv: 0, top: {} };
    const f = () => { window.__perf.frames++; window.__perf.raf = requestAnimationFrame(f); }; window.__perf.raf = requestAnimationFrame(f);
    window.__perf.mo = new MutationObserver((ms) => {
      for (const m of ms) {
        window.__perf.mut++;
        const at = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        const key = at ? (at.id ? '#' + at.id : (at.className && typeof at.className === 'string' ? '.' + at.className.trim().split(/\\s+/)[0] : at.tagName.toLowerCase())) : '?';
        window.__perf.top[key] = (window.__perf.top[key] || 0) + 1;
        for (const n of m.addedNodes) { window.__perf.added++; if (n.nodeName === 'CANVAS') window.__perf.canv++; if (n.querySelectorAll) window.__perf.canv += n.querySelectorAll('canvas').length; }
      }
    });
    window.__perf.mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  })()`);
  const m0 = await metrics();
  await sleep(SECS * 1000);
  const m1 = await metrics();
  const s = await p.eval(`(() => { const x = window.__perf; cancelAnimationFrame(x.raf); x.mo.disconnect(); return { frames: x.frames, mut: x.mut, added: x.added, canv: x.canv, top: Object.entries(x.top).sort((a, b) => b[1] - a[1]).slice(0, 4) }; })()`);
  const d = (k) => (m1[k] || 0) - (m0[k] || 0);
  const fr = Math.max(1, s.frames);
  rows.push({
    place: r, fps: (s.frames / SECS).toFixed(0),
    'ms/frame': (d('TaskDuration') * 1000 / fr).toFixed(1),
    script: (d('ScriptDuration') * 1000 / fr).toFixed(1), layout: (d('LayoutDuration') * 1000 / fr).toFixed(2), style: (d('RecalcStyleDuration') * 1000 / fr).toFixed(2),
    'dom/s': (s.mut / SECS).toFixed(0), 'nodes+/s': (s.added / SECS).toFixed(0), 'canvas+/s': (s.canv / SECS).toFixed(1),
    'layouts/s': (d('LayoutCount') / SECS).toFixed(1), 'styles/s': (d('RecalcStyleCount') / SECS).toFixed(1),
    busiest: s.top.map(([k, n]) => `${k}:${Math.round(n / SECS)}`).join(' '),
  });
}
console.log(`perf · ${APP} · ${W}x${H}@${DPR}x · cpu ${CPU}x · ${SECS}s idle per place`);
console.table(rows);
await b.close();
process.exit(0);
