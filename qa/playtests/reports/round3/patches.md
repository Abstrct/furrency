# patches · round 3 · the accessibility hardliner (desktop, keyboard only)

## 1. Who I am & what I tried

I play keyboard-only and count every place I get stranded. In about 62 lab actions, using only Tab, Shift+Tab, Enter, Space, Escape, arrows, PageDown/End and the number keys, I went from the title screen through JOIN (NEW PAW, KEEP WORDS, NAME · CLAN, DEN FOUND) into my den. I CALLed a Dig Mole from the banner, opened the kin panel, used the 1–6 shortcuts, searched and selected a den on HUNT, PEEKed gremlin's den, and read GLYPHS and KIN. I also opened and closed More and toggled Sound. On every step I checked focus visibility, focus traps, where focus lands after a dialog, what the look exposes as names and states, contrast, colour-only meaning and motion. I used one mouse scroll, only to prove that GLYPHS content is out of keyboard reach. From about 22:30 the lab's screenshots took 3+ minutes or never came back, so the second half of the session was checked through the look text more than by eye.

## 2. Scores

- **Fun 5/10.** The onboarding is fast and the 1–6 shortcuts are nice, but the actual game (slots, dens, pounce) is aimed at a pointer, and the keyboard path is a side door.
- **Clarity 4/10.** The instructions say "TAP KIN · TAP +" to a player who can't tap. Kin health is shown as hearts that a screen reader either skips or reads as "♥♥♥♥♥♥". State is often shown by colour alone.
- **Beauty 7/10.** The comic ink is great and the focus ring (cyan double outline) is good where it exists. Small grey sub-labels and yellow-on-cream headings let it down.
- **Feel/responsiveness 5/10.** Keys respond instantly and the dialogs feel solid. But the title screen never stops moving, there is no reduced-motion setting, and two pages can't be scrolled from the keyboard.
- **Stability 6/10.** The game itself never crashed or threw page errors on me. The lab's screenshot calls hung for 3–5 minutes from about 22:30, and plain looks timed out twice, roughly 22:45 and 22:57. That is probably shared-environment load, not the game, but it cost me half my visual checks.

## 3. Findings

1. **[MAJOR] GLYPHS and KIN pages can't be scrolled by keyboard: the GROW and FIGHT guides are unreachable**
   - **Where:** `#/glyphs` (also `#/kin`)
   - **Steps:**
     1. Press `6` to open GLYPHS.
     2. Press Space twice, then PageDown, ArrowDown and End.
   - **Expected:** The page scrolls, or the scroll area is focusable, so the 4th glyph row and the GROW/FIGHT how-to strips can be read.
   - **Actual:** Nothing moves. The 4th row (FUR, DEN, PACK…) stays cut off at the bottom edge. GROW and FIGHT only show up after a mouse-wheel scroll. GLYPHS has no focusable items at all, so Tab can't pull anything into view. In the look, GLYPHS lists no panel text, so a screen reader may get nothing there either. KIN on the same layout shows only the first row of cards. My PageDown + Space on KIN never returned a screenshot (lab hang), so its scroll result is unconfirmed.
   - **Screenshots:** `qa/playtests/shots/patches-038.png` (after keys) vs `qa/playtests/shots/patches-039.png` (after a single mouse scroll); KIN: `qa/playtests/shots/patches-044.png`

2. **[MAJOR] Focus ring invisible or clipped on the PACK kin cards in the den**
   - **Where:** `#/den`, PACK panel, SUN LION card (control "SUN LION ROOT · WAKE")
   - **Steps:**
     1. Enter the den from DEN FOUND.
     2. Press Tab (or Shift+Tab back from the + DIG MOLE banner button).
   - **Expected:** A visible ring on the focused card, like every other button.
   - **Actual:** No visible indicator at all. I only found out where focus was by pressing Enter, which selected the lion. After selection, the card's right edge and ring are cut off by the panel's overflow.
   - **Screenshots:** `qa/playtests/shots/patches-016.png`, `qa/playtests/shots/patches-020.png` (focus on card, invisible); `qa/playtests/shots/patches-022.png` (clipped right edge)

3. **[MAJOR] Constant, unstoppable motion with no reduced-motion setting**
   - **Where:** Title `#/`, the header ticker everywhere, the den canvas
   - **Steps:**
     1. Open `#/` and take several screenshots a second apart.
     2. Open JOIN.
     3. Open More and look for a setting.
   - **Expected:** Motion can be paused or reduced (WCAG 2.2.2 and 2.3.3). Pop-in bursts don't flash while a dialog is open.
   - **Actual:** The title never stops: comic bursts ("CHIEF!", "ROAM!", "HOWL!") pop over the lion, coins fall, rays rotate, and the beasts drift. The "LIVE · CHIEF · ROAM · HOWL" marquee scrolls endlessly across the header and jumps position between frames. All of it keeps animating behind the dimmed JOIN and KEEP WORDS dialogs. In the den, clouds drift and "CALL!"/"UP!" bursts pop. More holds only STRUCTS / DOCS / GLYPHS / TITLE, with no motion or effects toggle.
   - **Screenshots:** `qa/playtests/shots/patches-004.png`, `qa/playtests/shots/patches-005.png`, `qa/playtests/shots/patches-008.png`, `qa/playtests/shots/patches-012.png`, `qa/playtests/shots/patches-026.png`, `qa/playtests/shots/patches-047.png`

4. **[MAJOR] Kin health (FUR) is invisible to assistive tech, or read as raw heart symbols**
   - **Where:** `#/den` PACK cards, PEEK den cards, `#/kin` stat cards
   - **Steps:**
     1. In the den, read the look's controls for the pack cards.
     2. Press `5` and read the KIN panel text.
   - **Expected:** Something like "fur 6 of 6" in the card's accessible name or text.
   - **Actual:**
     - The den card's name is only "SUN LION ROOT · WAKE". The six pink hearts are not in it.
     - PEEK cards are the same ("COMET FOX STAR · WAKE").
     - On KIN the text reads "FUR ♥♥♥♥♥♥", which a screen reader announces as six "black heart suit"s.
     - In a fight, a blind player can't tell which kin is hurt.
   - **Screenshots:** `qa/playtests/shots/patches-034.png`, `qa/playtests/shots/patches-044.png`

5. **[MAJOR] Instructions and core actions assume a pointer: "TAP KIN · TAP +"; slot choice and dens are canvas-only**
   - **Where:** `#/den` hint box; PEEK "TAP KIN"; `#/hunt` map
   - **Steps:**
     1. Enter the den.
     2. Read the top-right hint.
     3. Try to put a new kin into a specific empty slot (STAR/SKY/ROOT/TIDE, TOTEM/PACK) with the keyboard.
   - **Expected:** Keyboard wording ("ENTER", "SELECT"), and every canvas target (the 8 empty slots, the 60 dens) reachable with arrow keys or a list.
   - **Actual:**
     - The hint only says TAP.
     - The empty slots (c0–c8) are canvas-only. The keyboard CALL dialog gives you no choice of slot, so placement is decided for you.
     - The HUNT list covers dens through the search box, but the map dots can't be focused.
     - The keyboard route exists only because the search box happens to sit there.
   - **Screenshots:** `qa/playtests/shots/patches-015.png`, `qa/playtests/shots/patches-024.png`, `qa/playtests/shots/patches-034.png`

6. **[MINOR] Focus is dropped when the CALL dialog closes, because its trigger button disappears**
   - **Where:** `#/den`, banner "5 SHARD IN GROUND · + DIG MOLE" → CALL dialog
   - **Steps:**
     1. Tab to "+ DIG MOLE" and press Enter.
     2. In the CALL dialog, press Enter on DIG MOLE.
     3. The dialog closes. Press Tab.
   - **Expected:** Focus goes to the new kin card or to the CALL button, and the call is announced.
   - **Actual:** The banner (the trigger) is removed, so focus falls back to the document. The next Tab lands on the bottom CALL button, past the new DIG MOLE card. The only feedback is a toast ("CALLING · HOWL ON") and a progress label drawn on the canvas, "CALLING 66% · ~25S". I couldn't tell whether the toast is a live region.
   - **Screenshots:** `qa/playtests/shots/patches-025.png`, `qa/playtests/shots/patches-026.png`

7. **[MINOR] The den kin detail panel ignores Escape and has no Close, unlike the HUNT den panel**
   - **Where:** `#/den`, the panel opened from a PACK card
   - **Steps:**
     1. Select SUN LION with Enter.
     2. Press Escape.
   - **Expected:** The panel closes and focus returns to the card. That is what HUNT does: its den panel has a Close button, and More closes on Escape and returns focus.
   - **Actual:** The panel stays open and the look shows no Close control. The page's Tab order then runs from the panel (NAP, HUNT, STAR…TIDE) back up to the banner's "+ DIG MOLE", so focus order doesn't follow the visual order.
   - **Screenshots:** `qa/playtests/shots/patches-022.png`, `qa/playtests/shots/patches-023.png`

8. **[MINOR] KEEP WORDS "KEPT" checkbox is announced as "on"; disabled NEXT looks almost the same as enabled**
   - **Where:** JOIN → NEW PAW → KEEP WORDS
   - **Steps:**
     1. Open KEEP WORDS.
     2. Read the look's controls.
     3. Compare NEXT before and after ticking KEPT.
   - **Expected:** The checkbox is named "KEPT". A disabled NEXT is clearly different, not just one shade.
   - **Actual:**
     - The look lists the checkbox as `on <input checkbox>`, which suggests the visible "KEPT" label isn't tied to the input.
     - Disabled NEXT is the same bright yellow block with mid-grey text, so it reads as clickable.
     - Same story for "NAME FIRST" on NAME · CLAN: grey on yellow.
     - The name field's accessible name is "Find a chief" on HUNT while it shows "NAME". The visible label doesn't match the spoken name (WCAG 2.5.3).
   - **Screenshots:** `qa/playtests/shots/patches-010.png`, `qa/playtests/shots/patches-012.png`, `qa/playtests/shots/patches-013.png`, `qa/playtests/shots/patches-031.png`

9. **[MINOR] Low-contrast text in several places**
   - **Where:** Title footer, DEN FOUND, KEEP WORDS, HUNT, GLYPHS
   - **Steps:** Open each screen and zoom the screenshot.
   - **Expected:** 4.5:1 for small text, 3:1 for large text.
   - **Actual:**
     - The "STRUCTS ↗ / DOCS ↗" footer is tiny grey on a translucent dark chip over purple.
     - The "DEN FOUND!" heading is yellow on cream, carried only by a thin black stroke.
     - The KEEP WORDS index numbers (1–24) are about 8 px light grey on white.
     - On HUNT, the search placeholder "NAME" is grey on dark grey, and the legend ("● SHARD ● NONE ♛ YOU z IDLE") and "63 DENS · 9 WITH SHARD" are about 9 px.
     - The GLYPHS subtitles ("COIN · SAFE", "OFF · SAVE GLOW") are about 8 px dark grey on saturated tiles.
   - **Screenshots:** `qa/playtests/shots/patches-002.png`, `qa/playtests/shots/patches-014.png`, `qa/playtests/shots/patches-010.png`, `qa/playtests/shots/patches-028.png`, `qa/playtests/shots/patches-036.png`

10. **[MINOR] Meaning carried by colour alone**
    - **Where:** Header SHARD meter; kin panel zones; HUNT map
    - **Steps:**
      1. Let the mole dig 1 shard and look at the header.
      2. Open SUN LION's panel and look at LEAP STAR/SKY/ROOT/TIDE.
      3. Look at the HUNT map dots.
    - **Expected:** An icon, text or shape alongside the colour.
    - **Actual:**
      - Once a shard exists, the SHARD meter turns pink/white diagonal stripes with no label for what the stripes mean (stealable? at risk?).
      - The current zone ROOT is marked only by a green fill. The look exposes "(on)", but sighted colour-blind players get nothing else.
      - Map dots are pink (shard) vs yellow (none) and are the same size and shape.
    - **Screenshots:** `qa/playtests/shots/patches-044.png`, `qa/playtests/shots/patches-021.png`, `qa/playtests/shots/patches-028.png`

**Also noticed (polish):**
- The "GROW" heading in the CALL dialog is half-covered by the DIG MOLE card. Shot: `qa/playtests/shots/patches-024.png`
- On HUNT, the den panel's × overlaps the "DEVNET CLAN" tag, and the name breaks mid-word as "GREM / LIN". Shot: `qa/playtests/shots/patches-032.png`
- The selected prey row turns yellow and its focus ring disappears into the fill.
- The 1–6 route shortcuts aren't documented anywhere I could find.

## 4. Delights

- The JOIN dialog is a proper modal. Focus starts on NEW PAW, Tab cycles NEW PAW → I HAVE WORDS → Close → NEW PAW without escaping, Escape closes it, and focus goes back to JOIN.
- The whole JOIN flow works from the keyboard: Space ticks KEPT, Enter in the name field submits, and focus moves to ENTER DEN on DEN FOUND. It took me under a minute without a mouse.
- The number keys 1–6 jump straight to DEN/HUNT/PROWL/GLOW/KIN/GLYPHS. After a jump, focus lands at the start of the main content, not back at the header.
- The cyan double-ring focus style is bold and readable on most buttons (JOIN, COPY, search field, CALL bar, the More menu).
- More moves focus into the menu, Escape closes it, and focus returns to More. The Sound button exposes its on/off state.

## 5. One change I'd make first

Make every canvas target and every scrolling page reachable from the keyboard:
- Put a focusable, arrow-key-navigable list behind the den slots and the HUNT map (the PACK panel and PREY list are halfway there).
- Make GLYPHS and KIN scrollable with Space and PageDown.
- Replace "TAP" with wording that works for any input.

Ship a reduced-motion setting in the same pass that stops the ticker, bursts and falling coins.
