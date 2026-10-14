# Playtest report: ledger

## 1. Who I am & what I tried

I'm an economy min-maxer, desktop viewport, playing chief "Luxear" in DEVNET GUILD. I ran the full resource loop end to end: called a Dig Mole and dug all 5 ground shards, called a Forge Badger and forged 2 alpha, called a Glow Stone and fed it 1 α, then fed 1 α to the clan sun on GLOW. At each step I compared the numbers on the top meters, the den card, the call dialog, the GLOW page, the KIN page and the look's state line. Partway through, someone pounced my king and took a shard, so I re-called the Sun Lion. Session was about 95 minutes of chain time.

## 2. Scores

- **Fun 5/10.** The loop works and feeding a Glow Stone (+2,000 glow for 1 α) feels great. Most of the session, though, is waiting on idle howls, and I lost a shard without being told.
- **Clarity 4/10.** Costs on cards are clear (500 GLOW · 8 PULSE). Budget numbers don't add up across screens, spare glow drains for reasons no screen explains, and howl progress is cryptic.
- **Beauty 8/10.** The comic-ink den, the "UP!"/"DIG!" bursts and the GLOW page header look great. The howl pill is nearly invisible.
- **Feel/responsiveness 4/10.** A dig takes about 15–17 min per shard and a forge about 30 min. Howls sit "idle" for 10–20 min with no ETA. Early on, lab actions took 2–5 min while a howl was hashing.
- **Stability 6/10.** No crashes and no page errors, and every deed I signed succeeded. One CALL silently did nothing and the screen jumped to HUNT on its own. Time labels are wildly wrong.

## 3. Findings

1. **[MAJOR] King pounced and shard snatched with zero notice**
   - Where: #/den, top meters, DEEDS
   - Steps: Have 1 shard waiting to forge, with "1 SHARD · AT RISK". Go to #/kin, then #/glow.
   - Expected: a raid toast or deed ("POUNCED · −1 SHARD by X") and a den banner explaining it.
   - Actual: SHARD went 1 → 0 and SUN LION vanished from KIN. Nothing appeared in DEEDS or SIGNS. The den only shows "NO KING · CALL". No attacker name and no loss amount. For an economy player, losing stock without a ledger entry is the worst possible feedback.
   - Shot: qa/playtests/shots/ledger-032.png

2. **[MAJOR] Spare glow drains passively and the cause is hidden**
   - Where: GLOW meter, #/glow SPARE GLOW / LINK, call dialog "GLOW x"
   - Steps: Join, then watch the GLOW meter while doing nothing.
   - Expected: spare changes only when I call or feed, or the reason is shown wherever spare is shown.
   - Actual: spare went 10,591.666 → 8,152 → 7,425 → 6,810 → 6,282 → 5,825 → 5,425 while I spent only 500. HAVE is the clan pool split evenly across linked dens (14 dens × 6,857, then 16 × 6,000), so every new clan den taxes everyone. The den, the call dialog and the meter never say this. A planned build can turn unaffordable mid-wait.
   - Also, the clan card says GLOW 4,400 while LINK says "16 DENS EACH UP TO 6,000" (a 96k pool). Those two numbers can't both be "clan glow".
   - Shots: ledger-013.png, ledger-031.png

3. **[MAJOR] Time labels use the wrong block time**
   - Where: #/hunt prey list and den card ("NAP 34H", "LAST MOVE 34H"); state-line `pulse`
   - Steps: Play actively for about 1.5 h, including two FEEDs a minute earlier, then open your own den on HUNT.
   - Expected: last move a few minutes ago.
   - Actual: "LAST MOVE 34H". 20,287 blocks × 6 s ≈ 34 h, but devnet blocks are about 0.19 s. Other chiefs show "NAP 2D", "NAP 13D", which is meaningless for judging prey.
   - FEED doesn't reset this counter either. The state line shows `pulse 20287` while the meter shows PULSE FULL, so the raw value is uncapped and inconsistent with the meter.
   - Shot: ledger-047.png

4. **[MAJOR] The CALL BADGER banner shortcut silently failed and the view jumped to HUNT**
   - Where: #/den banner "1 SHARD · AT RISK · CALL BADGER", then the call dialog card "FIRST FORGE BADGER"
   - Steps: Click CALL BADGER, then click the badger card.
   - Expected: CALL · FORGE BADGER deed, −500 glow.
   - Actual: the dialog closed, with no deed, no toast and no glow spent. A few seconds later the route was #/hunt even though the look still said #/den. Retrying via CALL NEW KIN → FORGE BADGER worked first time (−500 exactly).
   - Shots: ledger-021.png, ledger-023.png

5. **[MINOR] Sun Lion glow cost differs between screens, and USE never equals the sum of listed costs**
   - Where: #/kin vs #/glow USE
   - Steps:
     - Lion + Mole: USE 575 (500 + 75).
     - Lion dead + Mole + Badger: USE 1,025.
     - Re-call lion: −50, USE 1,075.
   - Expected: the KIN page "GLOW −50" for the Sun Lion matches what USE charges.
   - Actual: the lion slot is effectively 75, or there is a hidden 25 base charge that persists even with no king. A min-maxer can't reconcile the budget.

6. **[MINOR] The Glow Stone FEED dialog has no yield preview and fails silently with 0 alpha**
   - Where: den → GLOW STONE card → FEED
   - Steps: Open FEED with 0 α. The input defaults to 1 and FEED is enabled. Click it.
   - Expected: a "NO ALPHA" toast, as on the GLOW page, plus a "+X GLOW" preview like the clan sun's "+960 GLOW · 4% TO SUN".
   - Actual: nothing happens. With 1 α it gave +2,000 glow, which you only learn after spending. The stone feed also isn't counted in GLOW → YOUR FEED, which only counts suns.
   - Side note: stone 2,000/α vs sun 960/α is a huge, unexplained difference.
   - Shot: ledger-040.png

7. **[MINOR] Howl progress is opaque and the HOWL meter mixes units**
   - Where: HOWL meter/button, HOWL pill at bottom-left
   - What I saw:
     - Progress reads "CALL · DIG MOLE 0/51 idle", then "DIG 0/44", "0/27", "6/8 hashing". The denominator shrinks over time and the numerator stays 0 while idle.
     - Forge sat "idle" for about 20 min with no ETA, which looks stuck.
     - The meter shows "160K", "2.5M", "1", "2", "3", mixing hash counts with job counts.
     - Clicking HOWL opens nothing.
     - The on-canvas pill ("HOWL · DIG · 8") is low-contrast behind the action bar.
     - Early on, lab actions took 2–5 min while hashing (`goto #/glow` > 120 s).
   - Expected: one clear bar per job with "~N min" and "waiting for easier"/"working" states.
   - Shots: ledger-018.png, ledger-028.png

8. **[MINOR] Forge is the bottleneck, and the banner claims work that isn't happening**
   - Where: #/den banner "2 SHARD · FORGING"
   - Timings: dig about 15–17 min per shard; forge about 30 min per shard. The badger was called at ~#185,000 and the first alpha arrived at ~#196,500.
   - Shards pile up "AT RISK" while the forge howl is "idle", yet the banner says FORGING. The stealable resource takes twice as long to convert as to produce, so waits feel unfair given the snatch risk (see #1).

9. **[MINOR] Ground shard count disappears, and the mole idles silently once the ground is empty**
   - Where: #/den
   - "5 SHARD IN GROUND" shows only before calling the mole. Afterwards no number is shown anywhere. The island draws 3 diamonds whether 5 or 1 remain.
   - Once the ground was empty (5 dug), the mole still reads "TOTEM · DIG" and still draws 500 glow, with no "GROUND EMPTY · ROAM" nudge.
   - The Dig Mole card says "HOWL QUICK" although digs take 15+ min.
   - Shot: ledger-043.png

10. **[POLISH] Number formatting and name inconsistencies**
    - Alpha shows "1" in some places and "1.00" in others: the top meter switches to "1.00", and dialogs say "1.00 HAVE".
    - The state line shows spare as "10591.666".
    - Deed labels are formatted differently: "FEED · 1 α → GLOW STONE" vs "FEED · 1.00 α · DEVNET GUILD".
    - GLOW says LINK "16 DENS" while HUNT says "13 DENS".
    - I typed the chief name "Ledger", but it was replaced by the random "Luxear".
    - The clan FED counter went 110 → 111 when I fed only my Glow Stone. Probably another player, but there is no way to tell.

## 4. Delights

- The Glow Stone payback is a real min-max moment: 500 upkeep, +2,000 glow per α fed, visible straight away in SPARE/HAVE (6,425 / 8,000).
- Call costs were exact and consistent across the call dialog, the kin card and the GLOW USE (500 for mole, badger and stone; −50 for the king re-call).
- The clan-sun FEED dialog preview "+960 GLOW · 4% TO SUN" was accurate to the unit. Every dialog should have this.
- The CHIEF → MOLE → DIG → BADGER → ALPHA → PROWL progress strip and the context banners ("CALL MOLE", "CALL BADGER") guide the loop well.
- The "UP!" and "DIG!" bursts, the forging badger with floating α, and the "NO ALPHA · FORGE FIRST" toast.

## 5. One change I'd make first

Add a single honest **budget and ledger readout**:
- Every event that changes shards, alpha or glow gets a DEEDS/toast entry: raids, dilution from clan growth, feeds.
- The spare-glow tooltip shows HAVE = clan pool ÷ dens, minus USE, itemised per kin.

Right now numbers move without explanation, and in this game that means losing resources without knowing why.
