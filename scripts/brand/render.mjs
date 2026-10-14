#!/usr/bin/env node
/* Render the share card and icons from scripts/brand/brand.html into public/, through a running dev
 * server (pnpm dev):  node scripts/brand/render.mjs [http://localhost:5193] */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome, sleep } from '../../qa/lib/cdp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = process.argv[2] || 'http://localhost:5193';
const OUT = join(ROOT, 'public');
const jobs = [
  ['og', 1200, 630, 'og.png'],
  ['icon&size=512', 512, 512, 'icon-512.png'],
  ['icon&size=192', 192, 192, 'icon-192.png'],
  ['icon&size=180', 180, 180, 'apple-touch-icon.png'],
  ['icon&size=32', 32, 32, 'favicon-32.png'],
];
const b = await launchChrome({ width: 1200, height: 630 });
try {
  for (const [mode, w, h, file] of jobs) {
    const p = await b.newPage({ width: w, height: h });
    await p.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
    await p.goto(`${APP}/scripts/brand/brand.html?mode=${mode}`);
    await p.waitFor('document.title === "ready"', { timeout: 30000 });
    await sleep(300);
    await p.screenshot(join(OUT, file), { clip: { x: 0, y: 0, width: w, height: h } });
    console.log('wrote public/' + file);
    await p.close();
  }
} finally { await b.close(); }
