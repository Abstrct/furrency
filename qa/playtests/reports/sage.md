# Playtest report: sage

## 1. Who I am & what I tried

I'm a careful returning player, and not losing progress matters most to me. I joined with a new paw, ticked KEPT on the 24 words and saved them (devnet throwaway), named my chief SageKeeper (chief 1-9, den 2-7, DEVNET GUILD), called a Dig Mole and let it dig. Then I tested persistence:
- 3 reloads, two of them with a HOWL partway through
- going from #/hunt back to #/den
- the paw panel and WORDS reveal
- FORGET
- restoring with I HAVE WORDS, first with a misspelled word and then with the correct words in mixed case and with extra spaces

Restore brought back the same paw address, chief 1-9 and den 2-7. A dig that was in progress kept going through forget, restore and reload, and finished (shards went from 1 to 2).

The machine was very loaded during the session (load average about 67). Many actions took 1–2.5 minutes, and one reload timed out ("not ready … 90000ms").

## 2. Scores

- **Fun 6**: Every dig ends with a DIG! burst, which feels good. I mostly watched a mole work, though.
- **Clarity 5**: The paw panel is excellent. The HOWL numbers (0/37 idle → 7/8 hashing, "2.5M" vs "6.3M") are unreadable, and the game never says what happened while I was away.
- **Beauty 9**: The comic-ink den, the dome, the badges and the KEEP WORDS sheet all look great.
- **Feel/responsiveness 4**: Mostly the overloaded host. Even so, the HOWL meter is hidden on desktop, so nothing shows the browser is working hard.
- **Stability 8**: I lost no state. Paw, chief, den, kin, shards, deeds and the in-progress howl all survived reload, a route change and forget + restore.

## 3. Findings

1. **[MAJOR] Nothing tells you what happened while you were away**
   - Where: #/den after a reload or after I HAVE WORDS
   - Steps: Start a dig. Reload, or FORGET and restore. Wait for the dig to land.
   - Expected: A short "AWAY" summary, e.g. "+1 SHARD · DIG ✓ · 0 RAIDED", or at least a toast when I come back.
   - Actual: The only sign is the "PAW · BACK" toast. Shards went from 1 to 2 silently, apart from the in-canvas DIG! burst if you happen to be watching. A returning player can't tell whether they were raided, whether a dig landed, or whether glow changed. (Glow spare also fell from 10,592 to 5,425 while I spent only 500 on the mole. It seems to be shared with the clan, but nothing says so, and it reads like my own glow is leaking.)
   - Screenshots: shots/sage-031.png, shots/sage-033.png

2. **[MAJOR] No deeds history you can see**
   - Where: all routes
   - Steps: Do a call and two digs, then look for a history.
   - Expected: A deeds or log list in the UI, reachable from the HOWL meter or the paw panel.
   - Actual: The lab readout has a full DEEDS list (ROAM, CALL, HOWL·CALL, HOWL·DIG ×2, all success). Nothing on screen shows it. Clicking the HOWL control ([1]) does nothing visible. #/kin is a bestiary, not a log.
   - Screenshot: shots/sage-023.png

3. **[MAJOR] HOWL meter missing from the desktop top bar, and the PULSE label is clipped**
   - Where: top bar at 1280×800
   - Steps: Look at the top bar while a dig is hashing.
   - Expected: The HOWL meter shows on screen while the browser is doing heavy work.
   - Actual: The bar reads "FULL PU…" and is cut off. The HOWL control is in the DOM but not visible. During a multi-minute dig the only progress sign is a tiny ring over the mole.
   - Screenshots: shots/sage-013.png, shots/sage-033.png

4. **[MINOR] HOWL progress numbers jump around and mean nothing to a player**
   - Where: HOWL meter and readout
   - Steps:
     1. Start a dig and note "HOWL · DIG 0/37 idle". It counts down to 0/11, then switches to "6/8 hashing 2.7M".
     2. Reload at 7/8 (2.5M). It comes back at 6/8 (6.3M), then returns to 7/8 (2.5M).
   - Expected: One progress bar or ETA that only moves forward and survives a reload.
   - Actual: Several unlabeled numbers. After the reload the count went backwards, which makes me think I lost work, even though the dig did finish.

5. **[MINOR] The FORGET confirm doesn't mention work in progress or let me re-check my words**
   - Where: paw panel → FORGET → "FORGET PAW? / WORDS ONLY WAY BACK"
   - Expected: Show a live howl (e.g. "DIG HOWLING") and offer SHOW WORDS on the confirm itself.
   - Actual: The confirm is clear and scary, which is good. But it doesn't say a dig howl is running. Here it resumed after restore, but the player has no way to know it will.
   - Screenshot: shots/sage-026.png

6. **[MINOR] "BAD WORDS" doesn't say which word is wrong**
   - Where: JOIN → I HAVE WORDS → BIND
   - Steps: Enter the 24 words with "panic" misspelled as "panik".
   - Expected: Highlight word 24, or report "WORD 24?".
   - Actual: The generic message "BAD WORDS". With 24 words, a player has to recheck all of them. (Mixed case and extra spaces were accepted, which is good.)
   - Screenshot: shots/sage-029.png

7. **[MINOR] "BIND" is an odd label for restoring a paw**
   - Where: I HAVE WORDS dialog
   - Expected: COME BACK or RESTORE, to match the "I HAVE WORDS · COME BACK" entry tile.
   - Actual: "BIND". This sounds like it might link the words to something new instead of bringing my paw back.

8. **[MINOR] Deed history from the old paw is still there after FORGET**
   - Where: after FORGET, with paw empty
   - Actual: The page still has the old paw's deeds (all 4 listed in the lab readout while "paw empty"). On a shared computer, "forget" should clear the trail too.
   - Screenshot: shots/sage-027.png

9. **[POLISH] The chief name changes three times during join**
   - Where: JOIN flow
   - Actual: The status shows chief "Warden" as soon as the paw is made. The NAME field then shows "VexTail". Clicking near the NAME label rerolled it to "Junofang". The random name should stay the same until I change it.

10. **[POLISH] Click-by-index on FORGET in the paw panel didn't work**
    - Where: paw panel FORGET button
    - Steps: Click it by number or by text, twice.
    - Actual: Nothing happened. A direct tap at the button's coordinates opened the confirm. This may be a lab quirk, or the button may only respond to pointer events, which would break keyboard and assistive tech.
    - Screenshot: shots/sage-025.png

## 4. Delights

- The KEEP WORDS sheet: a numbered 4×6 grid, "NEVER SHARE", COPY, and a KEPT box that must be ticked before NEXT unlocks. It's clear and it's serious.
- The paw panel (top-right name chip): clan, WORDS KEPT, chief id, den id and full paw address in one place, with WORDS and FORGET.
- Restore just works. Same paw, same chief 1-9, same den 2-7. It accepted messy input, showed a "PAW · BACK" toast, and the in-progress dig resumed and landed.
- Reloads and route changes never lost kin, shards, deeds or the howl.
- The DIG! comic burst and the "2 SHARD · AT RISK · CALL BADGER" banner make it clear what to do next.

## 5. One change I'd make first

Add a "WHILE AWAY" card that appears on load or restore. It should list deeds that landed, shards gained or stolen, and the glow change (marked as clan glow), and open the full deeds history, which should also be reachable from a visible HOWL meter in the desktop top bar.
