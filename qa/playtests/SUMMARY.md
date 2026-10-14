# Playtest round 1 — summary

Ten AI playtesters, each in their own browser and chief, on the private devnet at the same time (they raided each other). Full reports: `qa/playtests/reports/*.md`; screenshots: `qa/playtests/shots/`.

| Tester | Persona | Fun | Clarity | Beauty | Feel | Stability |
|---|---|---|---|---|---|---|
| nova | first-timer | 6 | 5 | 9 | 5 | 6 |
| rook | Structs veteran | 8 | 6 | 9 | 5 | 8 |
| fang | PvP raider | 8 | 5 | 9 | 6 | 6 |
| ledger | economy | 5 | 4 | 8 | 4 | 6 |
| pip | phone | 7 | 4 | 8 | 6 | 7 |
| echo | keyboard / a11y | 6 | 5 | 8 | 7 | 9 |
| glyph | language | 8 | 5 | 9 | 6 | 7 |
| chaos | edge cases | 7 | 5 | 9 | 4 | 7 |
| muse | art director | 6 | 6 | 7 | 5 | 5 |
| sage | returning player | 6 | 5 | 9 | 4 | 8 |
| **avg** | | **6.7** | **5.0** | **8.5** | **5.2** | **6.9** |

Every mechanic of Structs was reachable and behaved like the chain (rook). No duplicate deeds under click-spam (chaos), no lost state across reload / forget / restore (sage), the whole game is playable keyboard-only (echo). Feel scores are depressed by the lab machine itself (load average ~70 with ten browsers hashing).

## What most testers hit (fix first)

| # | Issue | Who | Plan |
|---|---|---|---|
| 1 | **Phone HUNT has no chief card → no PROWL on phone** (blocker) | pip | bottom-sheet card on phone |
| 2 | **Top bar overflows**: HOWL meter hidden at 1280, PULSE clipped; phone worse | nova, sage, echo, glyph, chaos, ledger, pip | compact meters, shed extras by width |
| 3 | **Being raided is silent**: king falls, shards vanish, no attacker, no alert outside the den | fang, ledger, glyph, chaos, pip, muse | global alerts (PROWLERS, KING DOWN, −N SHARD by NAME) + "while you were away" sign |
| 4 | **Howl is opaque**: dig shows "idle"/"QUICK", no ETA, first shard has no payoff | nova, ledger, glyph, rook | honest speed words from the real difficulty, ring + % + ETA, big DIG!/FORGE! payoff |
| 5 | **Words leak**: "DEVNET GUILD", raw ids and address in paw panel, "STRUCTS NET", "PROOF", "CHAIN"; two names for one thing (CALL MOLE vs DIG MOLE, NAP for idle and off) | glyph | rename/strip, one word per thing |
| 6 | **Times assume 6 s blocks** (NAP 34H after 1.5 h) | ledger, fang | use the measured block time |
| 7 | **Glow seems to leak** (it is the clan's shared link split across dens) | sage, ledger, rook | say SHARED and show the split |
| 8 | **Prowl goes stale** after a king falls / pack home; a POUNCE while defending can do nothing silently | fang, chaos | settle on chain state, always say why |
| 9 | Dialog focus (return to opener, DEN FOUND step), α renders like "u" in display type, DEN FOUND! unreadable | echo, muse, glyph | focus manager, α in UI type, ink title |
| 10 | **Kin look alike** (one bust, palette swaps, "glasses"); bursts cover the kin they announce | muse | distinct species parts, cyber eyes not visors, words above heads |
| 11 | Path ticks DIG without digging; spaces-only name accepted; pulse "cost" reads as a deduction | chaos, nova, fang | track real steps, reject blank names, "NEEDS N PULSE" |

## Lab fixes for round 2
- numbered clicks re-check the control's words before clicking (a stale look picked the wrong GUARD target for rook)
- key names `Shift+Tab`, `Space`
- each tester gets its own scratch folder (two testers shared a helper script)
- fewer hashing browsers at once, or longer timeouts, for screenshots under load

# Playtest round 2 — re-test of the round-1 fixes

Five targeted re-testers (reports: `qa/playtests/reports/round2/`). fang2 raided the other four during the round, so the victim-side alarms were tested for real.

| Tester | Fun | Clarity | Beauty | Feel | Stability |
|---|---|---|---|---|---|
| nova2 (first-timer loop) | 6 | 5 | 9 | 7 | 9 |
| pip2 (phone) | 8 | 6 | 8 | 8 | 8 |
| fang2 (raider) | 8 | 7 | 8 | 8 | 7 |
| glyph2 (language) | 7 | 6 | 8 | 6 | 7 |
| echo2 (keyboard) | 6 | 5 | 8 | 5 | 6 |
| **avg** (round 1 avg) | **7.0** (6.7) | **5.8** (5.0) | **8.2** (8.5) | **6.8** (5.2) | **7.4** (6.9) |

Confirmed fixed: phone HUNT → PROWL (the blocker), desktop top bar, sticky dialog headers, attacker-named alarms, POUNCE always explains a refusal, fight screen stays current, comic words above heads, the round-1 language leaks, dialog focus (in / trapped / returned), keyboard striker and prey pickers. fang2 won 9 raids in 22 minutes.

## Fixed after round 2
- **Loss log**: every loss at your den (king, kin, shards, prowlers — and kin that vanish with no blow heard) is kept with the attacker's name and shown as a den banner with SEEN and FIGHT until seen; alarms last 20–30 s; "YOUR KING FELL · NAME"; no more "−0 SHARD".
- **Howl**: progress by time (the ring always moves), ETA with a realistic hash-rate floor, the speed word comes from the live wait, one shared module for den and drawer; drawer says GATHER / AWOO / ~time, VOICES not PAWS, Escape closes it; the HOWL meter counts howls instead of showing hash rates.
- **Comic words**: ink-coloured words get a paper outline (the "black smear" on FORGE!/GLOW!).
- **Prowl layout**: the lanes are measured between the war bar and the strike panel on every screen size.
- **Keyboard**: controls that repaint keep stable keys so focus survives chain updates; focus moves to each new place; the meters strip is no longer a hidden tab stop.
- **CALL after losing your king** offers the SUN LION first.
- Hunt roster refreshes after a minute (stale shard counts); banners read "+ DIG MOLE" / "+ FORGE BADGER".

## Still open
- A big enemy pack is cramped on phone prowl; kin sprites overlap when the root lane is full on the den.
- The hunt map still reads as a field of dots (muse); species art can go further (muse).
- Lab: screenshots are slow when many testers hash at once; run fewer testers or raise timeouts.
