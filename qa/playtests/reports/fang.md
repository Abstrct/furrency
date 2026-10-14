# Playtest report: fang (FangRaider), desktop 1280x800

## 1. Who I am & what I tried
I played an aggressive PvP raider. I joined in about 5 actions with a new paw and DEVNET GUILD, then CALLed four fighters through the zone slots (Iron Rhino in ROOT, Gust Ferret in SKY, Fang Walrus in TIDE, Star Bear in STAR). After that I hunted and raided five chiefs: SMOKETEST (empty), PIPSQUEAK, FENCLAW, LUXEAR and GLYPHPAW. I used manual POUNCE and AUTO, completed 4 SNATCHes, got bounced off ROOK ("SKY FULL"), and got raided by GLYPHPAW, who killed my king and took my shards. I then re-called my king and raided GLYPHPAW back. I used about 75 actions.

## 2. Scores
- **Fun 8**: The core loop is quick and greedy in a good way: hunt, prowl, pounce ×3, then +1 SHARD!. Getting raided back made the devnet feel alive.
- **Clarity 5**: The odds strip (HIT/DMG/FELL plus FREE HIT, TRADE or FELL IT) is great. But NAP, FULL, losses, dead kin and the GUARD chip all need guessing, and odds stay on screen after a fight ends.
- **Beauty 9**: The VS screen with blue and pink halves, lane bands and WHAM!/-2 bursts looks gorgeous. The den dome and kin art are lovely.
- **Feel/responsiveness 6**: Prowl and pounce land almost instantly. But the defend window is too short to react in, the PROWL button silently does nothing when the target is FULL, and the lab tab stopped producing screenshots after the first HOWL until I reloaded.
- **Stability 6**: There were no page errors. However, combat screens go stale after a fight, the shard and kin losses come with no message, and screenshot capture hung for about 10 actions.

## 3. Findings

1. **[MAJOR] Getting raided gives no alert outside the den, and losses are never announced**
   - Where: global / #/prowl / #/den
   - Steps: Prowl LUXEAR with 2 shards in my den. While I was on the combat screen, GLYPHPAW prowled me.
   - Expected: A global "PROWLERS!" alert (toast, top-bar pulse or sound) and a "−2 SHARD" or "IRON RHINO FELL" event.
   - Actual: My snatch showed "+1 SHARD!" but the meter went 2→1. Iron Rhino disappeared from PACK (5→4 kin) with no message. The PROWLERS!/DEFEND banner only shows on #/den.
   - Screenshot: qa/playtests/shots/fang-026.png (header shows 1 shard right after +1), fang-028.png

2. **[MAJOR] The defend loop can't be won in time**
   - Where: #/den PROWLERS! → DEFEND → #/prowl/<them>
   - Steps: Click DEFEND, then POUNCE right away.
   - Expected: At least one return blow before my king falls.
   - Actual: The attacker's 3 pounces landed (my king 6→0) before my first POUNCE registered. No deed was created, the POUNCE control disappeared, and the screen switched to "YOUR KING!" / NO KING.
   - Note: A 6-fur king against 2-damage hits with ~instant pulse refills on 150 ms blocks means a defender who isn't already on screen has no chance. This is maybe a devnet tuning issue, but it should be flagged.
   - Screenshot: fang-029.png, fang-030.png

3. **[MAJOR] PROWL on the PEEK → combat screen silently does nothing when the target's lane is full**
   - Where: #/prowl/1-12 (ROOK), button "PROWL · 1 SHARD"
   - Steps: Hunt ROOK → PEEK → PROWL THIS DEN → click PROWL (tried 3 times, including by coordinates).
   - Expected: A disabled button with a reason, or a toast.
   - Actual: The button stays bright pink and clickable with a tiny "FULL" tag under it, and nothing happens. Only the PROWL button on the #/hunt panel shows a "SKY FULL" toast. The player can't tell what is full (another raider's pack is parked there) or what to do about it.
   - Screenshot: fang-024.png, fang-025.png

4. **[MAJOR] The combat screen goes stale after the king falls**
   - Where: #/prowl after "THEIR SUN LION FALLS!" or "YOUR KING!"
   - Expected: The odds strip and POUNCE are replaced by the snatch/home state.
   - Actual:
     - During HOLD · SNATCHING, the screen still shows "HIT 100% · FELL 0% · FREE HIT" and an enabled POUNCE against a dead king.
     - After my king died, it shows "STAR BEAR → SUN LION · FELL 100% · FELL IT" next to "NO KING".
     - After the snatch the pack auto-returns ("pack HOME"), but the HOME button stays and the screen never says "PACK HOME". Clicking HOME logs a pointless PACK · HOME deed.
   - Screenshot: fang-030.png

5. **[MINOR] Third-party attackers are drawn as the defender's own kin**
   - Where: #/prowl/1-12 (ROOK) BLOWS
   - Actual: BLOWS read "THEIR SUN LION → THEIR DIG MOLE −2". Another raider's king, parked at Rook's den, is shown on Rook's (pink) side and labelled THEIR, so it looks like Rook is attacking himself.
   - Screenshot: fang-025.png

6. **[MINOR] AUTO picks the wounded guard and assigns guards without asking**
   - Where: #/prowl AUTO
   - Actual: The first AUTO also fired "GUARD · IRON RHINO → SUN LION" (I never asked for a guard). Later AUTO runs used that same 1/3-fur guard Rhino for the killing blows, even though the hunt panel says "3 KIN CAN HIT KING" (which excludes it). The Rhino later died while defending my den.
   - Separately, the "GUARD KING · <kin>" chip looks like a status label, not a button.

7. **[MINOR] NAP / LAST MOVE numbers aren't believable**
   - Where: #/hunt prey list
   - Actual:
     - Times jump: LUXEAR went NAP 4H → 8H → 15H, then 62M a few minutes later.
     - GLYPHPAW showed "NAP 67M · LAST MOVE 67M · KING HOME · PACK 0" one minute after their pack raided me.
     - I showed "NAP 4H" seconds after acting.
   - As a raider I first read NAP as "shielded/asleep, can't hit", but it only means idle.

8. **[MINOR] The hunt list footer counts don't match the panel**
   - Where: #/hunt with a search active
   - Actual: Searching "Smoke" shows "1 DENS · 1 WITH SHARD", but SMOKETEST's panel says "SHARD NONE" (the prowl then found SNATCH · EMPTY). The FENCLAW search showed "1 DENS · 4 WITH SHARD". The WITH SHARD count ignores the filter.

9. **[MINOR] Pulse and glow readouts are inconsistent**
   - The POUNCE pulse cap flips between 5/5 and 3/3.
   - The top meter shows "PULSE 4" while the CALL dialog shows "PULSE 45".
   - The "PULSE" label in the top bar is clipped to "PU".
   - Glow drifts (11.9K → 5,555 → 5,680) with no hint that kin upkeep is the cause.
   - The CALL dialog's glow chip shows a stale value (10.6K while the meter said 7,925).

10. **[POLISH] Den checklist and labels have problems**
    - The checklist ticks MOLE ✓ and DIG ✓ even though I never called a mole (snatched shards seem to count as dig).
    - The banner stack hides Star Bear and the incoming prowler's label.
    - The SNATCH! / KING DOWN! / WHAM! stickers stack on top of each other and can't be read.
    - The generic CALL dialog lists PACK fighters below the fold, and I couldn't scroll to them. The zone "+" slots work, but players may not find them.
    - Screenshot: fang-021.png, fang-026.png, fang-028.png

Tooling note: after the first HOWL started, every `shot` request hung (curl timed out at 60–170 s) for about 10 actions, and CANVAS TARGETS came back empty once. A `{"reload":true}` fixed it. The cause could be the page's render loop stalling during the howl.

## 4. Delights
- Joining to my first den in about 5 clicks, with glow handed over up front so I could build a pack right away.
- Zone-filtered CALL from the den slots ("CALL · ROOT" shows exactly the 3 root fighters). Calls finish in seconds.
- The VS lane screen: attacker → target chips, HIT / DMG / FELL, and the FREE HIT / TRADE / FELL IT verdict make each blow a clear decision.
- Snatch is fast and rewarding: HOLD · SNATCHING → +1 SHARD!, and the pack comes home on its own.
- The PROWLERS! → DEFEND banner and the "YOUR KING!" splash land hard emotionally. Calling a new king is one click.

## 5. One change I'd make first
Add a global combat event feed and alert: a toast and sound wherever you are for "PROWLERS AT YOUR DEN", plus a persistent "−2 SHARD · IRON RHINO FELL · KING FELL" log. Right now the most dramatic events in a raid game (being raided and losing stuff) happen silently.
