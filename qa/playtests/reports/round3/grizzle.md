# grizzle · Round 3 playtest report

## 1. Who I am & what I tried

I'm grizzle. I played the original Structs for a year and I don't like the cute skin. I played ~72 lab actions on desktop and checked every number the game showed against the chain REST API (read-only).
Run: joined as chief 1-60 (den 2-58) → called a Dig Mole (Ore Extractor) and timed its call and its dig → prowled a kingless den (Pip2tail) and snatched 1 shard → called a Forge Badger and an Iron Rhino (Tank), set it to GUARD my Sun Lion → prowled Verify6060, pounced their king 3 times, and checked each blow's health on-chain → snatched 3 shards → came home and was raided by another tester. I lost my king, my rhino and all 5 shards.
I also checked the HUNT list, the PEEK and PROWL odds, the KIN stat sheet, the CALL menu and the GLOW page against the struct_type, planet, fleet, reactor and infusion records.

## 2. Scores

- **Fun 5/10.** The raid loop is real and tense. I snatched 4 shards and lost 5 within ~10 minutes. But digging 1 shard takes about 18 minutes, while snatching 3 takes about 13 seconds. Nothing in the game prepares you for that.
- **Clarity 4/10.** The combat numbers are honest, but they are labelled ambiguously. The game hides key Structs numbers: planetary shield, shot count, dodge %. It never tells you who hit you.
- **Beauty 7/10.** I hate to admit it, but the comic ink and the VS split screen are gorgeous. One flaw: totems get drawn in the wrong zone row.
- **Feel/responsiveness 4/10.** Pounces resolve within a block, which feels great. But the HOWL status lines contradict the HOWL panel. A reload took 95 s. Screenshots stopped rendering for the second half of my session.
- **Stability 5/10.** Two dead or opaque controls: the top-bar JOIN on #/glyphs and a "SKY FULL" prowl. No page errors, but the renderer stalled under howl load.

## 3. Findings

**1. [MAJOR] Raided and king killed, and the game never says who did it**
- **Where:** #/den banner and toast after a raid; BLOWS panel on #/prowl/*
- **Steps:**
  1. Fight on #/prowl/1-45 so your Sun Lion ends at 4/6 and your Iron Rhino guard at 1/3.
  2. Return home and stay there for about 2 minutes.
  3. Open #/den.
- **Expected:** "RUCKUS felled your king, −5 shard". The chain knows: RUCKUS (1-57) went from ore 9 to 18 in that window, and was the only other chief acting since block ~406000. The game should give a link to HUNT them, plus a blow-by-blow log of the hits my den took.
- **Actual:**
  - The banner reads `LOST · KING FELL · −5 SHARD · PROWLED`. The toast reads `−5 SHARD · A CHIEF FIGHT`. No name, no blows, no revenge path, and nothing in the More menu.
  - In a third-party fight the BLOWS log labels both sides "THEIR". When I watched MuseMane get hit, it read `THEIR IRON RHINO → THEIR SUN LION −2 · THEIR SUN LION FALLS!` (#/prowl/1-13, chain ~#401,211). That doesn't say which chief is which.
- **Screenshot:** qa/playtests/shots/grizzle-029.png (the THEIR→THEIR log)

**2. [MAJOR] PROWL fails with the unexplained toast "SKY FULL"**
- **Where:** #/prowl/1-13 (MuseMane), the "PROWL 2 SHARD" button
- **Steps:**
  1. HUNT → pick MuseMane → PROWL. The VS screen shows HIT 100% · DMG 2 · BACK −2 · TRADE.
  2. Click PROWL 2 SHARD (twice, chain #400,935 and ~#401,100).
- **Expected:** The pack moves. If it can't, a plain reason and a disabled button.
- **Actual:**
  - Toast "SKY FULL" and a "FULL" badge under the button.
  - No deed is created. The chain fleet 9-60 stays `onStation 2-58`.
  - The button stays enabled and does nothing.
  - "SKY" is the game's word for the air zone, which has nothing to do with travelling to a den, so the message is misleading as well as opaque.
  - The same button works immediately on Pip2tail and Verify6060. (Someone else was felling MuseMane's king at that moment, so this is probably "target already occupied", but the player can't tell.)
- **Screenshot:** qa/playtests/shots/grizzle-028.png

**3. [MAJOR] Top-bar JOIN does nothing on #/glyphs**
- **Where:** #/glyphs, top-right JOIN button
- **Steps:**
  1. From the title screen, click GLYPHS.
  2. Click JOIN in the top bar: by name, then by number [4], then with tapxy [1218,30]. Try it scrolled and at the top.
- **Expected:** The JOIN dialog opens, as it does from #/.
- **Actual:** Nothing happens: no dialog, no route change, no error. I had to go back to #/ to join.
- **Screenshot:** qa/playtests/shots/grizzle-005.png, grizzle-007.png

**4. [MAJOR] Odds against a guarded king show the blocker's damage as if the king takes it**
- **Where:** #/prowl/1-17 (Fang2claw), target = their SUN LION; Iron Rhino (Tank) guards it
- **Steps:** Tap their Sun Lion with your Sun Lion selected.
- **Expected:** Something like "RHINO BLOCKS → rhino −1 (armour), king −0, you −3".
- **Actual:**
  - The chips read `HIT 100% · DMG 1 · FELL 0% · BACK −3 · IRON RHINO BLOCKS`.
  - The numbers are correct for the Structs rules: 2 dmg minus 1 armour (attackReduction) = 1, and counters of king 2 + tank 1 = 3.
  - But "HIT 100% / DMG 1" sits under a header pairing SUN LION → SUN LION. A new player reads it as "my hit lands on the king for 1".
  - It never says that 2 more pounces kill your own king (6 hp, −3 per pounce) before the rhino (3 hp, −1 per pounce) falls. The "YOU FALL" chip only appears on the final lethal hit.
- **Screenshot:** qa/playtests/shots/grizzle-024.png

**5. [MAJOR] Screenshots and reloads stall while howls run**
- **Where:** Any route, from about chain #401,800 (two howls active: DIG + FORGE/SNATCH/CALL)
- **Steps:**
  1. Run DIG plus one more howl.
  2. Request `look?shot=1`, or any action with `"shot":true`.
- **Expected:** A screenshot within a few seconds, as it worked for shots 001–031.
- **Actual:**
  - Every screenshot request timed out (40–120 s), 6 attempts across ~25 minutes, including after the king recall finished.
  - `{"reload":true}` took 95 s.
  - Text looks kept working.
- **Caveat:** 10 testers were howling on the same host, so this may be host CPU starvation and not the game. But if howl workers starve the render loop, players will see a frozen canvas.
- **Screenshot:** none (that is the bug); the last good shot is grizzle-031.png

**6. [MINOR] Real Structs numbers are hidden or mislabelled**
- **Where:** HUNT card, PEEK, KIN, CALL, GLOW
- **Steps and actual:**
  - (a) The HUNT/PEEK card for Fang2claw shows SHARD / IDLE / KING / GUARDS·PACK, but not planetaryShield. On-chain it is 25 (Mothwren's is 50), and that is what defends the den.
  - (b) KIN page: Comet Fox shows `DMG 2 · 1`. Chain Starfighter secondary weapon = 1 dmg × **3 shots**, so the true burst is 3.
  - (c) `SKILL JAM` (Star Bear, Gust Ferret, Tide Otter) hides the actual effect, signalJamming = 2/3 dodge vs guided weapons. Same for `DODGE` (defensiveManeuver, 2/3 vs unguided).
  - (d) The CALL menu shows "CALL QUICK/STEADY/LONG" but never the buildDifficulty (215…5000).
  - (e) GLOW page: the clan card says `GLOW 4,480`. That is the reactor's 4% commission capacity (reactor 3-1 capacity 4,480,000). The pool that actually powers every den is substation 4-1 at 96,000 glow, shown to me as "LINK 65 DENS EACH UP TO 1,477".
- **Expected:** A "numbers" drawer or long-press with the raw values. Label (e) "CLAN CUT" or show 96,000.

**7. [MINOR] Howl status lines contradict the howl panel; the call ETA drifts upward**
- **Where:** HOWL line in the look / top-bar HOWL N, versus the HOWL panel
- **Steps:**
  1. Call a Dig Mole and open the HOWL panel.
  2. Compare it with the HOWL status line during the dig.
- **Actual:**
  - The status line says `HOWL · DIG 0/30 idle` → `0/18 idle` → `0/10 idle` while the panel shows `DIG GATHER · ~18M 3%` → `10%`. "idle" while it is plainly progressing.
  - The falling denominators (51→30→18→10) are never explained. I assume it's the decaying difficulty.
  - The CALL estimate read `~1M` at 10% and `~2M` at 85%. The build actually finished in ~74 s.
  - Credit where due: the dig ETA `~18M` was honest. The mine ran from block 398,040 (02:05:27Z) to block 403,518 (02:23:13Z).
- **Expected:** One status word that matches the panel, and an ETA that only counts down.
- **Screenshot:** qa/playtests/shots/grizzle-017.png, grizzle-018.png, grizzle-019.png

**8. [MINOR] Totems drawn in the wrong zone row when two share ROOT**
- **Where:** PEEK / #/prowl/1-17 (Fang2claw)
- **Steps:** Prowl-view Fang2claw.
- **Expected:** The Dig Mole drawn in the ROOT band. On-chain, Ore Extractor 5-61 has `operatingAmbit land`, as does Refinery 5-71.
- **Actual:** The Dig Mole sits on the STAR/SKY line (top-right) and the Forge Badger on the ROOT/TIDE line. On Pip2tail, with only one totem, the Dig Mole is correctly in ROOT. A veteran reads the rows as ambits and will pick the wrong attackers.
- **Screenshot:** qa/playtests/shots/grizzle-023.png vs grizzle-025.png

**9. [MINOR] Kingless dens and the dig/snatch asymmetry go unexplained; wounded kin can't be healed**
- **Where:** #/prowl/1-18, #/den
- **Steps:**
  1. Prowl Pip2tail. On-chain fleet 9-18 has no commandStruct.
  2. Then pounce Verify6060 and come home.
- **Actual:**
  - The step bar shows `✓ KING` for a den that never had one, and the snatch completed in seconds (+1).
  - The Verify6060 snatch took ~13 s for 3 shards. My own dig takes ~18 min per shard.
  - After the fight my Sun Lion (4/6) and Rhino (1/3) stayed wounded. The den showed no "WEAK" or "HURT" warning and there was no heal action. I was raided within minutes (finding 1).
- **Expected:**
  - "NO KING · FREE SNATCH" on kingless targets.
  - A wounded-pack warning on DEN.
  - Some signal on the DIG and SNATCH glyphs that stealing is fast and mining is slow.
- **Screenshot:** qa/playtests/shots/grizzle-025.png, grizzle-030.png

**10. [POLISH] The same chief's idle time differs between list and card; duplicate chief names**
- **Where:** #/hunt
- **Steps:** Select FANG2CLAW.
- **Actual:**
  - The list row says `IDLE 9H` while the card beside it says `IDLE 10H`. Chain lastAction was ~9.6 h ago, so one floors and the other rounds.
  - Separately, "Fang2claw" (1-17) and "fang2claw" (1-61) coexist, which is easy to impersonate in a PvP game.
- **Screenshot:** qa/playtests/shots/grizzle-020.png, grizzle-021.png

## 4. Delights

- **The odds are real.** I predicted then pounced 3 times on Verify6060. Each blow matched the chain exactly: king 6→4→2→destroyed, my rhino 3→1, my lion 6→4, and no counter on the killing blow, exactly as "FELL IT" promised.
- **The KIN sheet faithfully maps Structs struct types.** Glow draw = passiveDraw, HITS = weapon ambit bitmask (Sun Lion "OWN ZONE" = local/32), BITE BACK = counterAttack / counterAttackSameAmbit (Fang Walrus "1 · 2"), LEAP · 3 PULSE = moveCharge, CALL PULSE 8+ = buildCharge.
- **The GLOW numbers are exact.** HAVE 1,477 = 96,000,000 / 65 connections, USE 575 = structsLoad, SPARE 902. Spare glow went back up when my king and rhino died. "CUT 4%" matches the reactor commission.
- **GUARD works and is cheap to discover.** Pick the rhino → GUARD 1 → choose the king → chain structDefenders `['5-180']` within a block.
- **The "YOU FALL" chip on a lethal trade, plus BACK −N everywhere**, means you can always see the counter-attack before you commit.

## 5. One change I'd make first

Add an after-action ledger to the den. It should list every blow and snatch against me, with the attacker's chief name, their kin, the damage, the shards lost, and a one-tap HUNT link. The PEEK card should also get a "numbers" row: shield, guards, shots × dmg, dodge %. The odds math is already correct, so the game only needs to show it.
