# Playtest report: gremlin (round 4, verification)

## 1. Who I am & what I tried
gremlin, the chaos goblin, on desktop with phone flips, playing as the fresh chief `gremlin4`. I re-ran the repro of every round-3 finding: KEPT tick plus Escape and reload, triple-click JOIN · ROAM, STAR POLE, reload during a call howl and during a hashing DIG, prey-row clicks and canvas taps on the hunt map, double-click PROWL, and a desktop↔phone flip mid-call. Then I abused new ground. I mashed POUNCE ×3 and ×4, reloaded mid-prowl, opened a dialog and clicked behind it at the same time, mashed Escape ×5, spammed number keys concurrently, and tried ROAM with ore still in the ground. I ended with a den of 6 kin (lion, mole, 2 star poles, gust ferret, void owl), 1 snatched shard and 33 glow. That took about 70 lab actions.

## 2. Scores
- **Fun: 6** This is the first time I got the whole loop of PROWL, POUNCE, king falls and SNATCH +1. The SNATCH! burst is a real payoff. The dig is still a 17-minute wait with "idle" on it.
- **Clarity: 5** Three different PULSE numbers sit on one screen. The prowl auto-targets a badger while the quest says POUNCE THEIR KING. Two chiefs share one name.
- **Beauty: 7** Same strong comic ink. It loses points because the new "1 SHARD · AT RISK" banner sits on top of the whole star tier.
- **Feel/responsiveness: 5** The canvas tap is fixed, but prey-row clicks still swing and zoom the camera. A double-click on any dialog opener nets nothing. The prowl arena reflows after the first blow.
- **Stability: 7** The reload freeze is gone (3.8–4.3 s every time, even with DIG hashing). There were no page errors and no lost deeds. Every debounce held except POUNCE.

## 3. Findings

### Round-3 verdicts

| # | Round-3 finding | Verdict | Evidence (round 4) |
|---|---|---|---|
| 1 | [MAJOR] Reload during active howl freezes page 48 s – 2 min | **FIXED** | Each reload took 3.8–4.3 s: with 4 call howls (shot 009), with STAR POLE `6/8 hashing`, with DIG `6/9 hashing` (shot 028) and mid-prowl (shot 018). A parallel `/look` answered in 0 s every time. |
| 2 | [MAJOR] STAR POLE is a silent no-op | **FIXED** | Two STAR POLE clicks each made a `CALL · STAR POLE → success` deed and a howl, took 200 glow, and ended with a `STAR POLE · UP!` toast (shots 007, 011). |
| 3 | [MAJOR] Hunt map re-centres on every card open/close | **PARTLY** | A canvas tap on MOTHWREN with the RUCKUS card open now opens its card and the camera holds still (shots 013→014). Row clicks still pan *and zoom*: the clan sun moved x≈675 → 780 → 745 → 850 over shots 011, 012, 013 and 022. |
| 4 | [MAJOR] Prey list re-sorts under cursor; rapid row clicks leave nothing selected | **STILL BROKEN** | I clicked RUCKUS, FANG2CLAW◆3, PATCHES and VERIFY6060 in quick succession. The FANG2CLAW◆3 card opened and VERIFY6060 got only a hover tint (shot 022), so the last click does not win. I could not re-trigger the live re-sort because nobody snatched during my session. |
| 5 | [MAJOR] Double-click PROWL drops the prey ("PICK PREY") | **FIXED** | A double tap on the card's PROWL made one `PROWL · MOTHWREN DEN` deed and landed on `#/prowl/1-30` (shot 016). A full sky now shows a disabled `⏱ SKY FULL` chip on the card instead of a bare toast (shot 012). |
| 6 | [MINOR] Desktop↔phone flip mid-call flings kin across the den | **FIXED** | Phone, Escape, then desktop while VOID OWL was calling: every kin was in its slot on the first screenshot (shot 020). |
| 7 | [MINOR] Numbers flip-flop and disagree | **PARTLY** | The own row no longer says IDLE, and list and card agree (`IDLE 12H` in both). Still wrong: DIG went `6/9` → `5/9` across a reload, and the mole badge says `DIG ~11M` beside `5/9 hashing` (shot 028). PULSE reads **48** on the meter, **44** in the ME line and **3/3** on POUNCE in one view (shot 017). The CALL dialog says `PULSE 20` while the meter says `PULSE 24` in the same look. |
| 8 | [MINOR] Phone den clips kin and stacks labels | **PARTLY** | Nothing is cut at the right edge and the pack strip shows full names. But the `DIG ~16M` badge covers the ferret's label (reads `UST FERRET`). The banner wraps to 3 lines over the star tier, the action-button row sits on the quest strip, and the Void Owl can't be seen at all (shot 021). |
| 9 | [POLISH] Overlapping chrome: quest strip, star tier, split names | **PARTLY** | Card titles no longer split (`FANG2CLAW` on one line, shot 012). Still: the `PROWL` quest chip runs under the `TAP KIN · TAP +` box (shot 005), star-tier kin poke into or under the quest strip (shot 007), and the `DEVNET CLAN` label covers the selected `RUCKUS` den label (shot 013). The star-tier part is now worse; see new finding A. |
| 10 | [POLISH] Onboarding forgets KEPT; JOIN becomes ENTER DEN in place | **PARTLY** | KEPT is still unticked and NEXT disabled after Escape ×3, and again after reload (shot 002). JOIN still turns into ENTER DEN in the same spot (shot 004). New and good: the dialog closes itself on JOIN · ROAM and you get `JOINED · DEVNET CLAN` + `ROAM · DONE` toasts and ROAM!/CHIEF! bursts, and a triple-click did not fall through to KIN. |

### New findings

**[MAJOR] A. The "1 SHARD · AT RISK" banner covers the whole star tier of the den**
- Where: `#/den` at 1280×800, the banner under the quest strip
- Steps:
  1. Call two STAR POLEs and a VOID OWL (any star-tier kin).
  2. Snatch or dig 1 shard so the `◆ 1 SHARD · AT RISK + FORGE BADGER` banner appears.
- Expected: star kin are drawn fully visible and tappable, and the banner sits clear of the dome.
- Actual:
  - Both Star Poles show only their bottom third. The Void Owl shows only its wingtips and label (shots 025, 027, 028).
  - Half my pack is behind a UI strip, and the den's top tier is unreadable.
  - On phone the banner wraps to 3 lines and hides the tier completely (shot 021).
- Screenshot: `qa/playtests/shots/gremlin4-025.png`, `gremlin4-028.png`, `gremlin4-021.png`

**[MAJOR] B. POUNCE is the only commit button that isn't debounced: one mash fires several pounces and costs your king fur**
- Where: `#/prowl/<den>` → POUNCE
- Steps:
  1. Prowl to MOTHWREN and target their DIG MOLE.
  2. Triple-click POUNCE. That made 2 pounce deeds.
  3. Target their SUN LION and click POUNCE 4× fast. That made 3 pounce deeds.
- Expected: one pounce per deliberate press. If repeat fire is intended, show a visible queue ("×3") so a mash can't overcommit.
- Actual:
  - Every queued pounce fired. Each one took `BACK −2` retaliation, and my Sun Lion went from **6/6 to 2/6 fur** off a single mash.
  - Pulse drained with no warning.
  - Every other commit button (NEW PAW, JOIN · ROAM, call cards, PROWL) correctly does one deed per burst, so this one feels like a bug rather than a design choice.
- Screenshot: `qa/playtests/shots/gremlin4-017.png`, `gremlin4-019.png`

**[MINOR] C. A double-click on a dialog opener opens and instantly closes it: two clicks produce nothing**
- Where: `#/den` → `+ DIG MOLE` banner button; CALL NEW KIN plus a slot tap
- Steps:
  1. Double-click `+ DIG MOLE`. The CALL dialog opens, the 2nd click lands on the backdrop above the dialog, and it closes.
  2. Separately, click CALL NEW KIN and tap an empty slot at the same moment.
- Expected: the dialog stays open after the burst (ignore backdrop clicks for about 300 ms after opening).
- Actual: no dialog in either case, with no feedback (shot 027). A frantic player thinks the button is dead and clicks again, which works only on an odd number of clicks.
- Screenshot: `qa/playtests/shots/gremlin4-027.png`

**[MINOR] D. Prowl arena reflows after the first blow; reload wipes BLOWS and retargets away from the king**
- Where: `#/prowl/1-30`
- Steps:
  1. Pounce once. The BLOWS panel appears.
  2. Pounce until their Dig Mole falls.
  3. `{"reload":true}`.
- Expected: a stable arena, a combat log that survives reload, and a default target that follows the quest (`POUNCE THEIR KING`).
- Actual:
  - After the first blow the whole arena shifts down about 50–70 px (the GREMLIN4 title moves from y≈103 to y≈172 and the lion from y≈470 to y≈420; shot 016 vs 017).
  - After the reload the BLOWS log is gone.
  - The target auto-switches to `FORGE BADGER`, not the king, while the quest chip still says POUNCE THEIR KING (shot 018).
  - The targeting line is also drawn over the ROOT lane tag.
- Screenshot: `qa/playtests/shots/gremlin4-016.png`, `gremlin4-017.png`, `gremlin4-018.png`

**[MINOR] E. Two chiefs named FANG2CLAW, and nothing tells them apart**
- Where: `#/hunt` prey list and card
- Steps: open `#/hunt` and look at rows 2 and 4. Both read `FANG2CLAW · DEVNET CLAN`, one ◆19 and one ◆3.
- Expected: unique names, or a disambiguator (chief id, den tag) on both the row and the card.
- Actual: the cards are identical apart from the numbers (shots 012, 022). The rapid-click bug (#4) opened the wrong one for me, and nothing on the card says which FANG2CLAW it is. That makes it easy to prowl the wrong chief, and it gives anyone impersonating another chief cover.
- Screenshot: `qa/playtests/shots/gremlin4-022.png`

**[MINOR] F. Escape does not close the prey card**
- Where: `#/hunt` with a prey card open
- Steps: open the MOTHWREN card and press Escape.
- Expected: the card closes, as every dialog does.
- Actual: the card stays open (shot 015). Only the × works. This is inconsistent with the rest of the game, where Escape is the universal back.
- Screenshot: `qa/playtests/shots/gremlin4-015.png`

**[POLISH] G. Top meters jitter sideways; disabled NEXT looks enabled; CALL dialog is mostly empty**
- Where: top bar on every page; JOIN → KEEP WORDS; first CALL dialog
- Actual:
  - **Top meters:** the PULSE chip changes width between `FULL`, `2` and `48`, so the HOWL chip next to it jumps about 20 px (shot 007 vs 011). On `#/glow` the `FULL` chip overlaps its neighbours (shot 026).
  - **Disabled NEXT:** in KEEP WORDS it is the same bright yellow as the enabled one, with only slightly greyer text (shot 002 vs 003).
  - **First CALL dialog:** it is 975 px wide with one 220 px card and a big empty cream field (shot 006).
- Screenshot: `qa/playtests/shots/gremlin4-002.png`, `gremlin4-006.png`, `gremlin4-026.png`

## 4. Delights
- **Reload is finally safe.** Five reloads mid-howl, mid-hash and mid-prowl took about 4 s each, and every howl resumed. Last round's dead-tab bug is gone.
- **PROWL → POUNCE → SNATCH works end to end.** The SNATCH! burst with flying shards and the `+1 SHARD!` quest chip is the best moment in the game so far.
- **Debounce on everything except POUNCE.** Double NEW PAW, triple JOIN · ROAM, double DIG MOLE card, triple GUST FERRET and double PROWL each made exactly one deed.
- **Refusals now explain themselves.** ROAM with ore left shows `DEN NOT EMPTY · 5 SHARD LEFT · DIG FIRST`. A full sky shows `⏱ SKY FULL` on the card. Unaffordable cards show `LOW GLOW · 500`.
- **Keys behave.** Number keys are swallowed while a dialog is open, and a concurrent burst of 3-1-5-4-6-1 ended on the right place (DEN). Escape ×5 left no stray state.

## 5. One change I'd make first
Stop putting UI on top of the den's star tier. Move the "SHARD AT RISK" banner into the quest strip or the bottom bar, so all kin are visible and tappable. Right behind that, give POUNCE the same burst guard as every other commit button, or show the queue. One panicked mash shouldn't throw away two thirds of your king's fur.
