/* Howl progress in player terms: how long until a task lands, and how far along it is by time —
 * shared by the den and the Howl drawer so they always agree. */
import { pow, type PowTask } from './pow';
import { live } from '../chain/live';
import { howlEta, fmtSeconds } from '../lore';

/** The estimate last shown per task, so a reading taken in a busy moment (a stalled tab, bunched blocks,
 * a dip in hash rate) can't throw "~5M" to "~4H" and back: the shown wait counts down by itself, and
 * a new reading may raise it at most ×2 (a lower reading is taken as it is). */
const told = new Map<string, { s: number; at: number }>();
/** Seconds until the task can land (a cautious hash rate when the engine is idle), or null. */
export function howlSeconds(task: PowTask | undefined): number | null {
  // before the first block the height is unknown and every bar reads 64 zeros: no estimate beats a wild one
  if (!task || !live.height) return null;
  const rate = Math.max(pow.rate, (pow.settings.threads || 1) * 1.5e6);
  const raw = howlEta({ have: task.best?.zeros ?? 0, need: pow.required(task), blocksTo: (z) => pow.blocksUntil(task, z), secondsFor: (z) => Math.pow(16, z) / rate });
  if (raw == null) return null;
  const now = Date.now(), prev = told.get(task.id);
  // a new reading at most once a second (this is asked many times a frame); in between it just counts down
  if (prev && raw > 0 && now - prev.at < 1000) return Math.max(1, prev.s - (now - prev.at) / 1000);
  let s = raw;
  if (prev && raw > 0) {
    // a drop is news (the bar fell, a proof turned up) and is taken at once; a rise may be a busy moment, so at most ×2
    const expected = Math.max(1, prev.s - (now - prev.at) / 1000);
    s = Math.min(expected * 2, raw);
  }
  if (told.size > 64) { const open = new Set(pow.active.map((t) => t.id)); for (const id of told.keys()) if (!open.has(id)) told.delete(id); }
  told.set(task.id, { s, at: now });
  return s;
}
/** Highest fraction shown per task: the estimate of what is left can rise (the measured hash rate
 * comes in lower than assumed, or luck runs long), but a bar that slides back reads as broken. */
const shown = new Map<string, number>();
/** 0..1 by time: what has passed against what is left. Never moves back. */
export function howlProgress(task: PowTask | undefined): number {
  if (!task) return 0;
  const left = howlSeconds(task);
  const past = Math.max(0, (live.height - task.blockStart) * (live.blockTime || 6));
  const now = left == null ? 0.05 : Math.min(0.99, Math.max(0.03, past / (past + left)));
  const frac = Math.max(now, shown.get(task.id) ?? 0);
  if (shown.size > 64) { const open = new Set(pow.active.map((t) => t.id)); for (const id of shown.keys()) if (!open.has(id)) shown.delete(id); }
  shown.set(task.id, frac);
  return frac;
}
// with howling switched off nothing is being worked on: say so, instead of a countdown that can't finish
export const howlEtaWord = (task: PowTask | undefined) => { if (task && !pow.settings.enabled) return 'HOWL OFF'; const e = howlSeconds(task); return e == null ? '' : e < 3 ? 'NOW' : `~${fmtSeconds(e)}`; };
