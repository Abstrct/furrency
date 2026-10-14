# Playtest report — echo2 (round 2, desktop 1280x800)

## 1. Who I am & what I tried
I'm a keyboard-first accessibility tester. I used only Tab, Shift+Tab, Enter, Space and Escape, plus `goto` in place of typing a URL. I never clicked or tapped. Chief: **Echo2whisk** (DEVNET CLAN).
Path: landing → JOIN (paw, words, chief, den) → den CALL MOLE (Dig Mole) → GLOW page / FEED → HUNT (search, prey row, hunt card) → PEEK → PROWL THIS DEN → got pounced and lost my Sun Lion → NO KING CALL → CALL Comet Fox → HUNT Fang2claw → PROWL → strike panel kin buttons → POUNCE (hit landed: "Your Sun Lion → their Dig Mole −2 · 4/6").
I re-tested the round 1 fixes: dialog focus-in, Tab trap, focus return, ENTER DEN focus, strike-panel kin buttons, title outline.

**Fixed (verified):**
- JOIN dialog: focus moves inside on open, to NEW PAW (shot echo2-003).
- JOIN dialog: Tab and Shift+Tab are trapped and wrap: Close ↔ NEW PAW ↔ I HAVE WORDS (echo2-004, -005).
- JOIN dialog: Escape returns focus to JOIN (echo2-008).
- Every JOIN step lands focus on its first useful control: COPY, KEPT (Space ticks it), name field, JOIN · ROAM.
- The last JOIN step focuses **ENTER DEN** (echo2-015).
- CALL dialog: focus moves to the first enabled card (echo2-023). When every card is disabled, focus falls back to Close (echo2-077). Escape returns focus to CALL NEW KIN (echo2-078). After a successful call the next Tab lands on CALL NEW KIN, which is sensible.
- Strike panel: "Your kin: … Next" and "Their kin: … Next" are real buttons that keyboard can reach and press.
- POUNCE can be reached with the keyboard and works (echo2-101, -103).
- Dialog titles (JOIN, KEEP WORDS, CHIEF, DEN FOUND!, CALL) are readable with the ink outline.

**Not verified:** I never reached a FEED dialog. I had 0 alpha, and keyboard focus kept getting lost on /glow before I reached FEED. I never saw a GUARD dialog.

## 2. Scores
- **Fun 6:** Prowl → strike panel → POUNCE → BLOWS log is a good loop. Getting my king pounced while I was busy tabbing around stung, which is fair.
- **Clarity 5:** The symbols are fine. "NO KING" on every CALL card with no king option, and "POUNCE THEIR KING" while their king is never offered as a target, left me guessing.
- **Beauty 8:** Comic ink style, the strike lanes and the CALL card art all look great. The outlined titles fixed the contrast problem.
- **Feel/responsiveness 5:** For a keyboard user the live re-renders keep dropping focus, so every action costs several extra Tabs.
- **Stability 6:** No page errors and every deed succeeded. Focus behaviour is not deterministic.

## 3. Findings

1. **[MAJOR] Live re-renders drop keyboard focus, so "each press steps to the next" only works once**
   - Where: #/prowl strike panel ("Their kin: X. Next", "Your kin: X. Next"), POUNCE, #/hunt hunt card PROWL.
   - Steps: on #/prowl/1-17, focus "Their kin: DIG MOLE. Next" and press Enter, then press Enter or Space again.
   - Expected: each press steps to the next kin, and focus stays on the button.
   - Actual: the first press steps (DIG MOLE → FORGE BADGER). Then no element shows a focus ring and further presses do nothing. The label stays FORGE BADGER after Enter and after Space. You have to Tab back in every time, and where focus lands varies (sometimes "Your kin", sometimes HOME / GLYPHS nav). After POUNCE, focus is also lost. On the hunt card, the PROWL ring vanished when the card re-rendered (the prey's KING changed HOME → DOWN), and Enter/Space did nothing.
   - Shots: echo2-096, -099, -103, -064 → -068.

2. **[MAJOR] Invisible tab stops and vanishing focus ring**
   - Where: global top bar and #/glow.
   - Steps: open #/glow, reload, press Tab 13 times.
   - Expected: each Tab shows a visible focus ring on the next control.
   - Actual: Tab 1 rings the logo. Tabs 2–13 show no ring anywhere, and End does nothing either.
   - On #/den and #/hunt, about 3–4 Tabs between the logo and the nav rail are swallowed by stops with no visible indicator. For example, 13 Tabs from the top landed on GLYPHS (control 9 in the lab's list), and 10 Tabs on /glow got only as far as ECHO2WHISK.
   - Likely suspects: the meter chips (ALPHA, SHARD, GLOW, PULSE) as unstyled focusables, or a re-render resetting focus.
   - Shots: grid of echo2-036 … -048 (scratch: qa/playtests/scratch/echo2/grid1.png), echo2-050 to -052, echo2-054.

3. **[MAJOR] No focus management on route change, and no skip link**
   - Where: all routes (ENTER DEN, goto, PEEK → PROWL THIS DEN, hunt PROWL).
   - Expected: on a new route, focus goes to the main heading or first action, or a "skip to main" link exists.
   - Actual: focus stays on whatever nav item had it, or drops to the body. The same Shift+Tab count from the same page landed on different controls on different tries: five presses gave HUNT PREY once and GLOW POWER another time, and six gave ROAM.
   - On #/den, reaching the CALL MOLE banner takes about 14 Tabs through the top bar and nav every time.
   - Shots: echo2-017, -018, -071, -076, -083.

4. **[MAJOR] The CALL dialog dead-ends when your king is down**
   - Where: #/den → CALL NEW KIN, after being pounced.
   - Steps: lose your Sun Lion (another chief pounced me within about 10 minutes of joining), then open CALL.
   - Expected: a Sun Lion / king option, or a clear pointer to how to get one.
   - Actual: every card is disabled with the tag "NO KING" and there's no king card, so the keyboard user lands on Close. The only way back is the small "NO KING · CALL" banner button, which calls a Sun Lion directly. That button works well, but nothing in the dialog points to it.
   - Also, the den shows no message beyond a passing toast that my king fell.
   - Shot: echo2-077, banner in echo2-080.

5. **[MINOR] Strike-panel cycling never offers their king, and "Your kin: Next" silently changes the target**
   - Where: #/prowl/1-17 (Fang2claw).
   - Expected: with "POUNCE THEIR KING" as the goal, their Sun Lion is a selectable target, or the panel says why it isn't (probably because it's guarded).
   - Actual: their side cycles DIG MOLE → FORGE BADGER → STAR BEAR → GUST FERRET → IRON RHINO → FANG WALRUS and never reaches their SUN LION. Pressing "Your kin: Next" also resets "Their kin", for example to STAR BEAR. That isn't obvious when you can't see the canvas.
   - Shot: echo2-100.

6. **[MINOR] Pack card in the PACK panel has no visible focus ring**
   - Where: #/den, the PACK panel's SUN LION card.
   - Steps: Tab past GLYPHS, or Shift+Tab back from CALL MOLE.
   - Expected: a focus ring like the other controls have.
   - Actual: the card is a tab stop, but nothing on screen changes when it has focus.
   - Shots: echo2-020, -022.

7. **[MINOR] Focused CALL cards cover the section headings**
   - Where: CALL dialog.
   - Expected: the "GROW" / "PACK" headings stay readable above the focused card.
   - Actual: when a card in the first row of a section has focus, the scroll position and ring clip the heading. STAR TOTEM also stayed highlighted yellow even though focus was on STAR BEAR, so it looked like a second selection.
   - Shots: echo2-023, -086.

8. **[MINOR] Enter does nothing in text fields**
   - Where: the JOIN chief-name field, and the #/hunt "Find a chief" search.
   - Expected: Enter in the valid name field triggers JOIN · ROAM. Enter in search with matching results selects the first match.
   - Actual: nothing happens in either field. You have to Tab 3–4 more times.

9. **[POLISH] Focus-ring contrast and text overflow**
   - Focus ring contrast:
     - The cyan ring on POUNCE is faint where it sits on the cyan half of the arena (crop: scratch/echo2/c101.png).
     - The ring on the yellow "SUN LION ⇄" strike button is barely visible (echo2-099).
   - Text overflow and wrapping:
     - The hunt card breaks the name mid-word: "NOVAP / AW" (echo2-061).
     - On /glow the chip "SHARE SPLITS · MORE DENS · LESS E…" overflows its box (echo2-026).
   - In the JOIN clan card, an empty checkbox sits next to a ✓ for the same selected state (echo2-013).

10. **[POLISH] Toasts with actions might not be keyboard-reachable (untested)**
    - Where: the "PROWLERS! · AT YOUR DEN [DEN]" and "POUNCED · A CHIEF [FIGHT]" toasts.
    - What I saw: both appeared while I was on /glow (grid1). They have buttons, but they never showed up in my Tab sequence, and focus wasn't offered to them.
    - Needs a check: are these buttons keyboard-reachable, and are the toasts announced (live region)?

## 4. Delights
- The JOIN flow is now fully keyboard-able from start to finish: focus-in on every step, a working trap, Escape back to JOIN, and ENTER DEN pre-focused. It's a big improvement on round 1.
- The CALL dialog's focus handling is solid: first enabled card, Close as a fallback, and return to the opener.
- Strike-panel kin buttons plus HIT / DMG / FELL chips and the BLOWS log mean the fight is understandable without the canvas.
- The "NO KING · CALL" banner one-press recovery works.
- The outlined dialog titles read well on cream.

## 5. One change I'd make first
Keep focus stable across live re-renders. Give interactive elements stable keys/ids (or restore `document.activeElement` by id after each chain-tick render). That way the strike panel's Next buttons, POUNCE, the hunt card and the top bar keep focus. Then remove or style the invisible tab stops in the top bar.
