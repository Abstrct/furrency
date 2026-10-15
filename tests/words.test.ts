/* Furrency's words: every beast and totem has its own name, refusals become short signs (never
 * sentences), the old world's words for a clan never show, and the small number formats hold. */
import { STRUCT_TYPES } from '../src/data/catalogue';
import { BEASTS, beastName, clanName, fmtSeconds, pace, speak, tag, reachOf, REALMS } from '../src/lore';
import { nameProblem } from '../src/game/names';
import { ok, done } from './check';

const SIGN = /^[A-Z0-9 ·+\-−!?]+$/;
for (const t of STRUCT_TYPES) ok(BEASTS[t.id] && !/^KIN \d/.test(beastName(t.id)), `type ${t.id} has a fur name (${beastName(t.id)})`);
const names = STRUCT_TYPES.map((t) => beastName(t.id));
ok(new Set(names).size === names.length, 'no two kin share a name');
ok(beastName(1) === 'SUN LION', 'the king is the Sun Lion');

const refusals: [string, string][] = [
  ['account sequence mismatch, expected 12, got 11', 'RETRY'],
  ['insufficient funds: 0ualpha is smaller than 5ualpha', 'LOW ALPHA'],
  ['struct 5-1 is destroyed but must be online', 'FALLEN'],
  ['planet 2-7 is empty, nothing to mine', 'DEN EMPTY'],
  ['Failed to fetch', 'NET DOWN'],
  ['the request timed out', 'TOO SLOW'],
  ['something nobody has seen before', 'NOPE'],
];
for (const [err, want] of refusals) ok(tag(err) === want, `"${err}" → ${want}`);
for (const [err] of refusals) ok(SIGN.test(tag(err)) && tag(err).split(' ').length <= 3, `"${tag(err)}" is a short sign`);
ok(speak('DIG · DEN 2-7') === 'DIG · DEN 2-7', 'deed labels pass through');
ok(speak('Error: out of range for ambit') === 'NO REACH', 'raw errors become signs');

ok(clanName('0-9', 'Orbital Hydro Guild') === 'ORBITAL HYDRO CLAN', 'guild becomes clan');
ok(!/GUILD|COVEN|CORP/.test(clanName('0-3', 'Night Corp')), 'old words never show');
ok(clanName('') === 'WILD', 'no clan is WILD');

ok(fmtSeconds(2) === '5S' && fmtSeconds(90) === '2M' && fmtSeconds(7200) === '2H', 'time words');
ok(pace(100) === 'QUICK' && pace(50000) === 'VERY SLOW', 'pace words');
ok(reachOf(0).length === 0 && REALMS.length === 4, 'zones');
// chief names: copies, staff look-alikes and slurs are refused; ordinary fur names pass
const taken = ['FANG2CLAW', 'MuseMane'];
for (const [n, want] of [
  ['fang2claw', 'NAME TAKEN'], ['FANG2_CL4W', 'NAME TAKEN'], ['musemane', 'NAME TAKEN'], ['MUSE-MANE', 'NAME TAKEN'],
  ['ADMIN', 'STAFF NAME'], ['FurrencySupport', 'STAFF NAME'], ['mod', 'STAFF NAME'], ['0fficial', 'STAFF NAME'],
  ['Shithead', 'NOT ALLOWED'], ['SH1THEAD', 'NOT ALLOWED'], ['f_u_c_k', 'NOT ALLOWED'],
  ['ab', '3+ LETTERS'], ['___', '3+ LETTERS'], ['Fox Tail', 'A-Z 0-9 _ - ONLY'], ['Füx', 'A-Z 0-9 _ - ONLY'],
  ['Peacock', ''], ['GrapeFox', ''], ['Spice', ''], ['Torpedo', ''], ['Analog', ''], ['Fukurou', ''], ['Modesty', ''], ['Scunthorpe', 'NOT ALLOWED'],
  ['MarrowTheBoneHoarder', ''], ['VexTail', ''], ['Dash_paw', ''],
] as [string, string][]) ok(nameProblem(n, taken) === want, `name "${n}" → ${want || 'ok'} (got ${nameProblem(n, taken) || 'ok'})`);

done('words');
