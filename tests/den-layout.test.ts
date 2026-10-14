/* The den's zones: however many kin, totems and open rings share a zone, on a desktop or a phone, no
 * two footprints overlap, nothing leaves the zone, and the king stands up front, biggest. */
import { KING, RING, ZONE_ORDER, denFrame, halfWidth, height, placeZone, zoneOf, type Spot } from '../src/scenes/den-layout';
import { ok, done } from './check';

const king: Spot = { king: true, totem: false, free: false, type: 1 };
const [mole, badger, glow, pole]: Spot[] = [14, 15, 20, 16].map((type) => ({ king: false, totem: true, free: false, type }));
const [boar, owl, bat, hog]: Spot[] = [8, 4, 6, 10].map((type) => ({ king: false, totem: false, free: false, type }));
const ringT: Spot = { king: false, totem: true, free: true };
const ringP: Spot = { king: false, totem: false, free: true };
const scale = (p: Spot) => (p.free ? RING : p.king ? KING : 1);

const mixes: [string, Spot[]][] = [
  ['the bug: king + mole, badger, glow stone + rings', [mole, badger, glow, king, ringT, ringP]],
  ['3 kin', [king, mole, badger, ringT, ringP]],
  ['4 kin', [mole, badger, glow, king]],
  ['6 kin', [mole, badger, glow, pole, king, boar, ringP]],
  ['6 kin + rings', [mole, badger, glow, king, boar, hog, ringT, ringP]],
  ['winged sky pack', [owl, bat, boar, owl, king, ringP]],
  ['full zone', [mole, badger, glow, pole, king, boar, hog, owl, bat]],
  ['one ring', [ringP]],
];
// the den's canvas at 1280×800 (beside the nav rail, under the top bar) and at 390×844, with the den screen's insets
const DESK = { w: 1188, h: 736, inset: { l: 300, r: 372, b: 110 } }, PHONE = { w: 390, h: 714, inset: { l: 0, r: 0, b: 120 } };
const views: [string, typeof DESK][] = [['desktop', DESK], ['phone', PHONE]];

for (const [vn, { w, h, inset }] of views) {
  const frame = denFrame(w, h, inset);
  for (const z of ZONE_ORDER) {
    const zone = zoneOf(frame, z);
    for (const [mn, spots] of mixes) {
      const at = placeZone(spots, zone);
      const box = spots.map((p, i) => {
        const s = at[i].s * scale(p), hw = halfWidth(p) / scale(p) * s, ht = height(p) / scale(p) * s;
        return { x0: at[i].x - hw, x1: at[i].x + hw, y0: at[i].y - ht, y1: at[i].y };
      });
      const what = `${vn} ${z} · ${mn}`;
      let clash = '';
      for (let i = 0; i < box.length; i++) for (let j = i + 1; j < box.length; j++) {
        const a = box[i], b = box[j];
        if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) clash = `${i}×${j}`;
      }
      ok(!clash, `${what}: no overlap${clash ? ` (${clash})` : ''}`);
      ok(box.every((b) => b.x0 >= zone.cx - zone.avail / 2 - 0.5 && b.x1 <= zone.cx + zone.avail / 2 + 0.5), `${what}: inside the den's width`);
      ok(Math.min(...box.map((b) => b.y0)) >= zone.y - zone.band, `${what}: below the zone above`);
      const k = spots.findIndex((p) => p.king);
      if (k >= 0) {
        ok(at[k].row === 0, `${what}: the king stands up front`);
        ok(spots.every((p, i) => i === k || at[i].s * scale(p) < at[k].s * KING), `${what}: the king is the biggest`);
      }
    }
  }
}

// the reported case keeps the kin a good size on both screens: no shrinking to fit when there is room
{
  const desk = placeZone([mole, badger, glow, king, ringT, ringP], zoneOf(denFrame(DESK.w, DESK.h, DESK.inset), 'root'));
  const phone = placeZone([mole, badger, glow, king, ringT, ringP], zoneOf(denFrame(PHONE.w, PHONE.h, PHONE.inset), 'root'));
  ok(desk[0].s >= 54, `desktop root kin stay big (${desk[0].s.toFixed(0)}px)`);
  ok(phone[0].s >= 40, `phone root kin stay readable (${phone[0].s.toFixed(0)}px)`);
}
done('den-layout');
