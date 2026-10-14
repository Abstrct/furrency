/* Furrency boots: the net's heartbeat (live), the paw (wallet), the chiefs it commands (empire), the
 * howl engine (pow) and the deed queue (txq) — then the frame and the screens, routed by hash. */
import './styles.css';
import { live } from './chain/live';
import { wallet } from './wallet/wallet';
import { empire } from './game/empire';
import { pow } from './pow/pow';
import { txq } from './wallet/queue';
import { resumeEnlist } from './game/enlist';
import { toast } from './core/dom';
import { audio, ambience } from './core/audio';
import { beastName, tag } from './lore';
import { openPact } from './ui/pact';
import { mountShell } from './ui/shell';
import { takeClaim } from './core/claims';
import { canRetry } from './game/actions';
import { typeOf } from './data/catalogue';
import type { Screen, Ctx } from './screens/types';
import { grass } from './grass/grass';
import { startAlarms, watchAway } from './ui/alarms';
import { clan } from './net/clan';

const MAKERS: Record<string, () => Promise<(ctx: Ctx) => Screen>> = {
  '': () => import('./screens/gate').then((m) => m.gate),
  den: () => import('./screens/den').then((m) => m.den),
  hunt: () => import('./screens/hunt').then((m) => m.hunt),
  prowl: () => import('./screens/prowl').then((m) => m.prowl),
  glow: () => import('./screens/glow').then((m) => m.glow),
  kin: () => import('./screens/kin').then((m) => m.kin),
  glyphs: () => import('./screens/glyphs').then((m) => m.glyphs),
};

const app = document.getElementById('app')!;
const bootStep = document.getElementById('boot-step')!;
const shell = mountShell(app, () => openPact());
let current: Screen | null = null;
const alarms = startAlarms((p) => { location.hash = p; });
watchAway();
let routing = 0;

function parse(): { name: string; param?: string; path: string } {
  const raw = (location.hash || '#/').replace(/^#\/?/, '');
  const [name, param] = raw.split('/');
  return { name: MAKERS[name] ? name : '', param: param ? decodeURIComponent(param) : undefined, path: '#/' + (MAKERS[name] ? name : '') };
}

async function route() {
  const my = ++routing;
  const r = parse();
  const make = await MAKERS[r.name]();
  if (my !== routing) return;
  // a comic panel wipes across between places; the new place appears under it
  if (current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const w = document.createElement('div'); w.className = 'wipe'; document.body.append(w);
    setTimeout(() => w.remove(), 520);
    await new Promise((res) => setTimeout(res, 220));
    if (my !== routing) return;
  }
  current?.leave();
  shell.slot.textContent = '';
  document.body.dataset.route = r.name || 'gate';
  // peeking at another chief's den is part of the hunt
  shell.setRoute(r.name === 'den' && r.param ? 'hunt' : r.name);
  const ctx: Ctx = { route: r.path, param: r.param, go: (p) => { location.hash = p; }, pact: openPact };
  current = make(ctx);
  shell.slot.append(current.el);
  current.enter?.();
  // a new place takes the keyboard's focus, so Tab starts inside it
  shell.slot.setAttribute('tabindex', '-1');
  if (!document.querySelector('.veil')) shell.slot.focus({ preventScroll: true });
  document.title = current.title ? `${current.title} · Furrency` : 'Furrency — Be the Alpha · a fur-beast strategy game on the Structs network';
}

/* The herald: deeds that land or fail, told once as a short sign, wherever the chief is. */
txq.onSettled((j) => {
  const urls = j.msgs.map((m) => m.typeUrl).join();
  if (j.source === 'pow' && j.status === 'success') {
    if (/StructBuildComplete/.test(urls)) {
      const sid = String((j.msgs[0]?.value as Record<string, unknown>)?.structId || '');
      const own = empire.ownerOf(sid)?.structs.get(sid);
      const id = own?.typeId || (j.events || []).map((e) => (e.data as { structure?: { type?: string } })?.structure?.type).find(Boolean);
      toast(`${id && typeOf(id) ? beastName(Number(id)) : 'KIN'} · UP!`, 'player', 4000);
    } else if (/OreMinerComplete/.test(urls)) { toast('DIG! +SHARD', 'player', 6000); if (j.playerId) alarms.landed('dig', j.playerId); }
    else if (/OreRefineryComplete/.test(urls)) { toast('FORGE! +ALPHA', 'player', 6000); if (j.playerId) alarms.landed('forge', j.playerId); }
    else if (/PlanetRaidComplete/.test(urls)) {
      const took = (j.events || []).filter((e) => e.type === 'EventOreTheft').reduce((n, e) => n + Number(((e.data as Record<string, unknown>)?.eventOreTheftDetail as Record<string, unknown> | undefined)?.amount ?? (e.data as Record<string, unknown>)?.amount ?? 0), 0);
      toast(took > 0 ? `SNATCH! +${took} SHARD` : 'SNATCH · EMPTY', took > 0 ? 'player' : 'warn', 5000);
    }
    audio.howl();
    return;
  }
  if (j.status === 'success' && /StructBuildInitiate/.test(urls)) { toast('CALLING · HOWL ON', 'player', 3000); audio.pop(); return; }
  if (j.status === 'success' && document.body.dataset.route === 'prowl' && /StructAttack$/.test(urls)) return;
  if (j.status === 'success') { toast(`${j.label.split(' · ')[0]} · DONE`, 'player', 2200); audio.click(); return; }
  if (j.status === 'failed' && takeClaim(j.id)) return;
  if (j.status === 'failed' && j.source === 'pow' && /PlanetRaidComplete$/.test(urls)) return;
  if (j.status === 'failed') { toast(j.error || 'NOPE', 'enemy', 7000, canRetry(j) ? { label: 'AGAIN', run: () => { if (canRetry(j)) txq.retry(j.id); } } : undefined); audio.thud(); }
});

async function boot() {
  bootStep.textContent = 'LINK';
  live.start();
  bootStep.textContent = 'PAW';
  await Promise.race([wallet.restore(), new Promise((r) => setTimeout(r, 5000))])
    .catch((e) => toast(tag((e as Error).message), 'enemy', 9000, { label: 'PAW', run: () => openPact() }));
  wallet.onChange(resumeEnlist); resumeEnlist();
  void empire; void pow;
  if (wallet.state === 'locked' && txq.active.length) toast(`${txq.active.length} DEEDS · UNLOCK`, 'warn', 6000, { label: 'UNLOCK', run: () => openPact() });
  // GRASS, the clan's live feed: it patches the chiefs we follow the moment the chain changes them,
  // and asks for a fresh read of exactly the chief an event touched (no waiting for the next sweep)
  grass.on(undefined, (e) => {
    if (e.kind === 'block') return;
    if (e.kind === 'grid' && e.objectId && /^1-\d+$/.test(e.objectId) && empire.isTracked(e.objectId)) empire.patchGrid(e.objectId, e.category, e.data.value);
    const d = e.detail || {};
    for (const id of [e.playerId, e.planetId, e.objectId, d.struct_id, d.fleet_id, d.attackerPlayerId, d.defender_struct_id, d.protected_struct_id]) {
      if (typeof id === 'string' && /^\d+-\d+$/.test(id) && empire.isTracked(id)) empire.poke(id);
    }
  });
  // sign in to the chief's clan in the background: the Guild API then serves their reads
  wallet.onChange(() => { void clan.ready(); });
  void clan.ready();
  window.addEventListener('hashchange', route);
  await document.fonts?.ready.catch(() => undefined);
  await route();
  const b = document.getElementById('boot');
  b?.classList.add('gone');
  setTimeout(() => b?.remove(), 900);
  document.addEventListener('pointerdown', () => { ambience.start(); }, { once: true });
  // every comic button answers with a little click
  document.addEventListener('pointerdown', (e) => { if ((e.target as HTMLElement)?.closest?.('.cbtn, .rail a, .choice, .callcard, .kinrow, .prey')) audio.click(); });
  // 1–6 jump between places (never while typing)
  const keys = ['den', 'hunt', 'prowl', 'glow', 'kin', 'glyphs'];
  document.addEventListener('keydown', (e) => {
    const tgt = e.target as HTMLElement;
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(tgt?.tagName) || document.querySelector('.veil')) return;
    const i = Number(e.key) - 1;
    if (i >= 0 && i < keys.length) location.hash = `#/${keys[i]}`;
  });
}

// the playtest probe (src/qa/probe.ts): in dev, or when asked for
try {
  const want = (import.meta as { env?: { DEV?: boolean } }).env?.DEV || /[?&]probe\b/.test(location.search) || localStorage.getItem('furrency.probe') === '1';
  if (want) void import('./qa/probe').then((m) => m.installProbe());
} catch { /* no probe */ }

void boot();
