#!/usr/bin/env node
/* The Furrency playtest lab. One headless Chrome, one isolated browser context per playtester (each
 * with its own paw, storage and chief), all playing the game against a private devnet, driven over a
 * small HTTP API that an AI (or a person with curl) can use:
 *
 *   node qa/lab.mjs [--app URL] [--port 9600] [--headed]
 *
 *   POST /testers            {"name":"mira","viewport":"desktop"|"phone"}   open a fresh player
 *   GET  /testers                                                          who is playing
 *   GET  /t/NAME/look[?shot=1][&json=1]  what the player sees: route, dialog, signs, meters, numbered
 *                                        controls (DOM) and canvas targets (c0, c1…), game state, new errors;
 *                                        shot=1 also saves a screenshot and gives its path
 *   POST /t/NAME/do          one action, then a fresh look (text):
 *        {"click": 12} | {"click": "JOIN"}      a control by number or by (part of) its words
 *        {"tap": "c3"} | {"tap": "DIG MOLE"}    a canvas target by number or name
 *        {"tapxy": [x, y]}                       a raw tap
 *        {"type": "Vextail", "into": 4}          type into a field (number or words; default: the focused one)
 *        {"key": "Escape"}                       Enter, Tab, Escape, arrows, digits…
 *        {"goto": "#/hunt"}                      change place
 *        {"wait": 5000}                          let the chain move (max 60000)
 *        {"viewport": "phone"|"desktop"}  {"reload": true}  {"scroll": 600}
 *   GET  /t/NAME/log                     every action this tester took, with errors seen
 *   GET  /status                         chain height and testers
 *
 * By default it starts the game itself (Vite on 5195, or --game-port N; pointed at the devnet: LCD 31317, RPC 36657,
 * the relay in local mode for the mock guild). The devnet must be running (structs-xyz
 * scripts/devnet/setup.sh). Screenshots and logs land in qa/playtests/. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome, sleep } from './lib/cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const PORT = Number(opt('--port', 9600));
const LCD = opt('--lcd', 'http://127.0.0.1:31317');
const RPC = opt('--rpc', 'ws://127.0.0.1:36657/websocket');
let APP = opt('--app', null);
const OUT = join(ROOT, 'qa', 'playtests');
mkdirSync(join(OUT, 'shots'), { recursive: true });
mkdirSync(join(OUT, 'logs'), { recursive: true });

/* ── the game ─────────────────────────────────────────────────────────── */
let vite = null;
if (!APP) {
  const GAME_PORT = opt('--game-port', '5195');
  APP = `http://127.0.0.1:${GAME_PORT}`;
  vite = spawn('pnpm', ['exec', 'vite', '--port', GAME_PORT, '--host', '127.0.0.1', '--strictPort'], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_LCD_URL: LCD, VITE_RPC_WS_URL: RPC, VITE_GRASS_URL: 'off', VITE_DEFAULT_GUILD: '0-1', STRUCTS_LCD: LCD, RELAY_ALLOW_LOCAL: '1' },
  });
  vite.stderr.on('data', (d) => process.stderr.write('[vite] ' + d));
  // a port someone else holds would make testers play whatever answers there: stop instead
  vite.on('exit', (code) => { console.error(`!! the game server stopped (exit ${code}); is port ${GAME_PORT} taken? try --game-port 5196`); process.exit(1); });
  for (let i = 0; i < 100; i++) { try { if ((await fetch(APP)).ok) break; } catch { /* starting */ } await sleep(200); }
}
// whatever answers must be Furrency
try {
  const page = await (await fetch(APP)).text();
  if (!/<title>Furrency\b/.test(page)) { console.error(`!! ${APP} is not Furrency; pass --game-port or --app`); process.exit(1); }
} catch (e) { console.error(`!! ${APP} does not answer: ${e.message}`); process.exit(1); }
const chainHeight = async () => { try { return Number((await (await fetch(`${LCD}/cosmos/base/tendermint/v1beta1/blocks/latest`)).json()).block.header.height); } catch { return 0; } };
if (!(await chainHeight())) console.warn('!! the devnet does not answer at ' + LCD + ' — start it first (structs-xyz scripts/devnet/setup.sh all)');

const browser = await launchChrome({ headed: args.includes('--headed'), width: 1280, height: 800 });
const testers = new Map();
const VIEW = { desktop: [1280, 800, false], phone: [390, 844, true] };

/* ── what the player sees ─────────────────────────────────────────────── */
const DIGEST = `(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const words = (e) => (e.getAttribute('aria-label') || e.innerText || e.value || e.placeholder || e.title || '').replace(/\\s+/g, ' ').trim().slice(0, 70);
  const veils = [...document.querySelectorAll('.veil')];
  const top = veils[veils.length - 1];
  const scope = top || document;
  const ctl = [...scope.querySelectorAll('button, a[href], input, textarea, select, [role=radio], summary')].filter(vis).slice(0, 90).map((e) => {
    const r = e.getBoundingClientRect();
    return { text: words(e) || '(' + e.tagName.toLowerCase() + ')', tag: e.tagName.toLowerCase(), type: e.type || '', disabled: !!e.disabled, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), on: e.classList.contains('on') || e.getAttribute('aria-pressed') === 'true' || e.getAttribute('aria-checked') === 'true' };
  });
  const fur = window.__fur;
  return {
    route: location.hash || '#/', title: document.title,
    dialog: top ? top.innerText.replace(/\\n{2,}/g, '\\n').slice(0, 900) : null,
    signs: [...document.querySelectorAll('#signs .sign')].map((s) => s.innerText.replace(/\\s+/g, ' ').trim()),
    meters: [...document.querySelectorAll('.meter')].map((m) => m.getAttribute('aria-label')),
    omens: [...document.querySelectorAll('.omen, .path, .warbar, .verdict, .odds')].filter(vis).map((o) => o.innerText.replace(/\\s+/g, ' ').trim()).slice(0, 8),
    panels: top ? [] : [...document.querySelectorAll('.panel, .card')].filter(vis).map((p) => p.innerText.replace(/\\s+/g, ' ').trim().slice(0, 260)).slice(0, 6),
    controls: ctl,
    canvas: top ? [] : (fur ? fur.targets() : []).slice(0, 60),
    state: fur ? fur.state() : null,
    viewport: [innerWidth, innerHeight],
  };
})()`;

function text(name, d, errs, shot) {
  const L = [];
  L.push(`== ${name} · ${d.route} · ${d.title} · ${d.viewport.join('x')}`);
  const s = d.state;
  if (s) {
    L.push(`chain #${s.height} (${s.link}) · paw ${s.paw} · chief ${s.chief || '—'}${s.chiefName ? ` "${s.chiefName}"` : ''} · clan ${s.clan} · grass ${s.grass}`);
    if (s.me) {
      L.push(`ME: alpha ${s.me.alpha} · shards ${s.me.shards} · glow spare ${s.me.glowSpare} · pulse ${s.me.pulse} · pack ${s.me.pack}${s.me.online ? '' : ' · LOW GLOW (offline)'}`);
      L.push('KIN: ' + (s.me.kin.map((k) => `${k.name}[${k.zone} ${k.state} fur ${k.fur}]`).join(', ') || 'none'));
    }
    if (s.deeds.length) L.push('DEEDS: ' + s.deeds.map((j) => `${j.label} → ${j.status}${j.error ? ` (${j.error.slice(0, 80)})` : ''}`).join(' | '));
    if (s.howl.length) L.push('HOWL: ' + s.howl.map((t) => `${t.what} ${t.have}/${t.need} ${t.status}${t.waits ? ' ' + t.waits : ''}`).join(' | '));
  }
  if (d.meters.length) L.push('METERS: ' + d.meters.join(' · '));
  if (d.omens.length) L.push('BANNERS: ' + d.omens.join(' || '));
  if (d.signs.length) L.push('SIGNS (toasts): ' + d.signs.join(' || '));
  if (d.dialog) L.push('DIALOG OPEN:\n  ' + d.dialog.split('\n').join('\n  '));
  if (d.panels.length) L.push('PANELS:\n  ' + d.panels.join('\n  '));
  L.push('CONTROLS (click by number):');
  d.controls.forEach((c, i) => L.push(`  [${i}] ${c.text}${c.disabled ? ' (disabled)' : ''}${c.on ? ' (on)' : ''}${c.tag === 'input' || c.tag === 'textarea' ? ` <${c.tag}${c.type ? ' ' + c.type : ''}>` : ''}`));
  if (d.canvas.length) { L.push('CANVAS TARGETS (tap by cN or name):'); d.canvas.forEach((c, i) => L.push(`  [c${i}] ${c.label}`)); }
  if (errs.length) L.push('NEW PAGE ERRORS:\n  ' + errs.map((e) => e.text.slice(0, 240)).join('\n  '));
  if (shot) L.push('SCREENSHOT: ' + shot);
  return L.join('\n');
}

async function look(t, { shot = false } = {}) {
  let d;
  try { d = await t.page.eval(DIGEST); } catch (e) { d = { route: '?', title: 'not ready: ' + e.message, viewport: [0, 0], meters: [], omens: [], signs: [], panels: [], controls: [], canvas: [], state: null, dialog: null }; }
  t.last = d;
  const all = t.page.errors([/favicon/, /ERR_CONNECTION_REFUSED/, /status of 404/]);
  const errs = all.slice(t.errSeen); t.errSeen = all.length;
  let path = null;
  if (shot) { path = join(OUT, 'shots', `${t.name}-${String(++t.shots).padStart(3, '0')}.png`); await t.page.screenshot(path); }
  return { d, errs, path, text: text(t.name, d, errs, path) };
}

const find = (list, q) => {
  if (typeof q === 'number') return list[q];
  const s = String(q).toUpperCase();
  return list.find((c) => (c.text || c.label || '').toUpperCase() === s) || list.find((c) => (c.text || c.label || '').toUpperCase().includes(s));
};

async function act(t, a) {
  const p = t.page;
  if (!t.last) await look(t);
  if (a.click != null) {
    let c = find(t.last.controls, a.click);
    if (!c) throw new Error(`no control ${JSON.stringify(a.click)} — look again`);
    // the screen may have moved since that look: find the same words again before clicking
    const fresh = await look(t);
    const again = fresh.d.controls.find((x) => x.text === c.text && (typeof a.click !== 'number' || Math.abs(fresh.d.controls.indexOf(x) - a.click) <= 3)) || fresh.d.controls.find((x) => x.text === c.text);
    if (!again) throw new Error(`control ${JSON.stringify(a.click)} ("${c.text}") is gone — look again`);
    c = again;
    // like a person: bring it fully into view first (a card half under a scrolling panel's edge would
    // otherwise be clicked through to the backdrop, which closes the dialog), then click its middle
    const box = await p.eval(`(() => {
      const words = (e) => (e.getAttribute('aria-label') || e.innerText || e.value || e.placeholder || e.title || '').replace(/\\s+/g, ' ').trim().slice(0, 70);
      const all = [...document.querySelectorAll('button, a[href], input, textarea, select, [role=radio], summary')];
      const near = (e) => { const r = e.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - ${c.x}, r.top + r.height / 2 - ${c.y}); };
      const e = all.filter((x) => (words(x) || '(' + x.tagName.toLowerCase() + ')') === ${JSON.stringify(c.text)}).sort((a, b) => near(a) - near(b))[0];
      if (!e) return null;
      e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`).catch(() => null);
    if (box) await sleep(120);
    await p.click(box?.x ?? c.x, box?.y ?? c.y);
  } else if (a.tap != null) {
    const q = typeof a.tap === 'string' && /^c\d+$/.test(a.tap) ? Number(a.tap.slice(1)) : a.tap;
    const c = find(t.last.canvas, q);
    if (!c) throw new Error(`no canvas target ${JSON.stringify(a.tap)} — look again`);
    await p.click(c.x, c.y - Math.min(10, c.r / 3));
  } else if (a.tapxy) {
    await p.click(a.tapxy[0], a.tapxy[1]);
  } else if (a.type != null) {
    if (a.into != null) { const c = find(t.last.controls, a.into); if (!c) throw new Error('no field ' + a.into); await p.click(c.x, c.y); }
    await p.eval(`(() => { const e = document.activeElement; if (e && 'value' in e) { e.select?.(); } return true; })()`);
    if (String(a.type) === '') await p.eval(`(() => { const e = document.activeElement; if (e && 'value' in e) { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); } return true; })()`);
    else await p.type(String(a.type));
  } else if (a.key) {
    const k = String(a.key);
    if (/^shift\+tab$/i.test(k)) await p.key('Tab', { modifiers: 8 });
    else await p.key(/^space$/i.test(k) ? ' ' : k);
  } else if (a.goto) {
    await p.eval(`(() => { location.hash = ${JSON.stringify(a.goto)}; return true; })()`);
  } else if (a.viewport) {
    const [w, h, m] = VIEW[a.viewport] || VIEW.desktop; await p.setViewport(w, h, { mobile: m });
  } else if (a.reload) {
    await p.reload(); await sleep(2500);
  } else if (a.scroll) {
    await p.eval(`(() => { const s = [...document.querySelectorAll('.veil .panel, .veil, .scrolls, .side .list, .list, ul')].find((e) => e.scrollHeight > e.clientHeight + 4); (s || document.scrollingElement).scrollBy(0, ${Number(a.scroll)}); return true; })()`);
  } else if (a.wait == null) {
    throw new Error('unknown action: ' + JSON.stringify(a));
  }
  await sleep(Math.min(60000, Math.max(400, Number(a.wait) || 900)));
}

async function addTester(name, viewport = 'desktop') {
  if (!/^[a-z0-9_-]{2,24}$/i.test(name)) throw new Error('name: 2-24 letters, digits, - or _');
  if (testers.has(name)) return testers.get(name);
  const [w, h, m] = VIEW[viewport] || VIEW.desktop;
  const page = await browser.newPage({ width: w, height: h, isolated: true });
  if (m) await page.setViewport(w, h, { mobile: true });
  await page.goto(APP + '/');
  // one hashing worker each: ten players share this machine
  await page.eval(`(() => { localStorage.setItem('furrency.chant', JSON.stringify({ threads: 1, engine: 'cpu' })); localStorage.setItem('furrency.probe', '1'); return true; })()`);
  await page.reload(); await sleep(3000);
  const t = { name, page, viewport, errSeen: 0, shots: 0, last: null, actions: 0, created: Date.now() };
  testers.set(name, t);
  return t;
}

const logLine = (t, entry) => appendFileSync(join(OUT, 'logs', `${t.name}.jsonl`), JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n');

/* ── the HTTP API ─────────────────────────────────────────────────────── */
const body = (req) => new Promise((res) => { let s = ''; req.on('data', (d) => { s += d; if (s.length > 1e5) req.destroy(); }); req.on('end', () => { try { res(s ? JSON.parse(s) : {}); } catch { res({ __bad: s }); } }); });
const reply = (res, code, v) => { const isText = typeof v === 'string'; res.writeHead(code, { 'content-type': isText ? 'text/plain; charset=utf-8' : 'application/json' }); res.end(isText ? v + '\n' : JSON.stringify(v, null, 1)); };
let queue = Promise.resolve();
const serial = (fn) => (queue = queue.then(fn, fn));

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://lab');
  try {
    if (url.pathname === '/status') return reply(res, 200, { app: APP, height: await chainHeight(), testers: [...testers.values()].map((t) => ({ name: t.name, viewport: t.viewport, actions: t.actions, chief: t.last?.state?.chief })) });
    if (url.pathname === '/testers' && req.method === 'POST') {
      const b = await body(req);
      const t = await serial(() => addTester(String(b.name || ''), b.viewport));
      const l = await look(t, { shot: true });
      return reply(res, 200, l.text);
    }
    if (url.pathname === '/testers') return reply(res, 200, [...testers.keys()]);
    const m = /^\/t\/([^/]+)\/(look|do|log)$/.exec(url.pathname);
    if (!m) return reply(res, 404, { error: 'see the comment at the top of qa/lab.mjs' });
    const t = testers.get(m[1]);
    if (!t) return reply(res, 404, { error: `no tester ${m[1]} — POST /testers first` });
    if (m[2] === 'log') return reply(res, 200, { actions: t.actions });
    if (m[2] === 'look') {
      const l = await look(t, { shot: url.searchParams.has('shot') });
      logLine(t, { look: l.d.route, errors: l.errs.map((e) => e.text.slice(0, 200)) });
      return reply(res, 200, url.searchParams.has('json') ? { ...l.d, errors: l.errs, screenshot: l.path } : l.text);
    }
    const a = await body(req);
    t.actions++;
    try { await act(t, a); } catch (e) { logLine(t, { action: a, error: e.message }); return reply(res, 400, 'ACTION FAILED: ' + e.message + '\n\n' + (await look(t)).text); }
    const l = await look(t, { shot: url.searchParams.has('shot') || !!a.shot });
    logLine(t, { action: a, route: l.d.route, errors: l.errs.map((e) => e.text.slice(0, 200)) });
    return reply(res, 200, l.text);
  } catch (e) { return reply(res, 500, { error: e.message }); }
}).listen(PORT, '127.0.0.1', () => {
  writeFileSync(join(OUT, 'LAB.txt'), `lab: http://127.0.0.1:${PORT}\napp: ${APP}\nstarted: ${new Date().toISOString()}\n`);
  console.log(`furrency playtest lab on http://127.0.0.1:${PORT} · game ${APP}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { try { await browser.close(); } catch { /* gone */ } vite?.kill(); process.exit(0); });
