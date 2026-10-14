/* Howl progress in player terms: how long until a task lands, and how far along it is by time —
 * shared by the den and the Howl drawer so they always agree. */
import { pow, type PowTask } from './pow';
import { live } from '../chain/live';
import { howlEta, fmtSeconds } from '../lore';

/** Seconds until the task can land (a cautious hash rate when the engine is idle), or null. */
export function howlSeconds(task: PowTask | undefined): number | null {
  if (!task) return null;
  const rate = Math.max(pow.rate, (pow.settings.threads || 1) * 1.5e6);
  return howlEta({ have: task.best?.zeros ?? 0, need: pow.required(task), blocksTo: (z) => pow.blocksUntil(task, z), secondsFor: (z) => Math.pow(16, z) / rate });
}
/** 0..1 by time: what has passed against what is left. Always moves forward. */
export function howlProgress(task: PowTask | undefined): number {
  if (!task) return 0;
  const left = howlSeconds(task);
  const past = Math.max(0, (live.height - task.blockStart) * (live.blockTime || 6));
  if (left == null) return 0.05;
  return Math.min(0.99, Math.max(0.03, past / (past + left)));
}
export const howlEtaWord = (task: PowTask | undefined) => { const e = howlSeconds(task); return e == null ? '' : e < 3 ? 'NOW' : `~${fmtSeconds(e)}`; };
