# Playtest report: pip (phone, 390x844)

## 1. Who I am & what I tried
I'm pip. I only play on my phone, so I stayed on the 390x844 viewport the whole time. I went through join (new paw, words, name, clan), den, calling a Dig Mole, Forge Badger, Sun Lion and Boulder Boar, hunt, prowl, pouncing a king, snatching +2 shards, forging 1 alpha, feeding it on GLOW, and reading KIN and GLYPHS. I left phone view twice, both times on purpose: once to compare the hunt screen with desktop, and once to start a prowl, because on the phone that can't be done.

## 2. Scores
- **Fun: 7.** The pounce, WHAM, SNATCH loop is a real rush, even on a small screen.
- **Clarity: 4.** On phone the target card is missing on HUNT, the HOWL meter is hidden and the GLOW number is cut off, so I often couldn't tell what to do or what was happening.
- **Beauty: 8.** The comic ink art, colours and bursts look great at phone size. The prowl board is the exception: it's crowded.
- **Feel/responsiveness: 6.** Calls and pounces land quickly. The first FEED tap was ignored, and big bursts linger over the den.
- **Stability: 7.** Every deed succeeded and I saw no page errors. Layout breaks are the main problem.

## 3. Findings

1. **[BLOCKER] Can't prowl from HUNT on phone: the selected den's card (PEEK / PROWL) never shows**
   - Where: `#/hunt`, the PREY list and the den dots on the map.
   - Steps: on phone, open HUNT. Tap a den on the map (e.g. ROOK) or tap its row in the PREY list. Try Enter and Escape too.
   - Expected: a den card with shard, king, guards, "N KIN CAN HIT KING", PEEK and PROWL (desktop shows exactly this).
   - Actual: the row turns yellow and the map pin is selected, and that's all. No card, no PROWL button. `#/prowl` just says "PICK PREY / HUNT", which sends me back. The only way to prowl was to switch to desktop, press PROWL, then switch back.
   - Shots: phone `qa/playtests/shots/pip-025.png` and `pip-031.png`; desktop `pip-027.png`.

2. **[MAJOR] HOWL meter is hidden on phone; tapping where it should be opens the profile instead**
   - Where: top bar, every route.
   - Steps: start a call, dig or forge on phone. The look reports a "HOWL 1" / "HOWL 2.5M" control. Tap it.
   - Expected: a visible HOWL indicator showing progress.
   - Actual: no HOWL chip anywhere in the phone top bar. Tapping its position opens the PIPSQUEAK profile dialog, so it sits under the profile button. Forge and dig take minutes, and on phone the only sign of progress is a tiny ring on the kin.
   - Shots: `pip-011.png`, `pip-053.png`, `pip-055.png`.

3. **[MAJOR] Top bar and bottom nav are wider than the phone**
   - Where: global chrome.
   - Steps: open any screen on phone.
   - Expected: every meter and every tab fits on screen.
   - Actual:
     - The GLOW meter shows a single digit ("7", "6", "5") and the rest of 7,925 is cut off.
     - PULSE and HOWL are gone entirely.
     - The 6th nav tab reads "GLY…" and is cut off, even while it is the active tab.
     - The quest strip (CHIEF / MOLE / DIG / BADGER / ALPHA / PROWL) is cut at both edges.
     - On desktop the PULSE chip is also cut off ("FULL PU…").
   - Shots: `pip-009.png`, `pip-044.png`, `pip-027.png`.

4. **[MAJOR] PROWL battle board is crowded and overlapping on phone**
   - Where: `#/prowl/<den>`.
   - Steps: prowl to a den, then view it on phone.
   - Expected: my pack and their pack clearly separated by lane, with the controls not covering the board.
   - Actual:
     - The step pills (PICK / PROWL / KING / SNATCH) cover my chief name ("PIPSQU…").
     - The "POUNCE THEIR KING / HOME" and "GUARD KING" buttons sit on top of the STAR lane.
     - Enemy kin overlap each other and the ROOT and TIDE lane labels.
     - The matchup bar (BOULDER BOAR > SUN LION) covers an enemy kin.
     - The KING / SNATCH burst text runs past both screen edges.
   - Shots: `pip-050.png`, `pip-051.png`, `pip-052.png`.

5. **[MAJOR] I was pounced and snatched about 2 minutes after joining, with no warning**
   - Where: `#/den`.
   - Steps: join, call a Mole, dig the first shard, call a Badger.
   - Expected: some newcomer grace period, or at least a heads-up.
   - Actual: a big SNATCHED burst, a "NO KING · CALL" banner, and my one shard was gone. The one-tap king recall was good, though.
   - Shots: `pip-017.png`, `pip-018.png`.

6. **[MINOR] Profile dialog: the long name pushes the close (X) button off the edge**
   - Where: top-bar shield button, profile dialog.
   - Steps: tap the shield button on phone.
   - Expected: the X is visible next to the title.
   - Actual: "PIPSQUEAK" fills the header and the X is only a black sliver at the right edge. Tapping outside the dialog still closes it.
   - Shot: `pip-045.png`.

7. **[MINOR] CALL dialog is one very long column on phone, and its header scrolls away**
   - Where: CALL dialog.
   - Steps: open CALL and try to reach a pack kin (e.g. Boulder Boar).
   - Expected: compact cards, or tabs for GROW / GLOW / WARD / PACK, with the X always visible.
   - Actual: about 19 cards, each roughly 250px tall. The pack kin are thousands of pixels down. The CALL title, X and GLOW chip scroll out of view. The page-level scroll in the lab barely moved it, so I had to Tab through the cards.
   - Shots: `pip-016.png`, `pip-034.png`, `pip-035.png`.

8. **[MINOR] HUNT on phone: the PREY sheet covers more than half the map, and the list shows only about 1.5 rows**
   - Where: `#/hunt`.
   - Steps: open HUNT on phone.
   - Expected: a sheet that can be collapsed or dragged, a readable list, and tappable dens.
   - Actual:
     - The list window is about 100px tall.
     - The zoom −/+ buttons are about 36px, and oddly sit inside the PREY header.
     - Den dots on the map are about 18px, which is very small to tap.
     - The selected den's pin and label slide under the sheet.
   - Shots: `pip-022.png`, `pip-023.png`.

9. **[MINOR] First FEED tap in the feed dialog was ignored**
   - Where: `#/glow`, FEED dialog.
   - Steps: open FEED. The number field is auto-focused. Tap FEED.
   - Expected: it feeds on the first tap.
   - Actual: nothing happened. A second tap fed it (+960 GLOW). On a real phone this probably happens because the first tap only closes the keyboard.
   - Shots: `pip-056.png`, `pip-057.png`, `pip-058.png`.

10. **[POLISH] Small text and label glitches on phone**
    - Where: various.
    - Den:
      - The kin chip says "FORGE BADG…".
      - The bottom kin tray is a mostly empty white bar about 90px tall.
      - Lane labels (STAR / SKY / ROOT) are clipped at the left edge, and kin overlap them.
      - The SNATCHED burst stays over the den long after the event.
    - GLOW: "ALPHA 0 · READY TO FEED" appears when I have no alpha.
    - CALL: the dialog's GLOW chip shows a stale value (7,925 while the meter shows 7,310).
    - Prowl: POUNCE says "PULSE 5/5" right after spending pulse.
    - Join: the name field's placeholder ("VexTail") looks like a filled-in value, but NAME stays disabled.
    - Accessibility: the top-bar profile button has no label ("(button)").
    - Shots: `pip-018.png`, `pip-046.png`, `pip-005.png`, `pip-010.png`.

## 4. Delights
- The join flow fits the phone perfectly. The 4-step PAW / WORDS / CLAN / DEN tabs and the 24-word grid are clean, and DEN FOUND! with the lion portrait is a lovely payoff.
- WHAM! -2, then SNATCH! with "+2 SHARD!" and the shard meter turning striped (at risk) feel great on a small screen.
- AUTO in prowl did guard, pounce and snatch, and brought me home in one tap. That's ideal for thumbs.
- KIN and GLYPHS read well as single-column cards on phone, and the glyph grid ("one sign · one word") is easy to scan.
- "NO KING · CALL" recovery is one tap and quick.

## 5. One change I'd make first
On phone, open the den card (PEEK / PROWL) as a bottom sheet over the PREY list when a den is tapped. Right now that card doesn't exist on phone, which makes the core hunt → prowl → pounce loop impossible there. Then fix the top bar so GLOW, PULSE and HOWL fit at 390px.
