# vex: playtest report (Round 3, the critics)

## 1. Who I am & what I tried

I'm vex, an illustrator who judges every beast like a paid commission: anatomy, species read, line weight, palette, off-model frames, softness. On desktop at 1280x800 I went through the title screen twice and every card on the KIN page (14 pack kin and 9 totems), zooming each portrait 2–5x from the screenshots. Then I joined (NEW PAW → Inkmuzzle, DEVNET CLAN), called a Dig Mole and a Forge Badger, got my first dig (1 shard), PEEKed the den of FANG2CLAW (7 kin), and checked the den and title at phone size. About 45 lab actions in total. I could not check the share card `/og.png`: the lab's `goto` only changes the hash (`#/og.png` just shows the title screen), so that part is **untested**. In the end my tab hung (finding 1).

## 2. Scores

- **Fun 4/10**: 25 minutes got me one shard and zero alpha. Nearly all of it was watching dials (DIG ~17M, FORGE ~18M).
- **Clarity 5/10**: The UI is tidy and well labelled. On canvas, though, labels, banners and stickers sit on top of the beasts they describe.
- **Beauty 5/10**: The UI is great: sticker buttons, pill tags, a strong palette. The beasts are one bust template with ears swapped, and half of them don't read as their species.
- **Feel/responsiveness 3/10**: Once DIG and FORGE howls were both running, every screenshot took 2–5 minutes. Then the tab stopped answering completely.
- **Stability 3/10**: After a phone/desktop switch the tab hung for good, and a reload did not bring it back.

## 3. Findings

1. **[MAJOR] Tab stops responding while DIG and FORGE howls run together; reload does not recover**
   - **Where:** #/den, then a viewport switch and `goto #/kin`.
   - **Steps:**
     1. JOIN → NEW PAW → name → JOIN · ROAM → ENTER DEN.
     2. `+ DIG MOLE`, pick the card, wait for the call. Tap DIG MOLE (the dig starts, ~17M).
     3. CALL NEW KIN → FORGE BADGER.
     4. Wait until the first shard lands. FORGE now runs alongside the next DIG (`HOWL 2`).
     5. `{"viewport":"phone"}`, then `{"goto":"#/kin","shot":true}`.
   - **Expected:** the page stays responsive. The howl should yield to the UI.
   - **Actual:**
     - Before the switch, every `shot` already took 110–210 s. Text-only looks were still instant.
     - After the switch, every look returns `not ready: eval: no answer in 90000ms` at `0x0`.
     - `{"reload":true}` also took 147 s and still returned `not ready`. The tab never came back.
     - `/status` answered in 30 ms the whole time, so the lab server itself was fine. The other testers' pages kept answering, though more slowly. gremlin's action count has also been stuck at 108 for this whole stretch.
   - **Caveat:** all testers share one headless Chrome, so this needs a solo repro to rule out load on the lab.
   - **Screenshot:** last good frame `qa/playtests/shots/vex-039.png`.

2. **[MAJOR] Void Owl and Shade Bat wings are cut off by a hard rectangle**
   - **Where:** #/kin, PACK cards (also visible on the title screen).
   - **Steps:** open KIN and look at the VOID OWL card (row 1, column 4), then scroll 500 px to the SHADE BAT card.
   - **Expected:** the full wingspan, or wings that fit inside the portrait frame.
   - **Actual:** both wings end in perfectly vertical cuts about 15% in from each side of the portrait. It looks like the sprite's own bounding box, not the card frame. A commissioned piece with cropped wings goes back to the artist.
   - **Screenshots:** `qa/playtests/shots/vex-003.png` and `vex-004.png`; zooms `qa/playtests/scratch/vex/z4.png` (owl) and `z5.png` (bat).

3. **[MAJOR] Five species don't read as their species**
   - **Where:** #/kin cards, den canvas, and the title screen.
   - **Steps:** open KIN, scroll, and zoom each portrait.
   - **Expected:** each beast has the one feature that makes its species obvious.
   - **Actual:**
     - **IRON RHINO** has pointed cat ears with pink insides. Its horn starts between the eyes and runs up the forehead instead of rising from the snout tip. It reads as a cat with a unicorn horn. Zooms `z7.png` (KIN) and `z21.png` (FANG2CLAW's den).
     - **BOULDER BOAR** has no tusks and has floppy dog ears. It reads as a pig. Zoom `z6.png`.
     - **FORGE BADGER** has no black-and-white face stripes, which are the whole point of a badger, and has round mouse ears. It reads as a rat in a cauldron. Zooms `z10.png` and `z22.png`.
     - **DEEP MINK** has round bear ears plus two large bat-wing fins behind its head. It reads as a bat-rat. Zoom `z9.png`.
     - **VOID OWL** has membrane bat wings instead of feathers, and cat ears instead of tufts. Zoom `z4.png`.
   - **Screenshots:** `qa/playtests/shots/vex-004.png`, `vex-005.png`, `vex-006.png`, `vex-007.png`.

4. **[MAJOR] The hero lion on the title screen goes off-model and its face gets covered**
   - **Where:** #/ (title), desktop and phone.
   - **Steps:** load #/ and take two or three screenshots a few seconds apart, then zoom the lion's face.
   - **Expected:** the title art is the portfolio piece: clean face, nothing over the eyes.
   - **Actual:**
     - In one frame the lion's left brow becomes a long horizontal bar that runs from inside the mane through the ear, and the right brow is missing (`vex-040.png`, zoom `z29.png`). The normal frame has two short angled brows (`vex-002.png`).
     - The ROAM!, POUNCE! and HOWL! stickers land on the face, crown and chest.
     - Spinning α coins pass over the left eye (`vex-002.png` zoom `z1.png`; phone `vex-029.png` zoom `z25.png`). Seen edge-on, a coin reads as a scratch across the chest.
     - The CALL dialog repeats the problem in the den: its CALL! burst covers the calling kin's status chip (`vex-018.png`).

5. **[MINOR] Every species is the same bust**
   - **Where:** #/kin, the den, and the pack thumbnails.
   - **Steps:** open KIN and compare all 14 PACK portraits side by side.
   - **Expected:** distinct silhouettes and species-correct eyes.
   - **Actual:**
     - All 14 beasts share the same trapezoid plinth, glowing collar bar, jagged cheek tufts and angry vertical-slit **cat** pupils. That includes the bear, hare, boar, owl, walrus and otter.
     - Every beast also has the same coloured squiggle with a dot on the right cheek, which reads as a crack or a tear. Lion: cyan. Bear: lavender. Owl: gold.
     - Strip the colours and you can't tell bear, otter and ferret apart.
   - **Screenshots:** `vex-003.png` to `vex-005.png`; zooms `z3.png`, `z5.png`, `z8.png`.

6. **[MINOR] The Sun Lion says "AWOOO"**
   - **Where:** #/den, SUN LION.
   - **Steps:** in your den, tap the Sun Lion (`{"tap":"c6"}`, or click its PACK row).
   - **Expected:** a roar ("RAWR"/"ROAR"), placed beside the head.
   - **Actual:** "AWOOO", a wolf's howl, is lettered right across the lion's muzzle, and lavender howl rings cut through its face. It happened in 2 of 2 tries.
   - **Screenshots:** `qa/playtests/shots/vex-032.png` and `vex-034.png`; zoom `z26.png`.

7. **[MINOR] In someone else's den, banners and buttons cover their kin**
   - **Where:** #/den/1-17 (PEEK of FANG2CLAW).
   - **Steps:** HUNT → FANG2CLAW → PEEK.
   - **Expected:** every kin you can PROWL against is visible and labelled.
   - **Actual:**
     - The `19 SHARD · SNATCH` banner covers the STAR BEAR's whole face, and half of the visiting prowler lion.
     - The FANG WALRUS in TIDE is cut off at the waterline. Its name label is almost invisible against the water, and the PROWL button sits just below it.
     - Related: in my own den the king's spot shifts every time a kin is called. The lion's centre went from x≈670 (`vex-016.png`) to x≈735 (`vex-019.png`) and back to x≈670 (`vex-026.png`).
   - **Screenshot:** `qa/playtests/shots/vex-025.png`; zooms `z19.png` and `z20.png`.

8. **[MINOR] The "calling" ghost has solid paws**
   - **Where:** #/den while a Dig Mole is being called.
   - **Steps:** `+ DIG MOLE` → pick the card, then screenshot within about 10 s.
   - **Expected:** the whole mole drawn as the translucent ghost.
   - **Actual:** the body is a cyan ghost, but the pink paws, claws and dirt mound are drawn fully opaque. It's one frame mixing two render states.
   - **Screenshot:** `qa/playtests/shots/vex-018.png`; zoom `z14.png`.

9. **[MINOR] PACK thumbnails are unreadable, the lion's crown is missing, and the selected row loses its border**
   - **Where:** #/den, PACK panel.
   - **Steps:** call a Dig Mole and a Forge Badger, then click any PACK row.
   - **Expected:** a readable icon for each kin, and a selected row that stays inside the panel.
   - **Actual:**
     - At about 25 px the outline takes up most of each icon, so all three are dark blobs. The lion's thumbnail also has no crown, though it has one on the card and in the den.
     - The selected (yellow) row shifts right and its right border is clipped.
     - "SUN / LION" and "ROOT · / WAKE" wrap onto two lines even though there is room.
     - Same family of clipping elsewhere:
       - The `DEVNET CLAN` pill on the HUNT prey card loses its right border (`vex-024.png`, zoom `z17.png`).
       - The VERIFY6060 label on the hunt map is hidden under the DEVNET CLAN label (`z18.png`).
   - **Screenshots:** `qa/playtests/shots/vex-020.png` and `vex-037.png`; zooms `z16.png` and `z28.png`.

10. **[POLISH] Totems have stray lines and inconsistent line weight; the KIN icon is a cat**
    - **Where:** #/kin (TOTEMS), the CALL dialog, and the side nav.
    - **Steps:** scroll KIN to STONE BURROW, open CALL NEW KIN, and look at the side nav.
    - **Expected:** one line weight across the cast, shapes that stay inside their silhouette, and a nav icon drawn from the roster.
    - **Actual:**
      - STONE BURROW's brick lines stick out past the dome's outline on both sides, and it reads as an igloo, not a burrow (`vex-008.png`, zoom `z11.png`).
      - SUN TREE and STONE BURROW use a much thinner outline than the beasts (`vex-022.png`).
      - The KIN nav icon is a generic cat face, and there is no cat in the game (`z27.png`).
      - Smaller nit: the WALRUS and STONE BURROW card headers wrap their role pill under the name, while every other card keeps it beside the name (`vex-005.png`, `vex-008.png`).

All screenshots are in `/Users/abstract/Projects/furrency/qa/playtests/shots/`. All zooms are in `/Users/abstract/Projects/furrency/qa/playtests/scratch/vex/`.

## 4. Delights

- The UI chrome is commission-grade: thick black keylines, offset drop-shadows, tilted sticker buttons. The pill and colour system (STAR, SKY, ROOT, TIDE) is consistent everywhere I looked.
- The Sun Lion card portrait on KIN is the strongest piece: a clean silhouette and a confident crown.
- The Dig Mole's hard hat, headlamp cone and pink digging paws give a clear species read, plus character.
- STORM HARE, TIDE OTTER and FANG WALRUS read correctly at a glance. The walrus tusks are a good choice.
- The title composition (starburst, halftone dots, kin orbiting the king) has real energy when nothing is covering the face.

## 5. One change I'd make first

Do a model-sheet pass on the cast:
- give each species its signature feature: rhino horn on the snout, boar tusks, badger stripes, feathered owl wings, small round mink ears;
- give each the right eye shape;
- remove the cheek squiggle;
- stop clipping wing sprites to their own bounding box;
- keep stickers, coins and banners out of a protected "face box" on every beast.
