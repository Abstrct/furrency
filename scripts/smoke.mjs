#!/usr/bin/env node
/* End-to-end smoke test. Builds the site into its own directory, serves it as the static files a host
 * would, and opens every place in headless Chrome: at a desktop and a phone size against the live
 * testnet, then again with the testnet unreachable. A check fails on:
 *   - an uncaught exception, a console.error, or a resource error from the site itself;
 *   - a place that never mounts, or the boot screen that never lifts;
 *   - anything running past the right edge (a sideways scroll);
 *   - a blank stage (the comic canvas drew nothing);
 *   - online: no live chain shown (the LIVE sign, the beat, the dens);
 *   - offline: the game claiming LIVE anyway.
 *
 * usage: pnpm smoke
 *        CHROME=/path/to/chrome       to pick the browser
 *        SMOKE_SHOTS=dir              to keep a screenshot of every check
 *        SMOKE_QUICK=1                desktop online checks only
 *        SITE_URL=https://x.github.io/furrency   build and serve under that path (/furrency/): any
 *                                     file the page asks for outside it 404s and fails the check
 * Needs Node 22+ (global WebSocket) and Chrome or Chromium; without them it skips, which counts as a
 * failure when CI is set. Online checks need the public testnet to be up. */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { build } from 'vite';
import { findChrome, launchChrome, sleep } from '../qa/lib/cdp.mjs';

const skip = (why) => { console.log(`smoke: ${why}; skipped`); process.exit(process.env.CI ? 1 : 0); };
try { findChrome(); } catch { skip('no Chrome or Chromium found (set CHROME=/path/to/the/binary)'); }
if (typeof WebSocket === 'undefined') skip('needs Node 22+ (global WebSocket)');

const HOST = 'public.testnet.structs.network';
const SITE = String(process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/+$/, '');
const BASE = (SITE ? new URL(SITE + '/').pathname : '/');
/** Each place, and what it shows once the chain answers (null: nothing chain-specific to look for).
 * The phone title keeps only the buttons, so its beat card is a desktop check. */
const ROUTES = [
  { hash: '#/', online: /BEAT\s*#[\d,]+/, desktopOnly: true },
  { hash: '#/hunt', online: /[\d,]+ DENS/ },
  { hash: '#/den', online: null },
  { hash: '#/prowl', online: null },
  { hash: '#/glow', online: null },
  { hash: '#/kin', online: /SUN LION/ },
  { hash: '#/glyphs', online: null },
];
const DESKTOP = { name: 'desktop', w: 1440, h: 900, mobile: false };
const PHONE = { name: 'phone', w: 390, h: 844, mobile: true };
const CHECKS = process.env.SMOKE_QUICK ? ROUTES.map((route) => ({ route, view: DESKTOP, mode: 'online' })) : [
  ...ROUTES.map((route) => ({ route, view: DESKTOP, mode: 'online' })),
  ...ROUTES.map((route) => ({ route, view: PHONE, mode: 'online' })),
  ...ROUTES.map((route) => ({ route, view: DESKTOP, mode: 'offline' })),
];
const SETTLE = { online: 9000, offline: 9000 };
const shots = process.env.SMOKE_SHOTS;
if (shots) mkdirSync(shots, { recursive: true });

// A private build directory, so a concurrent `pnpm build` can't swap files underneath.
const outDir = mkdtempSync(join(tmpdir(), 'furrency-smoke-dist-'));
process.on('exit', () => rmSync(outDir, { recursive: true, force: true }));
await build({ build: { outDir, emptyOutDir: true }, logLevel: 'warn' });

// The files, served the way a static host (GitHub Pages) serves them: under BASE, nothing else.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };
const outside = [];
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) { outside.push(path); res.writeHead(404).end(); return; }
  let file = normalize(join(outDir, path.slice(BASE.length)));
  if (!file.startsWith(outDir)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404, { 'content-type': 'text/html' }).end(readFileSync(join(outDir, '404.html'))); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const app = origin + BASE;

// The build reads each clan's guild.json itself. Every check is a fresh browser, so a run would ask the
// clans' own hosts dozens of times (a pastebin among them rate-limits); those files are blocked instead,
// and the game treats them as unreachable, which it handles.
const GUILD_FILES = await fetch(`https://${HOST}/structs/guild?pagination.limit=500`, { signal: AbortSignal.timeout(15000) })
  .then((r) => r.json()).then((j) => (j.Guild || []).map((g) => g.endpoint).filter((u) => /^https?:\/\//.test(u || ''))).catch(() => []);

const browsers = {
  online: await launchChrome({ width: 1440, height: 900 }),
  // Offline means unresolvable: the LCD and the websocket both fail, as in a real outage.
  offline: await launchChrome({ width: 1440, height: 900, extraArgs: [`--host-resolver-rules=MAP ${HOST} ~NOTFOUND`] }),
};
const closeAll = () => Promise.all(Object.values(browsers).map((b) => b.close().catch(() => {})));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { closeAll().finally(() => process.exit(130)); });

/** Errors that belong to someone else: the testnet being down (under test), a clan refusing this
 * origin its files (no CORS), a font CDN, a blocked guild.json. */
const theirs = (text) => text.includes(HOST) || /blocked by CORS policy|ERR_BLOCKED_BY_CLIENT|fonts\.g(oogleapis|static)\.com/.test(text) || GUILD_FILES.some((u) => text.includes(u));

async function run({ route, view, mode }) {
  const problems = [];
  const page = await browsers[mode].newPage({ width: view.w, height: view.h, isolated: true });
  try {
    await page.setViewport(view.w, view.h, { mobile: view.mobile, scale: view.mobile ? 2 : 1 });
    await page.emulateMedia({ 'prefers-reduced-motion': 'reduce' });
    if (GUILD_FILES.length) await page.send('Network.setBlockedURLs', { urls: GUILD_FILES });
    const seen = outside.length;
    await page.goto(app + route.hash, { timeout: 30000 });
    await sleep(SETTLE[mode]);
    const v = await page.eval(`(async () => {
      const slot = document.querySelector('.screen-slot');
      const boot = document.getElementById('boot');
      const canvas = [...document.querySelectorAll('canvas')].filter((c) => c.width > 40 && c.height > 40).sort((a, b) => b.width * b.height - a.width * a.height)[0];
      const png = canvas ? await new Promise((r) => requestAnimationFrame(() => r(canvas.toDataURL('image/png').length))) : -1;
      const W = innerWidth + 1, wide = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('#about, #boot, #signs')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.right <= W) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
        let clipped = false;
        for (let a = el.parentElement; a && !clipped; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== 'visible' && !a.matches('html, body') && a.getBoundingClientRect().right <= W) clipped = true;
        }
        if (!clipped) wide.push((typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).join('.') : el.tagName.toLowerCase()) + ' to ' + Math.round(r.right) + 'px');
        if (wide.length >= 3) break;
      }
      return {
        mounted: !!(slot && slot.children.length),
        booting: !!(boot && boot.isConnected && getComputedStyle(boot).display !== 'none' && getComputedStyle(boot).opacity !== '0'),
        sideways: document.scrollingElement.scrollWidth > W,
        wide, png, live: document.querySelector('.live span')?.textContent || '',
        text: document.body.innerText,
      };
    })()`);
    for (const e of page.exceptions) problems.push('uncaught: ' + e.text.split('\n')[0]);
    for (const c of page.console) if (c.level === 'error' && !theirs(c.text)) problems.push('error: ' + c.text.slice(0, 180));
    if (outside.length > seen) problems.push('asked outside the base path: ' + [...new Set(outside.slice(seen))].join(', '));
    if (!v.mounted) problems.push('no place mounted');
    if (v.booting) problems.push('boot screen never lifted');
    if (v.sideways || v.wide.length) problems.push('runs past the right edge: ' + (v.wide.join(', ') || 'page scrolls sideways'));
    if (v.png >= 0 && v.png < 8000) problems.push(`stage looks blank (${v.png} B png)`);
    if (mode === 'online') {
      if (v.live !== 'LIVE') problems.push(`chain not live (sign says "${v.live}"; is the testnet up?)`);
      if (route.online && !(route.desktopOnly && view.mobile) && !route.online.test(v.text)) problems.push(`no chain data shown (expected ${route.online})`);
    } else if (v.live === 'LIVE') problems.push('claims LIVE with the testnet unreachable');
    if (shots) await page.screenshot(join(shots, `${mode}-${view.name}-${route.hash.replace(/\W+/g, '_') || 'gate'}.png`)).catch(() => {});
  } catch (e) {
    problems.push(String(e.message || e).split('\n')[0]);
  } finally {
    await page.close().catch(() => {});
  }
  return problems;
}

console.log(`smoke: ${CHECKS.length} checks at ${app}${GUILD_FILES.length ? ` (${GUILD_FILES.length} clan files blocked)` : ''}`);
let failed = 0;
const queue = [...CHECKS];
const results = new Map();
// Three at a time per browser keeps a CI runner (software GL) from starving the frames it measures.
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let c = queue.shift(); c; c = queue.shift()) results.set(c, await run(c));
}));
for (const c of CHECKS) {
  const p = results.get(c), label = `${c.mode.padEnd(7)} ${c.view.name.padEnd(7)} ${c.route.hash}`;
  if (p.length) { failed++; console.error(`FAIL ${label}\n     ${p.join('\n     ')}`); } else console.log(`ok   ${label}`);
}
await closeAll();
server.close();
if (failed) { console.error(`smoke: ${failed} of ${CHECKS.length} checks failed`); process.exit(1); }
console.log(`smoke: all ${CHECKS.length} checks passed`);
process.exit(0);
