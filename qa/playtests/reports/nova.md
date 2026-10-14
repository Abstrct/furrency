# Playtest report: nova

## 1. Who I am & what I tried

I'm **nova**, and I came in as a complete beginner: I've never played a strategy game or used crypto. I only did what the screen invited me to do, and the only help I read was the in-game GLYPHS page. My goal was to get from the title screen to a den that digs shards, and then to work out what to do next. Run was on desktop (1280x800), about 22 lab actions over roughly 38 minutes of wall time. The machine was badly overloaded (load average about 76), so the wall time is inflated.

Timeline:
- Title to den: 7 clicks, about 7 minutes.
- First Dig Mole called at about 9 minutes, awake about 3 minutes later.
- First shard landed at about 33 minutes. The dig HOWL sat "idle" for roughly 12 minutes before it started hashing.
- I then called a Forge Badger, and FORGE started on its own.

## 2. Scores

- **Fun: 6.** Watching kin pop in with "CALL!" and "UP!" is charming. But my first 30 minutes were mostly waiting, with no sense of progress.
- **Clarity: 5.** The quest strip (CHIEF > MOLE > DIG > BADGER > ALPHA > PROWL) and the one-button banners ("CALL MOLE", "CALL BADGER") are excellent. However, PULSE, GLOW, HOWL, GRASS, TOTEM and STEADY are never explained where they appear, and nothing tells me how long a dig takes or whether it's even happening.
- **Beauty: 9.** The comic-ink style is gorgeous. The title screen, the den dome and the GLYPHS page all look great.
- **Feel/responsiveness: 5.** Clicks register instantly and the deeds succeed. But a dig spends long stretches in a silent "idle" state, and the costs and meters jump in ways I couldn't follow.
- **Stability: 6.** There were no page errors and every deed succeeded. Under load, though, the lab often took 2+ minutes to answer a 20-second wait. A plain look timed out once at 100 seconds, and one tap timed out at 110 seconds.

## 3. Findings

1. **[MAJOR] Dig gives no sign of progress or time while its HOWL is "idle"**
   - Where: `#/den`, Dig Mole after it wakes up.
   - Steps: Call the Mole and wait until it is AWAKE. The quest strip highlights DIG.
   - Expected: something like "DIGGING · ~10 min" or a progress ring, so I know it's working and roughly how long to wait.
   - Actual: the only cue is a tiny ring-with-waveform icon above the Mole. The Mole card shows "HOWL QUICK", which contradicts the minutes-long dig. Internally the howl reported `DIG 0/32 idle`, counting down to about 9 before hashing began, all with no on-screen meaning.
   - I spent about 12 minutes unsure whether I was supposed to press something to make it dig. The card offers only NAP and RELEASE, and both sound scary.
   - Screenshots: `qa/playtests/shots/nova-014.png`, `nova-015.png`, `nova-016.png`

2. **[MAJOR] HOWL meter/control is cut off the top bar on desktop**
   - Where: top bar at 1280x800, on every route.
   - Steps: Enter the den and look at the header.
   - Expected: a HOWL meter next to ALPHA, SHARD, GLOW and PULSE (the lab lists a `HOWL 1` / `HOWL 2.7M` control).
   - Actual: no HOWL is visible, and the PULSE label is clipped to "PULS". The one indicator of background work is invisible to the player.
   - Screenshots: `qa/playtests/shots/nova-014.png`, cropped as `scratchpad/top.png`

3. **[MAJOR] First shard arrives without a celebration I could notice**
   - Where: `#/den` and `#/glyphs`.
   - Steps: While the dig was hashing I opened GLYPHS. The SHARD meter quietly changed to a striped "1".
   - Expected: a clear payoff for the first shard, such as a burst, a toast, or a fly-to-meter.
   - Actual: the striped meter is the only change. The striping, which I think means "at risk", is never explained.
   - Screenshot: `qa/playtests/shots/nova-017.png`

4. **[MINOR] The onboarding name field looks filled in, but its button is disabled**
   - Where: JOIN dialog, CLAN step.
   - Steps: Reach the CHIEF step.
   - Expected: either a real default name or an obviously empty field.
   - Actual: the placeholder "VexTail" looks like a real value, but the button reads "NAME" and is disabled. The disabled button is still bright yellow, with only its text greyed. Meanwhile the status already called me "Warden", a third name.
   - Once a name is valid, the button turns into "JOIN · ROAM". "ROAM" means nothing to a newcomer at this point.
   - Screenshots: `qa/playtests/shots/nova-005.png`, `nova-006.png`

5. **[MINOR] Costs on call cards don't match what the meters actually do**
   - Where: CALL dialog and the GLOW/PULSE meters.
   - Steps: Note GLOW, then call the Forge Badger (card says 500 GLOW, 8 PULSE).
   - Expected: GLOW drops by 500.
   - Actual: GLOW went from 5,825 to 4,925, a drop of 900. Calling the Mole dropped it by about 1,115.
   - Right after a call the PULSE meter showed "49" in the screenshot while the data said 4. I couldn't tell whether that's a count or a percent.
   - Screenshot: `qa/playtests/shots/nova-021.png`

6. **[MINOR] The persistent hint panel "TAP A KIN · TAP +" is the only guidance, and it never changes**
   - Where: `#/den`, top right.
   - Expected: the hint follows the current quest step, e.g. "WAIT · MOLE DIGS".
   - Actual: the same text shows from start to finish. Tapping the Mole opens a card with no dig action, so the hint leads nowhere for the DIG step.
   - Screenshot: `qa/playtests/shots/nova-014.png`

7. **[MINOR] Den canvas crowding hides labels and zones**
   - Where: `#/den` canvas.
   - Steps: Have the Mole and the Badger both in totem slots.
   - Expected: each kin sits clearly on its slot and keeps its name label.
   - Actual: the Badger overlaps the Mole, the "ROOT" zone label is covered by the Mole, and the DIG MOLE / SUN LION name labels disappear on some frames.
   - The "UP!" burst lingers for more than a minute (darkened) after a kin wakes.
   - Screenshots: `qa/playtests/shots/nova-012.png`, `nova-022.png`

8. **[MINOR] Jargon on the very first den screen**
   - Where: `#/den` on first entry.
   - The new player sees all of these at once: GLOW 7,925, PULSE FULL, GRASS / CLAN / LIVE dots, the STAR / SKY / ROOT / TIDE zone labels, TOTEM vs PACK slots, and "STEADY" with mountain and wave icons on the call cards.
   - GLYPHS explains most of them, but nothing on the den points to GLYPHS.
   - "GRASS" is not in GLYPHS at all. "HOWL · WORK · PROOF" is still crypto jargon for someone like me.
   - Screenshot: `qa/playtests/shots/nova-008.png`

9. **[POLISH] The 24 recovery words are gated only by a "KEPT" checkbox**
   - Where: JOIN dialog, WORDS step.
   - Context: a non-crypto player won't understand that losing these means losing everything. "PAPER · SAFE · NEVER SHARE" is terse.
   - The disabled NEXT button looks enabled (yellow).
   - Screenshot: `qa/playtests/shots/nova-004.png`

10. **[POLISH] The first CALL dialog is mostly empty**
    - Where: CALL dialog opened from the "CALL MOLE" banner.
    - Actual: a single card sits inside a full-width modal with about 70% empty space.
    - Screenshot: `qa/playtests/shots/nova-009.png`

## 4. Delights

- **Title screen.** It looks stunning, and JOIN is unmistakably the thing to press. Getting from title to den in 7 clicks, with a stepper (PAW > WORDS > CLAN > DEN) that ticks green, felt great.
- **Quest strip and context banner.** "5 SHARD IN GROUND · CALL MOLE" and then "1 SHARD · AT RISK · CALL BADGER" were the moments I knew exactly what to do. They give urgency in four words.
- **GLYPHS page.** The GROW path (CALL MOLE > DIG > SHARD > CALL BADGER > FORGE > ALPHA!) made the whole economy click for me in one glance.
- **Disabled-reason tags on call cards.** "ONLY ONE" and "LOW GLOW · 10K GLOW" are perfectly clear.
- **Comic bursts.** "CALL!" and "UP!" make each step feel like an event.

## 5. One change I'd make first

Make DIG (and FORGE) visibly in progress, in the den banner and on the kin card. A "DIGGING" state with a progress ring and a rough time, replacing "idle"/"QUICK", would remove most of my confusion. That is where I sat lost for about 12 minutes. Pair it with a big payoff burst when the first shard lands.
