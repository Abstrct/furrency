/* The howl (proof-of-work) hasher: the midstate SHA-256 matches a reference implementation for
 * prefixes that leave one or two tail blocks, nonce editing is exact, and difficulty follows
 * structsd's CalculateDifficulty. */
import { sha256 } from '@noble/hashes/sha2.js';
import { bumpNonce, difficultyAt, digestHex, makeJob, nonceString, setNonce, tryNonce, NONCE_WIDTH } from '../src/pow/sha';
import { ok, done } from './check';

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

for (const prefix of ['5-12BUILD3007073NONCE', '9-3297@2-50363RAID3001000NONCE', 'x'.repeat(40), 'y'.repeat(50), 'z'.repeat(64), 'w'.repeat(100), 'v'.repeat(119)]) {
  const job = makeJob(prefix);
  const out = new Int32Array(8);
  let good = true;
  setNonce(job, 999_999_990);   // rolls over a digit boundary inside the run
  for (let i = 0; i < 25; i++) {
    tryNonce(job, out);
    if (digestHex(out) !== hex(sha256(new TextEncoder().encode(prefix + nonceString(job))))) good = false;
    bumpNonce(job);
  }
  ok(good, `midstate hash matches reference (prefix ${prefix.length} bytes)`);
}
const j = makeJob('a'); setNonce(j, 42);
ok(nonceString(j) === '42'.padStart(NONCE_WIDTH, '0'), 'nonce digits written exactly');
ok(difficultyAt(1, 200) === 64 && difficultyAt(200, 200) === 1 && difficultyAt(100, 200) === 64 - Math.floor(Math.log10(100) / Math.log10(200) * 63), 'difficulty curve');
ok(difficultyAt(10_000, 200) === 1, 'difficulty never drops below 1');
done('pow');
