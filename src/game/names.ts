/* Chief names: the rules a name must pass before it goes on the chain for everyone to see. */

/* Names other players will see beside every raid. Refused: a copy of a chief already out there (case,
 * look-alike letters and separators ignored, so FANG2CLAW, fang2claw and FANG2_CL4W are one name),
 * names that pass for staff, and slurs or swears. */
export const skeleton = (n: string) => n.toLowerCase().replace(/[_-]/g, '')
  .replace(/0/g, 'o').replace(/[1!|i]/g, 'l').replace(/3/g, 'e').replace(/4|@/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/(.)\1+/g, '$1');
const STAFF = ['admin', 'moderator', 'support', 'official', 'furrency', 'structs', 'staff', 'security', 'helpdesk', 'system', 'devteam'];
const STAFF_EXACT = ['mod', 'mods', 'gm', 'dev', 'owner', 'help', 'team'];
// stems, matched inside the skeleton (so they also catch spaced, doubled and look-alike spellings)
// (no short stems that live inside ordinary words: peacock, grape, spice, torpedo, analog, document)
const RUDE = ['fuck', 'shit', 'cunt', 'bitch', 'dick', 'pussy', 'nigg', 'faggot', 'rapist', 'nazi', 'hitler', 'whore', 'slut', 'retard', 'killyour', 'tranny', 'kike', 'wetback', 'pedophil', 'porn', 'penis', 'vagina', 'twat', 'wank', 'jizz', 'asshole', 'bastard'];
export function nameProblem(n: string, taken: Iterable<string> = []) {
  if (!n) return 'empty';
  if (/[^A-Za-z0-9_-]/.test(n)) return 'A-Z 0-9 _ - ONLY';
  if ((n.match(/[A-Za-z0-9]/g) || []).length < 3) return '3+ LETTERS';
  const k = skeleton(n);
  if (RUDE.some((w) => k.includes(skeleton(w)))) return 'NOT ALLOWED';
  if (STAFF.some((w) => k.includes(skeleton(w))) || STAFF_EXACT.includes(k)) return 'STAFF NAME';
  for (const t of taken) if (t && skeleton(t) === k) return 'NAME TAKEN';
  return '';
}
