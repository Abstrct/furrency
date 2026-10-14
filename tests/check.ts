/* The tiny harness every suite shares: plain Node, no framework. */
let fails = 0;
export const ok = (cond: unknown, msg: string) => { if (!cond) { fails++; console.error('FAIL', msg); } else console.log('ok  ', msg); };
export function done(suite: string) {
  if (fails) { console.error(`${suite}: ${fails} check(s) failed`); process.exit(1); }
  console.log(`${suite}: all checks passed`);
}
