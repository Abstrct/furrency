/* A small WebDriver BiDi driver for Firefox: no dependencies beyond Node 22+ (global WebSocket).
 * Firefox dropped the Chrome DevTools protocol; BiDi is its automation protocol now. Launches
 * Firefox with a throwaway profile (prefs written to user.js), opens one tab, and offers the
 * handful of calls the QA scripts need: navigate, eval, viewport, click, key, screenshot, and the
 * console errors the page logged. */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FIREFOX_PATHS = [process.env.FIREFOX, '/Applications/Firefox.app/Contents/MacOS/firefox', '/usr/bin/firefox', '/snap/bin/firefox'].filter(Boolean);
export function findFirefox() {
  for (const p of FIREFOX_PATHS) if (existsSync(p)) return p;
  throw new Error('No Firefox found. Set FIREFOX=/path/to/firefox');
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** prefs: extra about:config values, e.g. { 'gfx.canvas.accelerated': false } */
export async function launchFirefox({ headless = true, width = 1440, height = 900, prefs = {} } = {}) {
  const port = 9300 + Math.floor(Math.random() * 600);
  const profile = join(tmpdir(), `furrency-ff-${process.pid}-${port}`);
  rmSync(profile, { recursive: true, force: true }); mkdirSync(profile, { recursive: true });
  const all = {
    'browser.shell.checkDefaultBrowser': false, 'browser.startup.homepage_override.mstone': 'ignore', 'datareporting.policy.dataSubmissionEnabled': false,
    'toolkit.telemetry.reportingpolicy.firstRun': false, 'browser.aboutwelcome.enabled': false, 'app.update.disabledForTesting': true,
    'media.autoplay.default': 0, 'dom.min_background_timeout_value': 4, ...prefs,
  };
  writeFileSync(join(profile, 'user.js'), Object.entries(all).map(([k, v]) => `user_pref(${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('\n') + '\n');
  const args = ['--profile', profile, '--no-remote', '--new-instance', `--remote-debugging-port=${port}`, `--width=${width}`, `--height=${height}`, ...(headless ? ['--headless'] : []), 'about:blank'];
  const proc = spawn(findFirefox(), args, { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, MOZ_REMOTE_SETTINGS_DEVTOOLS: '1' } });
  let stderr = ''; proc.stderr.on('data', (d) => { stderr += d; if (stderr.length > 20000) stderr = stderr.slice(-10000); });
  let ws = null;
  for (let i = 0; i < 150 && !ws; i++) {
    try {
      const s = new WebSocket(`ws://127.0.0.1:${port}/session`);
      await new Promise((res, rej) => { s.onopen = res; s.onerror = () => rej(new Error('no')); });
      ws = s;
    } catch { await sleep(200); }
  }
  if (!ws) { proc.kill(); throw new Error('Firefox did not open its BiDi port. ' + stderr.slice(-400)); }
  const ff = new Firefox(ws, proc, profile);
  await ff.send('session.new', { capabilities: { alwaysMatch: { acceptInsecureCerts: true } } });
  await ff.send('session.subscribe', { events: ['log.entryAdded'] });
  const tree = await ff.send('browsingContext.getTree', {});
  ff.context = tree.contexts[0].context;
  await ff.viewport(width, height, 1);
  return ff;
}

class Firefox {
  constructor(ws, proc, profile) {
    this.ws = ws; this.proc = proc; this.profile = profile; this.id = 0; this.pending = new Map(); this.logs = [];
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id != null && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id); this.pending.delete(msg.id);
        if (msg.type === 'error') p.reject(new Error(`${msg.error}: ${msg.message}`)); else p.resolve(msg.result);
      } else if (msg.method === 'log.entryAdded') {
        const e = msg.params;
        this.logs.push({ level: e.level, text: e.text || (e.args || []).map((a) => a.value ?? a.type).join(' '), at: Date.now() });
      }
    };
  }
  send(method, params = {}, ms = 60000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} timed out`)); }, ms);
      this.pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  viewport(width, height, dpr = 1) { return this.send('browsingContext.setViewport', { context: this.context, viewport: { width, height }, devicePixelRatio: dpr }); }
  async goto(url) { this.logs.length = 0; await this.send('browsingContext.navigate', { context: this.context, url, wait: 'complete' }); }
  /** Evaluate an expression (it may await); its value comes back through JSON. */
  async eval(expression) {
    const r = await this.send('script.evaluate', { expression: `(async () => JSON.stringify(await (${expression})))()`, target: { context: this.context }, awaitPromise: true, resultOwnership: 'none' });
    if (r.type === 'exception') throw new Error('page: ' + (r.exceptionDetails?.text || 'exception'));
    const v = r.result?.value;
    return v === undefined ? undefined : JSON.parse(v);
  }
  async waitFor(expression, { timeout = 30000, every = 200, what = expression } = {}) {
    const t0 = Date.now(); let last;
    while (Date.now() - t0 < timeout) { try { last = await this.eval(expression); if (last) return last; } catch (e) { last = e.message; } await sleep(every); }
    throw new Error(`timed out after ${timeout}ms waiting for ${what} (last: ${JSON.stringify(last)?.slice(0, 200)})`);
  }
  async click(x, y) {
    await this.send('input.performActions', { context: this.context, actions: [{ type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [{ type: 'pointerMove', x: Math.round(x), y: Math.round(y) }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 }] }] });
  }
  async key(key) {
    const k = { Enter: '', Escape: '', Tab: '' }[key] || key;
    await this.send('input.performActions', { context: this.context, actions: [{ type: 'key', id: 'kb', actions: [{ type: 'keyDown', value: k }, { type: 'keyUp', value: k }] }] });
  }
  async screenshot(path) {
    const { data } = await this.send('browsingContext.captureScreenshot', { context: this.context });
    const buf = Buffer.from(data, 'base64'); if (path) await writeFile(path, buf); return buf;
  }
  errors() { return this.logs.filter((l) => l.level === 'error'); }
  async close() {
    try { await this.send('session.end', {}, 3000); } catch { /* gone */ }
    try { this.ws.close(); } catch { /* ignore */ }
    try { this.proc.kill('SIGKILL'); } catch { /* ignore */ }
    await sleep(300);
    rmSync(this.profile, { recursive: true, force: true });
  }
}
