# Playtest report: snoot4 (Round 4 verification, the crypto skeptic, desktop 1280x800)

## 1. Who I am & what I tried
I'm the skeptic from the scam thread, back to check whether the team's fixes are real. I re-ran every round-3 repro. I tried I HAVE WORDS four ways: empty, nonsense, wordlist words with a bad checksum, and the public all-zero test vector with messy spacing and capitals. I tested the new chief-chip PAW panel (WORDS, PAW MARK, HOWL toggle, FORGET), then FORGET, then reload, then NEW PAW with the words-backup step, where I chose LATER first and KEPT second. After that I played the loop: name, roam, CALL Dig Mole, CALL Forge Badger, dig. I followed the HOWL estimate minute by minute, including about 17 minutes with HOWL switched OFF, and checked HUNT idle timers, PEEK, FEED at 0 alpha, GLYPHS and `#/paw`. That came to about 70 lab actions, blocks #614,026 to #621,996, roughly 28 minutes. Final state: 1 shard, 0 alpha, with a DIG and a FORGE that started by themselves.

## 2. Scores
- **Fun: 5/10.** First shard after about 22 minutes, and most of that was watching bars. Better than round 3, but the core loop is still "wait for your CPU".
- **Clarity: 5/10.** The PAW panel is a real step up: `KEY · THIS BROWSER`, `NET · DEVNET · NO MONEY`, `HOWL · THIS COMPUTER`. But the title, GLYPHS and the import box still say nothing about custody. HOWL OFF also doesn't say it's paused.
- **Beauty: 7/10.** Still handsome. Two visual problems: the stale "FIRST SHARD!" splash covering the PAW panel, and the HOWL panel still covering the HUNT target card.
- **Feel/responsiveness: 6/10.** Every button that was dead in round 3 now responds (JOIN, PEEK, FEED). Estimates move smoothly while HOWL is ON.
- **Stability: 7/10.** No NEW PAGE ERRORS. FORGET and HOWL OFF both survive a reload. Screenshots came back promptly this time.

## 3. Findings

### Round-3 verdicts

| # | Round-3 finding | Verdict | Evidence (round 4) |
|---|---|---|---|
| 1 | No way to view/back up words, lock, forget or sign out | **PARTLY** | The chief chip now opens a PAW panel with WORDS, PAW MARK, a HOWL toggle and FORGET (with a confirm step), and FORGET persists across reload. There is still no LOCK or password, and WORDS reveals the whole phrase with one click and no warning (`snoot4-008.png`, `snoot4-009.png`, `snoot4-011.png`). |
| 2 | Onboarding makes no custody/money disclosures | **PARTLY** | The new KEEP WORDS step says `24 WORDS · PAPER · SAFE` and `NEVER SHARE`, and the PAW panel says `DEVNET · NO MONEY`. But the I HAVE WORDS box still has no warning, the title still says "on the Structs network" with a green LIVE badge and no devnet note, GLYPHS still says `ALPHA · COIN · SAFE` and `PAW · YOUR KEY`, nothing says "lost words = lost chief", and CALL still signs with no confirm step (`snoot4-003.png`, `snoot4-019.png`, `snoot4-020.png`). |
| 3 | HOWL time estimates not credible | **PARTLY** | With HOWL ON the estimates are now smooth and honest: DIG went ~20M at 3%, then ~17M, ~16M, ~15M at 1-minute steps, and the CALL estimate (~1M) matched about 70 s of real time. But a reload with HOWL OFF moved the estimate from `~13M 32%` to `~18M 37%`, and the estimate keeps counting down while OFF (new finding A). |
| 4 | PoW auto-starts, defaults ON, no CPU mention | **PARTLY** | `HOWL · THIS COMPUTER` now appears in the PAW panel. But HOWL still defaults ON, and the first CALL just toasts `CALLING · HOWL ON`. DIG auto-started as soon as the mole arrived, and DIG plus FORGE auto-started again once the shard landed. The −/+ buttons are still labelled "Fewer paws"/"More paws" (`snoot4-026.png`, `snoot4-044.png`). |
| 5 | Top-bar JOIN dead with paw bound but no chief | **FIXED** | Closing the dialog, going to `#/glyphs` and clicking JOIN reopened the dialog at KEEP WORDS. |
| 6 | Every words failure says BAD WORDS; public phrase accepted silently | **STILL BROKEN** | Empty, 11 nonsense words and a bad checksum all show the same pink `BAD WORDS` chip, and BIND still jumps about 20 px (`snoot4-006.png`). The public all-zero vector was accepted with no warning and dropped me into round-3's shared chief "Snoot" (2 alpha), whose panel then claims `WORDS · KEPT` (`snoot4-008.png`). |
| 7 | HUNT idle timers contradict and run backwards | **PARTLY** | The list and the card now agree (FANG2CLAW `IDLE 21H` in both), and my own row no longer shows IDLE or ◆. But values still jump and reverse: FANG2CLAW went 21H at #615,289, then 23H at #617,008 (about 6 minutes later), then 22H at #621,202. RUCKUS went 11H, 12H, 11H, and INKMUZZLE 12H, 13H, 12H (`snoot4-029.png`, `snoot4-041.png`). Minute-scale values such as TESSLEXICON's track correctly. |
| 8 | FEED at 0 alpha dead; CUT 4% unexplained | **PARTLY** | FEED now toasts `NO ALPHA · FORGE FIRST` with a DEN shortcut (`snoot4-033.png`). `CUT 4%` is still unexplained (who takes it?), and DEVNET CLAN is still the only, pre-ticked choice ("BEST FIRST"). |
| 9 | WORDS stepper highlights wrong step; ✓ with no backup | **STILL BROKEN** | On the I HAVE WORDS path the title says WORDS while the yellow highlight stays on PAW (`snoot4-003.png`). On the new-paw path, clicking LATER (skip backup) still gives WORDS a green ✓ (`snoot4-014.png`). Credit: the new-paw KEEP WORDS step itself highlights correctly. |
| 10 | HOWL covers HUNT card; unknown routes; PEEK dead | **PARTLY** | PEEK is fixed and opens the target's den with its full kin list (`snoot4-030.png`). The HOWL panel still sits exactly on top of the selected-den card (`snoot4-029.png`), and `#/paw` still renders the title page with the bad hash left in the URL (`snoot4-034.png`). |

### New findings

**[MAJOR] A. HOWL OFF never says "paused"; the bar and ETA keep counting down as if work were happening**
- Where: the HOWL panel (top-bar meter), plus the den bubble over the Dig Mole.
- Steps: CALL DIG MOLE → let DIG auto-start → open the PAW panel and switch HOWL to OFF (or use OFF in the HOWL panel) → wait in 60 s steps for 17 minutes.
- Expected: the job row reads PAUSED or OFF, and the bar and ETA freeze.
- Actual: with HOWL OFF the DIG row kept moving: `~14M 27%`, `~11M 45%`, `~8M 57%`, `~5M 73%`, `~3M 85%`, `~1M 92%`. It then froze at `~1M 93%` for over 3 minutes until I switched it back ON. The top meter kept showing 1 active howl, and the den bubble kept its spinner and `DIG ~13M`. OFF was actually honoured (the dig only finished after ON), but for 17 minutes the screen told me my machine was working when it wasn't. The % is evidently a clock and not work done: a brand-new FORGE row appeared already at `61%` (`snoot4-044.png`). For a CPU-consent control, a progress bar that lies in either direction destroys trust.
- Screenshots: `snoot4-039.png` (OFF, 32%, ~13M), `snoot4-041.png` (OFF, frozen at 93%), `snoot4-043.png` (ON again, AWOO ~60S).

**[MAJOR] B. Binding existing words replays old history as brand-new rewards**
- Where: JOIN → I HAVE WORDS → BIND (with a phrase that already has a chief).
- Steps: BIND the public test phrase (or any returning player's phrase) and screenshot right away.
- Expected: a quiet `PAW · BACK` and the PAW panel.
- Actual: a full-screen `FIRST SHARD! NOW FORGE IT` splash fires, with toasts `FORGE! +ALPHA` and `DIG! +SHARD`, for a chief that already held 2 alpha and 2 shards from round 3. The splash covers the newly opened PAW panel, including the FORGET button. To a skeptic, "you just earned stuff!" the instant you paste a phrase is exactly the reward-bait pattern phishing sites use.
- Screenshot: `snoot4-007.png` (splash over the PAW panel), `snoot4-008.png` (the panel underneath).

**[MINOR] C. FORGET doesn't forget everything: the previous paw's deeds remain in this browser**
- Where: the DEEDS list (the deed log in the look) after FORGET → NEW PAW.
- Steps: bind words → FORGET → reload → JOIN → NEW PAW → finish join.
- Expected: a clean history for the new chief.
- Actual: the new chief "Snoot4" still lists `HOWL · DIG · 1 → success | HOWL · FORGE · 1 → success` from the forgotten paw, both before and after the new `ROAM · FIRST DEN`, through the end of the session. On a shared computer the next person inherits a trace of the last person's activity, and "FORGET" overpromises.
- Evidence: look text at #614,360 (immediately after FORGET) and at #614,652 (after the new join); `snoot4-012.png`, `snoot4-018.png`.

**[MINOR] D. Words handling after onboarding is too casual**
- Where: the PAW panel → WORDS; the KEEP WORDS step → COPY / KEPT / LATER.
- Steps: open the chief chip → WORDS. Separately, on NEW PAW, use COPY, tick KEPT, or click LATER.
- Expected: hold-to-reveal and a `NEVER SHARE` line on every screen that shows the phrase. COPY should warn that the clipboard is readable by other apps. KEPT should mean something, for example by re-entering two of the words.
- Actual: one click shows all words in the clear, with only a HIDE button and no warning (`snoot4-009.png`). COPY puts the full phrase on the clipboard with just a `COPIED` toast. KEPT is an honour-system checkbox whose accessible name is "on". LATER lets you skip entirely, and the panel's `WORDS · KEPT` status is shown even for an imported public phrase.

**[MINOR] E. The FORGET confirm doesn't say what is lost**
- Where: the PAW panel → FORGET.
- Steps: click FORGET.
- Expected: something like `NO WORDS = CHIEF GONE` on the confirm, ideally adapted to whether the words were kept, plus a "words not kept" warning when LATER was used.
- Actual: the dialog reads `FORGET PAW?` with the subtitle `NOPE`, which reads like an answer, not a warning, and offers NO / FORGET. It gives the same weight whether or not you ever saw your words.
- Screenshot: `snoot4-011.png`.

**[MINOR] F. The HOWL count and the "voices" disagree, and the pack claims a forge that isn't running**
- Where: the top-bar HOWL meter, the HOWL panel, and the den PACK list.
- Steps: press `+` ("More paws") in the HOWL panel with one job running.
- Expected: one number per meaning, or clearly different glyphs.
- Actual: the panel says `2 VOICES` while the top meter, with the same waveform glyph, says `1` (jobs). Meanwhile the PACK list showed `FORGE BADGER · TOTEM · FORGE` with 0 shards and no FORGE job in HOWL (`snoot4-036.png`). The screen claims work that isn't happening.

**[MINOR] G. Duplicate chief names on HUNT (impersonation surface)**
- Where: the `#/hunt` PREY list.
- Steps: open HUNT and read the list.
- Expected: unique names, or a visible disambiguator.
- Actual: two different dens are both named `FANG2CLAW` (◆19 and ◆3) with nothing to tell them apart (`snoot4-029.png`). Combined with a "words" box, look-alike names are a classic social-engineering setup ("I'm the real FANG2CLAW, send me your words").

**[POLISH] H. Title page while signed in: LIVE badge clipped, and no way to reach the PAW panel**
- Where: `#/` (and `#/paw`) with a chief bound.
- Steps: be signed in → `goto #/` (or `#/paw`).
- Expected: the full top bar or at least the chief chip, and an uncut LIVE badge.
- Actual: the LIVE badge is cut off at the right edge, leaving only "(•) " visible. There is no chief chip, so the PAW, WORDS and FORGET controls can't be reached from the title. The title also still never mentions devnet.
- Screenshot: `snoot4-034.png` (compare `snoot4-001.png`, where it is intact).

## 4. Delights
- The PAW panel is the honest page I asked for: `KEY · THIS BROWSER`, `NET · DEVNET · NO MONEY`, `HOWL · THIS COMPUTER` with a toggle, PAW MARK (address) behind a disclosure, and FORGET behind a confirm. Grudgingly: well done.
- NEW PAW now has a real KEEP WORDS step with `NEVER SHARE`, NEXT disabled until KEPT, and JOIN re-nagging at KEEP WORDS if you chose LATER.
- With HOWL ON the time estimates are smooth and believable (about 1 minute of estimate per minute of time), and a CALL's `~1M` was accurate.
- HOWL OFF is genuinely respected: the dig did not complete until I switched it back ON, and OFF survived a reload.
- All three dead controls from round 3 respond now: JOIN reopens the dialog, PEEK opens the den, and FEED at 0 alpha says `NO ALPHA · FORGE FIRST` with a DEN shortcut.

## 5. One change I'd make first
Make HOWL consent honest end to end. The first howl should ask `HOWL · THIS COMPUTER · OK?` instead of defaulting ON. DIG and FORGE should start on a tap, not by themselves. When OFF, every job row should read `PAUSED` with a frozen bar and no ETA. And "Fewer/More paws" should be renamed to "voices". The paw side is now mostly trustworthy; the CPU side is where the screen still says things it can't back up.
