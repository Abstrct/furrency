# Playtest report: echo (desktop, keyboard-first accessibility pass)

## 1. Who I am & what I tried

I'm an accessibility tester who plays keyboard-first. I used Tab, Enter, Space, Escape, arrows and digit keys, and clicked nothing. I went through the whole join flow (paw, keep words, chief name and clan, den found) and entered my den. I called a Dig Mole and then a Forge Badger with Enter only, searched HUNT for a chief and opened their card, and PEEKed their den. I opened the PROWL screen and toured GLOW, KIN and GLYPHS using the digit shortcuts. Throughout I checked focus visibility, dialog focus and Escape, control names, keyboard paths for things drawn on the canvas, and contrast.

## 2. Scores

- **Fun 6**: The loop is clear and calling kin with Enter feels snappy. I didn't reach a pounce or a snatch in this session.
- **Clarity 5**: Symbol-first is readable to sighted users. But the hint "TAP A KIN · TAP +" assumes a pointer, and the digit shortcuts are never shown anywhere.
- **Beauty 8**: Bold comic-ink look, great kin art and strong colour blocks. A few tiny or low-contrast labels let it down.
- **Feel/responsiveness 7**: Keyboard actions respond at once and the CALL dialog focuses the right card. Lost focus after dialogs and route changes breaks the flow.
- **Stability 9**: No page errors and every deed succeeded. Calls finished within about a minute.

## 3. Findings

1. **[MAJOR] Focus is not returned to the trigger when a dialog closes.** Where: the JOIN dialog on #/den, and the CALL dialog opened from CALL NEW KIN on #/den.
   - Steps: Tab to JOIN (or CALL NEW KIN), press Enter, press Escape, press Enter again.
   - Expected: focus goes back to the button that opened the dialog, so Enter reopens it.
   - Actual: Enter does nothing. The next Tab lands on the "Furrency" logo, and Enter then goes to `#/`, so focus fell back to the start of the document. A keyboard user loses their place after every dialog, and the same happens after a CALL completes.
   - Screenshots: `qa/playtests/shots/echo-015.png` (before), `echo-016.png` (dialog).

2. **[MAJOR] Focus escapes the JOIN dialog on its last step ("DEN FOUND!").** Where: the join dialog, final step.
   - Steps: finish JOINING, wait for "DEN FOUND!", press Tab several times.
   - Expected: focus moves to ENTER DEN (or Close), with a visible ring, and stays inside the dialog.
   - Actual: 3 to 7 Tabs show no focus ring anywhere in the dialog. Tab Tab Enter did not activate ENTER DEN. Focus seems to be on the dimmed page behind the modal, which is not inert. I had to Escape and use the home page's ENTER DEN instead. Earlier steps (NEW PAW, CHIEF) do keep focus inside the dialog.
   - Screenshots: `qa/playtests/shots/echo-020.png`, `echo-021.png`.

3. **[MAJOR] PROWL has no keyboard way to choose the attacker or target.** Where: #/prowl/<den>.
   - Steps: from HUNT, select ROOK, then PEEK, then PROWL. Try Tab, the arrow keys and digits.
   - Expected: the attacker and target can be chosen from a list or with arrow keys, like the PACK list on the den.
   - Actual: the only control is "PROWL 2 SHARD". The pairing (SUN LION > DIG MOLE) is picked automatically and can only be changed on the canvas. The look shows no CANVAS TARGETS on this screen, and the arrow keys do nothing.
   - Screenshot: `qa/playtests/shots/echo-030.png`.

4. **[MAJOR] Several screens leave focus with no visible indicator.** Where: the KEEP WORDS step of the join dialog, the KIN page after the "5" shortcut, and the den and kin cards.
   - Steps: open KEEP WORDS, or press 5 and then Tab.
   - Expected: every focused element shows the cyan ring.
   - Actual:
     - KEEP WORDS opens with no visible focus.
     - On #/kin a Tab shows nothing.
     - On the PACK kin cards (den and peek) the cyan ring is cut off by the scroll container, so only a thin bottom edge shows; the yellow "selected" fill looks the same as focus.
     - The HOWL meter button's ring is clipped inside the header meter strip.
   - Screenshots: `qa/playtests/shots/echo-017.png`, `echo-032.png`, `echo-033.png`, `echo-029.png`.

5. **[MINOR] Duplicate and odd control names.**
   - #/den with no chief has four controls named "JOIN" ([3], [10], [11], [12]), so a screen-reader list can't tell them apart.
   - On the KEEP WORDS step the checkbox appears in the list as "on <input checkbox>". "on" is the default checkbox value, which suggests the "KEPT" label isn't tied to the input.
   - "Sound" is a toggle, but its name doesn't show whether it is on or off (nothing like aria-pressed).
   - The nav still shows "DEN (on)" while you PEEK someone else's den.

6. **[MINOR] Symbols are read as text and health isn't exposed to assistive tech.**
   - On KIN, fur is plain "♥♥♥♥♥♥" text, and HUNT rows say "◆2", so a screen reader announces "black heart suit" six times.
   - The PACK cards on the den don't include fur or health in their names at all. A list item reads only "SUN LION ROOT · AWAKE".
   - Fix: give each a label such as "fur 6 of 6" or "2 shard".

7. **[MINOR] Low contrast and tiny text.**
   - The "DEN FOUND!" title is yellow on cream, about 1.3:1.
   - "GOOD NAME" is small green text on cream. "ROOT · AWAKE" and "TOTEM · CALLING" on the kin cards are about 9px coloured text.
   - The disabled reasons on CALL cards ("ONLY ONE", "LOW GLOW · 10K GLOW") are white on light pink.
   - The search placeholder "NAME" is gray on dark gray.
   - The quest strip's future steps (BADGER, ALPHA, PROWL) are dim gray on navy.
   - The zone labels STAR, SKY and ROOT on the canvas are tiny, and ROOT is partly hidden by the island.
   - The GLYPHS subtitles (for example "COIN · SAFE") are about 9px.
   - Screenshots: `qa/playtests/shots/echo-021.png`, `echo-019.png`, `echo-035.png`, `echo-005.png`.

8. **[MINOR] Route changes don't move focus.** Where: every nav and shortcut route change.
   - Steps: on home, Tab to GLYPHS and press Enter.
   - Expected: focus moves to the new page's heading or main area.
   - Actual: focus stays at its old place in the document. After a digit-shortcut navigation, the next Tab goes somewhere invisible. Using the nav links themselves works better, because focus stays on the nav item.

9. **[MINOR] Header meter strip overflows at 1280px.** Where: the top bar on desktop.
   - The PULSE label is cut off ("PULS").
   - The HOWL meter is hidden until you Tab to it. The strip then scrolls and hides the ALPHA meter instead.
   - So the HOWL status (for example "2.5M") is invisible on desktop by default.
   - Screenshots: `qa/playtests/shots/echo-031.png`, `echo-036.png`.

10. **[POLISH] Shortcuts and text input are undiscoverable or missing.**
    - The digit shortcuts (1 = DEN, 2 = HUNT, 4 = GLOW, 5 = KIN) work, and correctly don't fire while typing in search. Nothing on screen says they exist; the nav could show "1" to "6".
    - Enter in the chief NAME field doesn't submit; you have to Tab three times to reach JOIN · ROAM.
    - The search clear "×" isn't a focusable control, though Escape does clear the search.
    - The pointer-only hint "TAP A KIN · TAP +" could include a key hint.
    - Reduced motion: I couldn't toggle it through the lab. The home and GLOW screens have nonstop rays, popping "CHIEF!" and "ROAM!" bursts and floating coins, so `prefers-reduced-motion` should be checked.

## 4. Delights

- The CALL dialog puts focus straight on the recommended "FIRST" card (Forge Badger), so Enter is enough to call it. Disabled cards are skipped and say why.
- The PACK list on the den and on PEEK is a real keyboard path to kin that are drawn on the canvas. Enter on a card opens its detail panel with NAP, HUNT and the zone leap buttons.
- The HUNT search is solid: it has a real name ("Find a chief"), filters as you type, ignores the digit shortcuts while typing, Escape clears it, and a result opens with Enter.
- When the cyan focus ring appears, it is thick and easy to see on almost any background (JOIN, CALL MOLE, NEW PAW, the name field, Close).
- Escape closes every dialog I opened.

## 5. One change I'd make first

Build one shared modal focus manager and use it for every dialog. It should:

- move focus into the dialog on open and on every step change;
- trap focus inside, and make the page behind inert;
- return focus to the triggering control on close, cancel or completion.

This fixes findings 1, 2 and part of 4 in one place.
