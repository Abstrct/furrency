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

## Round 3: the critics (personas in `qa/PERSONAS.md`)

Harsh by design: ten loud, opinionated personas, each aimed at one weak spot. Reports are in `reports/round3/`.

| Tester | Persona | Fun | Clarity | Beauty | Feel | Stability |
|---|---|---|---|---|---|---|
| vex | species purist | 4 | 5 | 5 | 3 | 3 |
| ruckus | PvP sweat | 7 | 4 | 8 | 6 | 6 |
| marrow | fursona hoarder | 4 | 4 | 7 | 3 | 3 |
| snoot | crypto skeptic | 4 | 3 | 7 | 4 | 6 |
| patches | keyboard only | 5 | 4 | 7 | 5 | 6 |
| gremlin | chaos goblin | 5 | 4 | 7 | 4 | 5 |
| tess | lore pedant | 5 | 3 | 7 | 5 | 4 |
| dash | phone, ten seconds | 4 | 3 | 7 | 2 | 3 |
| grizzle | Structs veteran | 5 | 4 | 7 | 4 | 5 |
| bitey | community mod | 6 | 4 | 8 | 3 | 2 |
| **avg** | | **4.9** | **3.8** | **7.0** | **3.9** | **4.3** |

**A caveat on Feel and Stability.** The host was overloaded through the whole round, with a load average of 70–117. Ten software-rendered browsers were hashing proofs of work, other sessions' builds were running, and three orphaned headless Chromes left by crashed probe runs each burned ~80% of a core. The lab browsers have since been fixed to reap themselves on exit. The "page freezes while howling" reports (gremlin, dash, vex, bitey, marrow) are re-measured alone below before anything is changed.

### Ranked fix list

| # | Issue | Who | Plan |
|---|---|---|---|
| 1 | **Page stalls while howls run** (reload hangs, taps take minutes) | gremlin, dash, vex, bitey, marrow, snoot, tess, patches | measure solo on a quiet host; keep hashing off the page's thread and yield to drawing |
| 2 | **The top-bar paw/chief button is dead**: no way to see or back up words, lock, forget, or sign out; JOIN does nothing with a paw but no chief | snoot, tess, grizzle, marrow | a PAW panel: who you are, back up words, lock, forget this browser, "devnet · no money", howl uses this computer (on/off) |
| 3 | **PROWL only toasts "SKY FULL"** and stays live; double-click lands on the sidebar | gremlin, grizzle, ruckus, dash | say why (another pack already holds that sky) on the button, disable it, keep the prey |
| 4 | **Losses are anonymous**: "A CHIEF FIGHT", "KING DOWN", no attacker, no way back | grizzle, dash, bitey | name the attacker in alarms and the LOST banner, with HUNT BACK |
| 5 | **Prowling takes the king and guard and leaves the den open**, with only a passing toast | ruckus, dash | confirm before prowl: DEN LEFT OPEN · SHARDS AT RISK |
| 6 | **Names**: exact copies of live chiefs (case-insensitive), reserved names (ADMIN, SUPPORT), profanity, a hint that doesn't match the rules, mid-word wraps | bitey, marrow, gremlin, dash | unique against the roster, a reserved and rude word block, an honest hint, no mid-word breaks |
| 7 | **STAR POLE call card closes and does nothing** | gremlin | find and fix; every enabled button acts or says why not |
| 8 | **Wrong glyphs**: PROWL wears POUNCE; in the path strip MOLE wears DIG and DIG wears SHARD; TOTEM missing from GLYPHS | tess | one glyph per thing |
| 9 | **Howl estimates swing** (5M → 4H → done) | snoot, grizzle | estimate from a steadied hash rate, never jump more than ×2 per update |
| 10 | **HUNT moves under the pointer**: the camera pans when the card opens, the list re-sorts live; idle times disagree list vs card, and active players show idle | gremlin, snoot, bitey, dash | keep the camera, freeze order while the pointer is over the list, one idle clock, howling counts as active |
| 11 | **Wings clipped by rectangles** (Void Owl, Shade Bat) | vex | check the sprite bounds with wings mid-flap and the portrait canvas |
| 12 | **Keyboard**: GLYPHS/KIN can't scroll by keys; clipped focus ring on pack cards; kin panel ignores Escape; canvas-only slots | patches, dash | focusable scroll areas, focus ring inside, Escape closes, slot buttons in the dock |
| 13 | **Species reads** (rhino, boar, badger, mink, owl), cat pupils on everyone, "AWOOO" across the lion | vex | keep the art (house style); move AWOOO off the face |
| 14 | **No new-player protection; logged-out PEEK lists rich idle dens** | bitey, dash | chain rules can't be changed here; teach it instead ("forge shards: alpha can't be snatched") and hide idle hours from logged-out visitors |

### Round 3 fixes

| # | Fix |
|---|---|
| 2 | **Dead top-bar paw button: a regression from the flicker work.** `stable()` patched the repainted box's own handlers away, and the paw button is the one box that owns a click. The repaint now owns only the box's children, and the smoke test presses the paw button on GLYPHS. The paw panel now also says KEY · THIS BROWSER and NET · DEVNET/TESTNET · NO MONEY, has HOWL · THIS COMPUTER · ON/OFF, and shows LOCK for passphrase paws. |
| 3 | PROWL buttons say SKY FULL before the press (hunt card and prowl screen), with WAIT. A second press while a prowl is under way is ignored. |
| 4 | No more "A CHIEF": losses name the attacker (by number when no name is known), the toast action is PAY BACK, the LOST banner names who, and watched fights read "MUSEMANE'S SUN LION" instead of THEIR → THEIR. |
| 5 | With shards at home, PROWL asks first: DEN LEFT OPEN · KING + PACK GO · N SHARD AT RISK · FORGE → SAFE (STAY is the default). |
| 6 | Names (`src/game/names.ts`, tested): copies of live chiefs (case, look-alikes and separators ignored), staff-like names and slurs/swears are refused, with no false hits on Peacock, Spice, Torpedo, Analog or Fukurou. The hint says `A-Z 0-9 _ -` and the button names the problem. |
| 7 | STAR POLE works: the call lands and its howl waits for the difficulty to fall. The lab clicked the centre of a card that was half under the dialog's edge, which closed the dialog. The lab now scrolls a control into view before clicking. |
| 8 | One glyph per thing: PROWL uses the prowl glyph (dock, PEEK, path strip). The path strip runs CHIEF · MOLE(call) · DIG(dig) · BADGER(call) · ALPHA · PROWL. TOTEM has its own carved-pole glyph, and TOTEM and HUNT are on GLYPHS. |
| 9 | Howl estimates are steadied: one reading a second, counting down in between, each reading moving at most ×2. |
| 10 | HUNT: opening or closing the card no longer moves the map (the camera shifts with the panel). A den tapped on the map stays under the finger. The list keeps its order while the pointer or focus is in it. Idle times use the chain's 2000-block average, and your own den and chiefs out prowling never read idle. |
| 11 | Wings fit: winged kin get a 1.6× canvas on KIN cards and draw smaller in tight spots. |
| 12 | Keyboard: scrolling pages (GLYPHS, KIN) take focus so Space, PageDown and the arrows scroll them. Rows in scrolling lists draw an inset focus ring. The den's kin panel has ✕ and closes on Escape. |
| 13 | AWOOO is drawn beside the den door, not across the king's face. Against a guard, the odds name who takes the damage (IRON RHINO −1). With no king, prowl points back to the den to call one. |
| — | Phone HUNT shows 3–4 prey rows (it showed 1.5; the legend hides on phone), and chief names size to their column on one line (no FANG2C/LAW). |
| — | QA hygiene: headless browsers are reaped when a script exits or crashes, after three orphans had burned CPU through the round. |

Not changed: new-player protection and the public "rich idle den" list come from the chain's rules and public data. Art kept as is: cat-slit cyber eyes and the shared bust are the house style, and no other tester mixed up species (every card and fight names the beast). vex's real art bugs (clipped wings, AWOOO over the king's face) are fixed.

### The "page freezes while howling" reports, measured alone

On a quiet host, the page's own thread answered in 1–6 ms throughout a call's howl, hashing included, so the howl never blocks the page. The freezes were painting:

- The lab's headless Chrome has no GPU, so it draws "accelerated" canvases through SwiftShader, a software GPU.
- There every drawing call costs dearly: frames ran 400–850 ms, howl or no howl.
- Screenshots wait for a frame, so at a load average near 100 they waited for minutes.

Real players reach the same path in Chrome on a blocklisted GPU, in a virtual machine or over remote desktop.

**Fix (`ctx2d` in `src/art/ink.ts`).** When the WebGL renderer is a software one (SwiftShader, llvmpipe), every 2D canvas is asked for as a CPU canvas (`willReadFrequently`).

| Setup | Title | Den | Hunt |
|---|---|---|---|
| Chrome, software GPU, before | 3 fps | 3 fps | 15 fps |
| Chrome, software GPU, after | 60 fps | 60 fps | 57 fps |

During a howl the worst frame went from 600–850 ms to 17 ms. Chrome with a real GPU and Firefox are unaffected (both report real GPUs).
