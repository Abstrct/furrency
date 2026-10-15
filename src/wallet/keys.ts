/* Keys: BIP-39 mnemonic → BIP-32 secp256k1 key on the Cosmos path m/44'/118'/0'/0/i,
 * → bech32 "structs1…" address. Audited primitives only (noble / scure). */
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { bech32 } from '@scure/base';

export const BECH32_PREFIX = 'structs';
export const hdPath = (index = 0) => `m/44'/118'/0'/0/${index}`;

export interface KeyPair { privKey: Uint8Array; pubKey: Uint8Array; address: string; path: string }

/** Normalises what a person pastes: case, stray whitespace, line breaks, numbering. */
export function normaliseMnemonic(m: string): string {
  return m.toLowerCase().replace(/\b\d+[.)]\s*/g, ' ').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).join(' ');
}

export function isValidMnemonic(m: string): boolean { return validateMnemonic(normaliseMnemonic(m), wordlist); }
/** Phrases printed in every tutorial and test kit: whoever types one shares a key with the world. */
const PUBLIC = new Set([
  ['abandon', 11, 'about'], ['abandon', 23, 'art'], ['zoo', 11, 'wrong'], ['zoo', 23, 'vote'],
].map(([w, n, last]) => `${Array(n as number).fill(w).join(' ')} ${last}`).concat(['test test test test test test test test test test test junk']));
/** Why a typed recovery phrase can't be used, as a short sign, or '' when it can. Each failure says
 * which: how many words, which word isn't a word, a typo that breaks the checksum, a public phrase. */
export function phraseProblem(m: string): string {
  const words = normaliseMnemonic(m).split(' ').filter(Boolean);
  if (!words.length) return 'NO WORDS';
  if (words.length !== 12 && words.length !== 24) return `${words.length} WORDS · NEED 12 OR 24`;
  const known = new Set(wordlist);
  const bad = words.findIndex((w) => !known.has(w));
  if (bad >= 0) return `WORD ${bad + 1} ?`;
  if (PUBLIC.has(words.join(' '))) return 'PUBLIC WORDS · NOT SAFE';
  if (!validateMnemonic(words.join(' '), wordlist)) return 'TYPO · CHECK ORDER';
  return '';
}
export function newMnemonic(words: 12 | 24 = 24): string { return generateMnemonic(wordlist, words === 24 ? 256 : 128); }

export function addressOf(pubKey: Uint8Array, prefix = BECH32_PREFIX): string {
  return bech32.encode(prefix, bech32.toWords(ripemd160(sha256(pubKey))));
}

export function isAddress(a: string, prefix = BECH32_PREFIX): boolean {
  try { const d = bech32.decode(a as `${string}1${string}`); return d.prefix === prefix && bech32.fromWords(d.words).length === 20; } catch { return false; }
}

export function deriveKey(mnemonic: string, index = 0, passphrase = ''): KeyPair {
  const m = normaliseMnemonic(mnemonic);
  if (!validateMnemonic(m, wordlist)) throw new Error('That recovery phrase is not a valid BIP-39 mnemonic');
  const seed = mnemonicToSeedSync(m, passphrase);
  const path = hdPath(index);
  const node = HDKey.fromMasterSeed(seed).derive(path);
  if (!node.privateKey || !node.publicKey) throw new Error('Key derivation failed');
  return { privKey: node.privateKey, pubKey: node.publicKey, address: addressOf(node.publicKey), path };
}

/** A key from a raw 32-byte hex private key (for imports from other tools). */
export function keyFromHex(hex: string): KeyPair {
  const clean = hex.trim().replace(/^0x/, '');
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) throw new Error('A private key is 64 hex characters');
  const privKey = Uint8Array.from(clean.match(/../g)!.map((b) => parseInt(b, 16)));
  const pubKey = secp256k1.getPublicKey(privKey, true);
  return { privKey, pubKey, address: addressOf(pubKey), path: 'imported' };
}

/** 64-byte compact, low-S signature over sha256(bytes) — what SIGN_MODE_DIRECT wants. */
export function signBytes(privKey: Uint8Array, bytes: Uint8Array): Uint8Array {
  return secp256k1.sign(bytes, privKey, { prehash: true, lowS: true });
}

export function verifyBytes(pubKey: Uint8Array, bytes: Uint8Array, sig: Uint8Array): boolean {
  try { return secp256k1.verify(sig, bytes, pubKey, { prehash: true, lowS: true }); } catch { return false; }
}

export const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
export const fromHex = (h: string) => Uint8Array.from((h.match(/../g) || []).map((b) => parseInt(b, 16)));
export function toB64(b: Uint8Array): string { let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s); }
export function fromB64(s: string): Uint8Array { const bin = atob(s); const o = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i); return o; }
