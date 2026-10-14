/* The Furrency lexicon. Mechanics come from the catalogue (src/data/catalogue.ts); only names,
 * looks and words live here. Everything a chief reads is one or two plain words: no sentences.
 * Chain errors pass through tag(), which boils any refusal down to a short sign. */
import { type Ambit, type StructType } from './data/catalogue';
import { live } from './chain/live';

/* ── Zones (the chain's ambits) ─────────────────────────────────────── */

export type Realm = 'star' | 'sky' | 'root' | 'tide';
export const REALM_OF_AMBIT: Record<Ambit, Realm> = { space: 'star', air: 'sky', land: 'root', water: 'tide' };
export const AMBIT_OF_REALM: Record<Realm, Ambit> = { star: 'space', sky: 'air', root: 'land', tide: 'water' };
export const REALMS: Realm[] = ['star', 'sky', 'root', 'tide'];
export const REALM_NAME: Record<Realm, string> = { star: 'STAR', sky: 'SKY', root: 'ROOT', tide: 'TIDE' };
export const REALM_COLOR: Record<Realm, string> = { star: '#B89BFF', sky: '#22E4FF', root: '#7CFF6B', tide: '#3D8BFF' };
export const TOTEM_COLOR = '#FFE53B';
/** Back-compat name the engine uses for planet structs. */
export const HALLOW_COLOR = TOTEM_COLOR;

/* ── Palette ───────────────────────────────────────────────────────── */

export const INK = '#0A0612';
export const PAPER = '#FFF8E7';
export const C = { ink: INK, paper: PAPER, yellow: '#FFE53B', pink: '#FF2E88', cyan: '#22E4FF', orange: '#FF7A1A', violet: '#B89BFF', green: '#7CFF6B', night: '#140C2B', blue: '#3D8BFF', red: '#FF3B3B' };

/* ── Beasts and totems ─────────────────────────────────────────────── */

export type Ears = 'sharp' | 'round' | 'long' | 'bat' | 'mane' | 'tiny' | 'tufted' | 'nub' | 'floppy' | 'none';
export type Snout = 'short' | 'long' | 'flat' | 'horn' | 'tusk' | 'beak';
export type Mark = 'none' | 'mask' | 'stripe' | 'spots' | 'blaze' | 'brow';
export type TotemKind = 'mole' | 'badger' | 'pole' | 'moon' | 'burrow' | 'spire' | 'stone' | 'heart' | 'tree';

export interface Look {
  fur: string; fur2: string; belly: string; eye: string;
  ears: Ears; snout: Snout; mark: Mark;
  quills?: boolean; wings?: boolean; fins?: boolean; whiskers?: boolean;
  /** Build: wider shoulders and head for the big kin, narrower for the quick ones (1 = average). */
  bulk?: number;
  /** Totems that are objects, not creatures, draw with their own kind. */
  totem?: TotemKind;
}
export interface Lore { name: string; role: string; look: Look }

export const BEASTS: Record<number, Lore> = {
  1: { name: 'SUN LION', role: 'KING', look: { fur: '#FFB627', fur2: '#E2571B', belly: '#FFF2C9', eye: '#22E4FF', ears: 'mane', snout: 'short', mark: 'brow', whiskers: true, bulk: 1.12 } },
  2: { name: 'STAR BEAR', role: 'HEAVY', look: { fur: '#6B4A2E', fur2: '#3E2715', belly: '#D9B48A', eye: '#B89BFF', ears: 'round', snout: 'short', mark: 'blaze', bulk: 1.2 } },
  3: { name: 'COMET FOX', role: 'FAST', look: { fur: '#FF7A1A', fur2: '#B83A0E', belly: '#FFF8E7', eye: '#22E4FF', ears: 'sharp', snout: 'long', mark: 'mask', whiskers: true, bulk: 0.88 } },
  4: { name: 'VOID OWL', role: 'REACH', look: { fur: '#5B4A8A', fur2: '#2C2050', belly: '#D9CCFF', eye: '#FFE53B', ears: 'tufted', snout: 'beak', mark: 'brow', wings: true } },
  5: { name: 'GUST FERRET', role: 'CHEAP', look: { fur: '#E8D8B8', fur2: '#8C6A45', belly: '#FFF8E7', eye: '#FF2E88', ears: 'round', snout: 'long', mark: 'mask', whiskers: true, bulk: 0.82 } },
  6: { name: 'SHADE BAT', role: 'HIDE', look: { fur: '#3B2E5A', fur2: '#1B1430', belly: '#7A6AA8', eye: '#FF2E88', ears: 'bat', snout: 'short', mark: 'none', wings: true } },
  7: { name: 'STORM HARE', role: 'DODGE', look: { fur: '#B89BFF', fur2: '#6A4FD0', belly: '#F2EDFF', eye: '#FFE53B', ears: 'long', snout: 'short', mark: 'stripe', whiskers: true, bulk: 0.86 } },
  8: { name: 'BOULDER BOAR', role: 'LOB', look: { fur: '#8A5A3C', fur2: '#4A2C1A', belly: '#C9967A', eye: '#FF7A1A', ears: 'floppy', snout: 'tusk', mark: 'stripe', bulk: 1.1 } },
  9: { name: 'IRON RHINO', role: 'ARMOR', look: { fur: '#8E9AAF', fur2: '#4F5A70', belly: '#C9D2E3', eye: '#22E4FF', ears: 'nub', snout: 'horn', mark: 'none', bulk: 1.18 } },
  10: { name: 'QUILL HOG', role: 'ANTI-SKY', look: { fur: '#7A6048', fur2: '#3A2A1C', belly: '#E8D2B0', eye: '#7CFF6B', ears: 'tiny', snout: 'long', mark: 'none', quills: true, bulk: 0.95 } },
  11: { name: 'TIDE OTTER', role: 'ALL-ROUND', look: { fur: '#7A4A2A', fur2: '#43250F', belly: '#F2D2A9', eye: '#22E4FF', ears: 'tiny', snout: 'flat', mark: 'none', whiskers: true } },
  12: { name: 'FANG WALRUS', role: 'BITE BACK', look: { fur: '#A8745A', fur2: '#5E3A28', belly: '#E8C2A8', eye: '#FF2E88', ears: 'none', snout: 'tusk', mark: 'none', whiskers: true, bulk: 1.22 } },
  13: { name: 'DEEP MINK', role: 'HIDE', look: { fur: '#2E3A5A', fur2: '#141B30', belly: '#8FA3C9', eye: '#7CFF6B', ears: 'tiny', snout: 'long', mark: 'mask', fins: true, bulk: 0.86 } },
  14: { name: 'DIG MOLE', role: 'DIG', look: { fur: '#5A3E52', fur2: '#2E1F2A', belly: '#FF9EC4', eye: '#FFE53B', ears: 'none', snout: 'long', mark: 'none', totem: 'mole', whiskers: true } },
  15: { name: 'FORGE BADGER', role: 'FORGE', look: { fur: '#5A5A6E', fur2: '#26262F', belly: '#FFF8E7', eye: '#FF7A1A', ears: 'round', snout: 'long', mark: 'mask', totem: 'badger' } },
  16: { name: 'STAR POLE', role: 'WARD +', look: { fur: '#FF2E88', fur2: '#9A1550', belly: '#FFE53B', eye: '#22E4FF', ears: 'sharp', snout: 'short', mark: 'none', totem: 'pole' } },
  17: { name: 'HUSH MOON', role: 'WARD · JAM', look: { fur: '#D9CCFF', fur2: '#8A78C9', belly: '#FFF8E7', eye: '#FF2E88', ears: 'none', snout: 'short', mark: 'none', totem: 'moon' } },
  18: { name: 'STONE BURROW', role: 'WARD ++', look: { fur: '#8E9AAF', fur2: '#4F5A70', belly: '#C9D2E3', eye: '#FFE53B', ears: 'none', snout: 'short', mark: 'none', totem: 'burrow' } },
  19: { name: 'THORN SPIRE', role: 'STING', look: { fur: '#7CFF6B', fur2: '#2E8A2A', belly: '#FFE53B', eye: '#FF2E88', ears: 'none', snout: 'short', mark: 'none', totem: 'spire' } },
  20: { name: 'GLOW STONE', role: 'GLOW', look: { fur: '#22E4FF', fur2: '#0E7A9A', belly: '#FFF8E7', eye: '#FFE53B', ears: 'none', snout: 'short', mark: 'none', totem: 'stone' } },
  21: { name: 'GLOW HEART', role: 'GLOW +', look: { fur: '#FF2E88', fur2: '#9A1550', belly: '#FFF8E7', eye: '#22E4FF', ears: 'none', snout: 'short', mark: 'none', totem: 'heart' } },
  22: { name: 'SUN TREE', role: 'GLOW ++', look: { fur: '#7CFF6B', fur2: '#2E8A2A', belly: '#FFE53B', eye: '#FFE53B', ears: 'none', snout: 'short', mark: 'none', totem: 'tree' } },
};

const FALLBACK: Lore = { name: 'BEAST', role: '', look: { fur: '#999', fur2: '#555', belly: '#ddd', eye: '#22E4FF', ears: 'round', snout: 'short', mark: 'none' } };
export const lore = (typeId: number): Lore => BEASTS[typeId] ?? { ...FALLBACK, name: `KIN ${typeId}` };
export const beastName = (typeId: number) => lore(typeId).name;
export const isTotem = (t?: StructType) => t?.category === 'planet';
export const isHallow = isTotem;
export const KING_TYPE = 1;

/** Defensive arts, by the chain's unitDefenses value. */
export const WARD_CRAFT: Record<string, string> = {
  noUnitDefenses: 'NONE', signalJamming: 'JAM', defensiveManeuver: 'DODGE', stealthMode: 'HIDE',
  armour: 'ARMOR', indirectCombatModule: 'LOB', perimeterFencing: 'FENCE',
};

/** Reach bitmask → zones. */
export function reachOf(mask: number): Realm[] {
  const out: Realm[] = [];
  if (mask & 16) out.push('star');
  if (mask & 8) out.push('sky');
  if (mask & 4) out.push('root');
  if (mask & 2) out.push('tide');
  return out;
}

/* ── Numbers ───────────────────────────────────────────────────────── */

/** Glow is the chain's power in kilo-units (milliwatts / 1000). */
export const mana = (mw: bigint | number) => Math.round(Number(mw) / 1000);
export const glow = mana;
export function short(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (a >= 1e4) return (n / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toLocaleString('en-US');
}
export const fmtMana = (mw: bigint | number) => short(mana(mw));
export const fmtGlow = fmtMana;
export const alpha = (ualpha: bigint) => Number(ualpha) / 1e6;
export function fmtAlpha(ualpha: bigint) {
  const a = alpha(ualpha);
  if (a >= 10000) return short(a);
  return a.toLocaleString('en-US', { maximumFractionDigits: a >= 100 ? 1 : 2, minimumFractionDigits: a > 0 && a < 100 ? 2 : 0 });
}
export const sheaves = (n: number) => `${short(n)} SHARD`;
export const shards = sheaves;
export const fmtBreath = (n: number) => (n >= 99 ? 'FULL' : String(n));
export const fmtPulse = fmtBreath;

/** Beats (blocks) as a wait. A beat is about six seconds. */
export function bellsAsTime(n: number) {
  // beats are as long as the chain makes them (about 6 s on the testnet, far less on a devnet)
  const s = Math.max(0, n) * (live.blockTime > 0 ? live.blockTime : 6);
  if (s < 60) return `${Math.max(5, Math.round(s / 5) * 5)}S`;
  const m = s / 60;
  if (m < 90) return `${Math.round(m)}M`;
  const hr = m / 60;
  return hr < 36 ? `${Math.round(hr)}H` : `${Math.round(hr / 24)}D`;
}
export const beatsAsTime = bellsAsTime;
export function agoMs(t: number, now = Date.now()) {
  const s = (now - t) / 1000;
  if (s < 45) return 'NOW';
  return bellsAsTime(s / (live.blockTime > 0 ? live.blockTime : 6));
}

/** How long a howl of this difficulty feels, in one word. */
export const pace = (d: number) => (d <= 300 ? 'QUICK' : d <= 1000 ? 'STEADY' : d <= 6000 ? 'LONG' : d <= 20000 ? 'SLOW' : 'VERY SLOW');

/** A rough wait for a howl task, from the engine's numbers: the earliest moment the falling bar meets
 * what this browser can find. Null when unknown. */
export function howlEta(o: { have: number; need: number; blocksTo: (zeros: number) => number; secondsFor: (zeros: number) => number }): number | null {
  if (o.have >= o.need) return 0;
  let best = Infinity;
  for (let z = Math.max(1, o.have + 1); z <= o.need; z++) {
    const wait = Math.max(o.blocksTo(z) * (live.blockTime > 0 ? live.blockTime : 6), o.secondsFor(z));
    if (wait < best) best = wait;
  }
  return Number.isFinite(best) ? best : null;
}
export function fmtSeconds(s: number) { return s < 60 ? `${Math.max(5, Math.round(s / 5) * 5)}S` : s < 5400 ? `${Math.round(s / 60)}M` : `${Math.round(s / 3600)}H`; }

/** A den's sky holds this many prowlers at once. */
export const skyHolds = (cap: number) => (cap <= 1 ? 'SKY FULL' : `SKY FULL · ${cap}`);

/* ── Clans ─────────────────────────────────────────────────────────── */

export const CLAN_NAMES: Record<string, string> = { '0-1': 'FIRST PAW', '0-2': 'GOLD MIRE', '0-3': 'LAMP WATCH', '0-4': 'CRAB CLAW', '0-5': 'BETA SPIRE' };
export const CLAN_COLORS = ['#FFE53B', '#22E4FF', '#FF2E88', '#7CFF6B', '#FF7A1A', '#B89BFF', '#3D8BFF', '#FF9EC4'];
export function covenColor(id: string) { const n = Number(id.split('-')[1] || 0); return CLAN_COLORS[(n - 1 + CLAN_COLORS.length) % CLAN_COLORS.length]; }
export function covenName(id: string, published?: string) {
  if (!id) return 'WILD';
  // a clan's own name, minus the old world's words for a clan
  const n = (published || CLAN_NAMES[id] || `CLAN ${id.split('-')[1] || id}`).toUpperCase().replace(/\b(GUILD|COVEN|CORP|CORPORATION)\b/g, 'CLAN').replace(/\s+/g, ' ').trim();
  return n || `CLAN ${id.split('-')[1] || id}`;
}
export const clanColor = covenColor;
export const clanName = covenName;

/* ── Refusals: any chain or app error, as a short sign ─────────────── */

const STATE_WORD: Record<string, string> = {
  destroyed: 'FALLEN', building: 'STILL CALLING', built: 'ALREADY UP', online: 'AWAKE', offline: 'ASLEEP',
  hidden: 'HIDDEN', visible: 'NOT HIDDEN', not_mining: 'NOT DIGGING', not_refining: 'NOT FORGING', not_defending: 'NOT GUARDING',
};
const TAGS: [RegExp, string | ((...m: string[]) => string)][] = [
  [/queue_full/i, 'SKY FULL'],
  [/not_first_in_queue/i, 'WAIT TURN'],
  [/raid_clock_unset/i, 'NOT YET'],
  [/raid_complete while on_station/i, 'PACK HOME'],
  [/shields_active/i, 'KING GUARDS'],
  [/needs an online command struct/i, 'KING NAPS'],
  [/needs a command struct/i, 'NO KING'],
  [/cannot (?:build|explore) while away/i, 'PACK AWAY'],
  [/has ore available for mining/i, 'DEN NOT EMPTY'],
  [/cannot (?:mine|refine) while under_raid/i, 'UNDER PROWL'],
  [/is already complete/i, 'DEN DONE'],
  [/is empty, nothing to mine/i, 'DEN EMPTY'],
  [/not_active/i, 'DEN GONE'],
  [/\bis (\w+) but must be (\w+)/i, (_m: string, was: string) => STATE_WORD[was] || 'NOT READY'],
  [/insufficient (?:funds|balance)|spendable balance/i, 'LOW ALPHA'],
  [/charge|battery|breath/i, 'LOW PULSE'],
  [/capacity|overdrawn|\bload\b|power|mana/i, 'LOW GLOW'],
  [/sequence mismatch|account sequence/i, 'RETRY'],
  [/proof|difficulty|hash|chant/i, 'HOWL WEAK'],
  [/out of (?:reach|range)|cannot reach|ambit|realm/i, 'NO REACH'],
  [/permission|unauthori[sz]ed|not allowed/i, 'NO RIGHT'],
  [/BIP-39|mnemonic|recovery phrase|soul-words|true words/i, 'BAD WORDS'],
  [/wrong passphrase/i, 'WRONG KEY'],
  [/at least 8/i, '8+ LETTERS'],
  [/refused you|coven refused|clan refused/i, 'CLAN SAYS NO'],
  [/hall|did not answer|can.t be reached/i, 'CLAN SILENT'],
  [/no warden appeared|no chief appeared/i, 'SLOW CLAN'],
  [/locked|sealed|unseal/i, 'PAW LOCKED'],
  [/key storage|lost the seal|no longer opens/i, 'PAW LOST'],
  [/took too long|timeout|timed out|abort/i, 'TOO SLOW'],
  [/answered 5\d\d|failed to fetch|network|unavailable|ECONN/i, 'NET DOWN'],
  [/not found|answered 404/i, 'NOT FOUND'],
  [/destroyed|fallen/i, 'FALLEN'],
  [/hidden|stealth/i, 'HIDDEN'],
  [/full/i, 'FULL'],
];

/** Any refusal or failure as a short sign: "LOW GLOW", "KING NAPS", "NOPE". */
export function tag(text: string | null | undefined): string {
  const s = String(text || '');
  for (const [re, to] of TAGS) {
    const m = re.exec(s);
    if (m) return typeof to === 'string' ? to : to(...(m as unknown as string[]));
  }
  return 'NOPE';
}

/** Deed labels are already in Furrency words; anything else becomes a short sign. */
export function speak(text: string): string {
  if (!text) return text;
  return /^[A-Z0-9α ·+\-−×!?.:’'#/%,_→]+$/.test(text) ? text : tag(text);
}
export const retell = (label: string) => label;
export const retellError = tag;
