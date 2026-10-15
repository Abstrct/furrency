# Playtest report: gremlin (round 3, the critics)

## 1. Who I am & what I tried
gremlin, the chaos goblin, on desktop with phone flips. I fired concurrent double and triple clicks at every commit button (NEW PAW, KEPT, NEXT, JOIN · ROAM, ENTER DEN, + DIG MOLE, the call cards, PROWL, prey rows). I reloaded mid-onboarding and mid-howl, hammered Escape inside dialogs, spammed number keys 1–6 and zoom, switched between six places while a howl ran, and flipped desktop↔phone mid-call. I ended with a den of 5 kin (lion, mole, badger, comet fox, void owl), 0 alpha and a dig still in progress. That was about 105 lab actions; the spam loops make the count high.

## 2. Scores
- **Fun: 5** The den is charming and calls land fast. Nothing paid off within ~25 minutes, though: the dig sat at "idle" for most of the session, and I got no alpha and no fight.
- **Clarity: 4** Some controls do nothing and say nothing (STAR POLE). PROWL only answers with a "SKY FULL" toast. The idle and howl numbers contradict each other from one look to the next.
- **Beauty: 7** The comic-ink den, call cards and dialogs look great. It loses points for clipped kin on phone, the quest strip running under the hint box, and names split mid-word.
- **Feel/responsiveness: 4** The hunt map re-centres every time a card opens or closes, so what you tapped jumps away. The prey list re-sorts under the cursor. Kin fly across the screen after a resize.
- **Stability: 5** Double-click handling is solid. But a reload with a howl running froze the page for 48 s and then for over 120 s, and one call was silently lost.

## 3. Findings

**[MAJOR] Reload during an active howl freezes the page for 48 s to over 2 min, and the lab's look endpoint stops answering too**
- Where: `#/den`, browser reload while any HOWL is running
- Steps:
  1. Join, call a Dig Mole and a Forge Badger, and wait until the look shows `HOWL: HOWL · DIG … | HOWL · CALL · …` (two howls).
  2. Open CALL NEW KIN and click any card (for example STAR POLE, or tap an empty STAR slot and pick VOID OWL).
  3. Immediately send `{"reload":true}`.
- Expected: the page reloads in about 1–2 s and resumes the howls.
- Actual:
  - **1st run:** the reload had not returned after 120 s, and a parallel `GET /look` with a 30 s timeout returned nothing. The page responded again only after about 2.5 min.
  - **2nd run** (DIG `6/9 hashing` plus a VOID OWL call): the reload took **47.6 s**.
  - Reloads with no howl running, during onboarding and on the title screen, were fast.
  - The main thread looks blocked by the hashing work while the page unloads. A real player would see a dead tab and probably close it.
- Screenshot: `qa/playtests/shots/gremlin-021.png` (after the first run), `qa/playtests/shots/gremlin-027.png` (after the second run)

**[MAJOR] STAR POLE in the CALL dialog is a silent no-op**
- Where: `#/den` → CALL NEW KIN → `[6] STAR POLE WARD + 200 GLOW PULSE 8+`. The card is enabled.
- Steps: with 402 glow and pulse FULL, open CALL NEW KIN and click STAR POLE (done twice, once followed by a reload and once on its own).
- Expected: either a Star Pole call (a deed and a howl), or the card shown disabled with a reason (for example no free slot), or a toast.
- Actual: the dialog closes. No deed, no howl, no toast, and glow stays at 401.923. The kin list is unchanged. A player who clicks again gets the same nothing.
- Screenshot: `qa/playtests/shots/gremlin-022.png`

**[MAJOR] Hunt map re-centres whenever a prey card opens or closes, so the den you aimed at jumps about 200 px**
- Where: `#/hunt` canvas plus the right-hand prey card
- Steps:
  1. On `#/hunt`, click the FANG2CLAW row. The map pans and the clan sun ends up at about x=615 (shot 017).
  2. Click the JORDANJ row. The map pans again, to about x=730 (shot 018).
  3. Tap the MUSEMANE den on the canvas at (740,277).
- Expected: the camera stays put, or pans only when the target is off-screen. Tapping a den opens its card, the same as clicking its row.
- Actual:
  - The tap closes the JORDANJ card and does not open a MUSEMANE card.
  - The whole map slides right to about x=928 (shot 019), so the den that was under the cursor is now about 200 px away.
  - Tapping MUSEMANE by name selects it on the map (dashed ring), but still no card opens and the list row is not highlighted.
  - Every open or close moves the map, so you are always chasing a moving target.
- Screenshot: `qa/playtests/shots/gremlin-017.png`, `gremlin-018.png`, `gremlin-019.png`

**[MAJOR] The prey list re-sorts live under the cursor, and rapid row clicks leave nothing selected**
- Where: `#/hunt` PREY list
- Steps:
  1. Note that row 3 is JORDANJ ◆9.
  2. Wait a few minutes while other testers snatch shards.
  3. Click rows 2–5 in quick succession.
- Expected: rows stay put while the pointer is over the list, or the last click wins and opens its card.
- Actual:
  - Row 3 is now DASHPAW ◆9 and JORDANJ is gone. RUCKUS and VERIFY6060 moved up.
  - After the burst of clicks no card is open and no row is selected; only a hover tint remains on VERIFY6060.
  - A player who aims at a row can open, or prowl, a different chief than intended.
- Screenshot: `qa/playtests/shots/gremlin-028.png`

**[MAJOR] Double-clicking PROWL on a prey card drops the prey: the 2nd click lands on the sidebar PROWL and shows "PICK PREY"**
- Where: `#/hunt` prey card → PROWL
- Steps:
  1. Select FANG2CLAW (◆19, "1 KIN CAN HIT KING").
  2. Double-click the card's PROWL.
- Expected: one prowl toward FANG2CLAW, or one clear refusal that stays on the card.
- Actual:
  - The 1st click only shows the toast `SKY FULL` (no word about whose sky or what to do) and the card stays put.
  - The 2nd click hits sidebar PROWL, which opens `#/prowl` with `PICK PREY · HUNT` and the target forgotten.
  - A single click on PROWL, for both FANG2CLAW and JORDANJ, always just toasts SKY FULL. I never got a prowl started.
- Screenshot: `qa/playtests/shots/gremlin-016.png`, `gremlin-017.png`

**[MINOR] A desktop↔phone flip mid-call makes every kin fly from its phone coordinates across the den and behind the PACK panel**
- Where: `#/den`, `{"viewport":"phone"}` then `{"viewport":"desktop"}` while a call howl runs
- Steps:
  1. Tap an empty STAR slot and call COMET FOX.
  2. Flip to phone, Escape ×3, flip to phone again, then flip to desktop and screenshot.
- Expected: kin re-layout instantly, or within one frame, to their desktop slots.
- Actual: for 1–4 s the Sun Lion and Dig Mole sit at x≈300–400, half hidden behind the PACK panel. The fox is pinned off the dome at the left, and the badger is in the wrong slot. They then slide into place (compare shot 025 with shot 026 four seconds later). This is the panel-repaint flicker the team asked about.
- Screenshot: `qa/playtests/shots/gremlin-025.png` (broken), `gremlin-026.png` (settled)

**[MINOR] Numbers flip-flop and disagree with each other (stale repaints)**
- Where: `#/hunt` list and card, HOWL meter, top meters
- Steps and actual:
  - **My own idle:** on `#/hunt`, three consecutive actions showed `GREMLIN · YOU · IDLE 5M`, then `IDLE 4M`, then `IDLE 6M`. The tag also appears while I have a howl running, so I am "idle" in the middle of an action.
  - **List vs card:** at the same moment the list row says `FANG2CLAW · IDLE 9H` and its open card says `IDLE 10H` (shot 017).
  - **Howl counters after a reload:** the call howl went `0/47 idle`, then `0/16 idle` after the reload, then `7/8 hashing`. The DIG howl counted down from `0/31` to `0/9` over about 10 min while the mole badge counted `DIG ~10M → ~4M`. The two never agree, and "idle" never explains what it is waiting for.
  - **Look vs screen:** the look reported `PULSE 39 · HOWL 2` while the screenshot taken in the same action shows `FULL` (shot 024).
- Expected: one source of truth per number, rounded the same everywhere, and never going backwards.
- Screenshot: `qa/playtests/shots/gremlin-017.png`, `gremlin-024.png`

**[MINOR] Phone den clips kin and stacks labels**
- Where: `#/den` at 390×844 with 4 kin
- Steps: flip to phone with lion, mole, badger and a calling Comet Fox.
- Expected: all kin inside the viewport and every badge readable.
- Actual:
  - The Forge Badger is cut off at the right edge (x≈380).
  - The mole's `DIG ~7M` badge is buried under the `AWOOO` burst and the howl ring.
  - The pack strip reads `FORGE BADG…`.
  - The calling fox shows the same information twice: `CALL ~10S` above `CALLING 72% · ~10S`.
- Screenshot: `qa/playtests/shots/gremlin-024.png`

**[POLISH] Overlapping chrome: quest strip under the hint box, star-tier kin under the quest strip, names split mid-word**
- Where: `#/den` top bar, `#/hunt` prey card
- Steps: enter the den at 1280×800 (shot 009); call a Void Owl into a STAR slot (shot 027); open the JORDANJ and FANG2CLAW prey cards.
- Expected: no overlaps, and names wrapped only at word boundaries or shrunk to fit.
- Actual:
  - The quest strip's `PROWL` chip runs under the `TAP KIN · TAP +` box.
  - The calling Void Owl's ring and wings poke into the quest strip.
  - The card titles break as `JORDA / NJ` and `FANG2 / CLAW`.
  - On the map, the `DEVNET CLAN` label covers the JORDANJ den label.
- Screenshot: `qa/playtests/shots/gremlin-009.png`, `gremlin-027.png`, `gremlin-018.png`

**[POLISH] Onboarding forgets the KEPT tick, and JOIN turns into ENTER DEN in the same spot**
- Where: `#/` JOIN dialog → KEEP WORDS step; title screen button [1]
- Steps:
  1. Tick KEPT, Escape ×3, then click JOIN again. The dialog resumes at WORDS but KEPT is unticked and NEXT is disabled. The same happens after `{"reload":true}`.
  2. Triple-click `JOIN · ROAM`, press Escape, then click JOIN.
- Expected: the tick survives, and a just-joined player is not one click away from an unexpected navigation.
- Actual: in step 2 the JOIN control has already become `ENTER DEN` in the same position. A frantic double-click on JOIN would enter the den. There is no "you're in" moment either: Escape simply closed the dialog while the ROAM deed succeeded in the background.
- Screenshot: `qa/playtests/shots/gremlin-004.png`

## 4. Delights
- **Debounce works everywhere it matters.** Concurrent double and triple clicks on NEW PAW, NEXT, JOIN · ROAM, + DIG MOLE, the DIG MOLE card, the FORGE BADGER card and the COMET FOX card each produced exactly one deed. There were no duplicate kin, no double glow spend and no stacked dialogs.
- **Number keys 1–6 switch places instantly** but are correctly swallowed while a dialog is open.
- **Howls survive reload and resume.** DIG `6/9 hashing` was still there after the reload.
- **Onboarding resumes at the right step** after Escape or reload: the paw is kept and the words are the same.
- **Disabled states explain themselves:** `ONLY ONE` on the second mole and badger, and `LOW GLOW · 600 GLOW` on unaffordable cards.

## 5. One change I'd make first
Stop moving things under the pointer. Freeze the hunt camera and the prey list order while a card is open or the pointer is over the list. Re-lay out den kin synchronously on resize. Make every enabled button either act or say why not (STAR POLE, and PROWL's bare "SKY FULL"). Right behind that: keep the hashing worker from blocking reload. A 48 s to 2 min frozen tab is the one thing that would make a real player quit.
