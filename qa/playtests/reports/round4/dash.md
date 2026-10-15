# dash · round 4 · the ten-second phone player (verification round)

## 1. Who I am & what I tried

One thumb, 390x844 phone viewport the whole time (tester `dash4`). I re-ran every round-3 repro, then played my usual way: join, Dig Mole, Forge Badger, 3 HOWL voices, hunt, prowl RUCKUS, POUNCE and AUTO, then mostly waited for my first dig and forge. That was 74 lab actions over 30 minutes of wall clock (09:33 to 10:03). Every action is timed in `qa/playtests/scratch/dash4/log.txt`.

**Timings (wall clock from opening the title screen at 09:33:19)**

| Moment | Action | Time |
|---|---|---|
| Inside my den | #8 | **0:47** (7 taps, no failures) |
| Dig Mole called / awake | #10 / by #17 | 0:57 / by 2:41 |
| Dig howl estimate | #17 | **"GATHER · ~18M"** |
| Prowled RUCKUS, 7 pounces (AUTO), felled 2 of their kin | #36 to #40 | 5:07 to 5:54. **0 shards.** |
| First dig lands | #56 | **~19:00. Total yield +1 shard.** |
| End of session | #74 | 30:00. **1 shard, 0 alpha**, forge still ~9M away |

## 2. Scores

- **Fun 4/10.** Thirty minutes in, I had one shard and no alpha. The only action I got was pouncing at minute 5, which paid nothing. The page no longer freezes, but the core loop still asks a phone player to stare at a bar for 20 minutes to earn 1 shard.
- **Clarity 4/10.** Up one point. SKY FULL is now on the button, and the kin panel can be closed. But the two howl estimates on screen disagree by 2 to 3 times, "KING FALLS" doesn't say whose king, and nothing tells me how to heal my lion.
- **Beauty 7/10.** Same strong art. Names no longer split or clip on the prey card and pounce screen. "FORGE BADG…" is still cut off, the WHAM damage number is cut off, and the HOWL meter is still clipped at idle.
- **Feel/responsiveness 7/10.** Up from 2/10, and the biggest fix this round. Every tap returned in 0.9 to 2.5 s, and every 60 s wait took 60.0 to 61.5 s, including while howls were hashing on 3 voices. Points off for the HOWL panel sitting on top of controls.
- **Stability 7/10.** No page errors and nothing got stuck. A reload restored the state cleanly in 3.9 s. The meters and the text still disagree.

## 3. Findings

### Round-3 verdicts

| # | Round-3 finding | Verdict | Evidence (round 4) |
|---|---|---|---|
| 1 | Page stops responding while dig/forge howls run | **FIXED** | 60 s waits took 60.0 s while DIG was hashing on 3 voices (#54, #55) and 61.5 s while the badger call was hashing (#25). Taps and navigation took 0.9 to 2.5 s with FORGE hashing (#73, #74). Caveat: I never caught DIG and FORGE both hashing in the same instant. |
| 2 | New den emptied in minutes; raiding pays 9× digging | **PARTLY** | Raiding is no longer free money: 7 pounces and 2 kin felled on RUCKUS earned 0 shards (#38 to #40). But digging still pays **+1 shard per ~17 min** (#56), and there is no shield or protection shown on a new den. Nobody hit me in 30 min, which proves nothing. |
| 3 | FIGHT / PROWL offered after KING FELL lead nowhere | **UNVERIFIED** | My king never fell, so I couldn't reach the precondition. Related: the pounce screen now stops AUTO with "NO SAFE BLOW" / "KING FALLS" (dash4-030), which prevents the situation from my side. My lion stayed at fur 2/6 for 24 min with no heal path (see new finding 3). |
| 4 | HUNT prey list on phone barely shows and rows don't open prey | **FIXED** | The sheet now shows 3 full rows plus a search field and ALL/SHARD/IDLE filters (dash4-010). Tapping a row opens the prey card at once (#12, #32, dash4-011). Leftover: tapping a den dot that sits under the sheet still does nothing (#74). |
| 5 | PROWL on FANG2CLAW only flashes "SKY FULL" | **PARTLY** | The button itself now reads "⏱ SKY FULL" instead of PROWL, so I know before tapping (dash4-011). Tapping it gives "SKY FULL · WAIT" (#13), with no countdown, no reason and no fix. The same card still shows "1 KIN CAN HIT KING" in green. |
| 6 | Glow drains by itself with no explanation | **PARTLY** | Still drains: 610 → 596 → 568 in about 2 min with no spending (#10 → #12 → #17). The GLOW page now has a "CLAN SHARE · SPLIT" chip (dash4-024), but the den and meter show no reason. After that it held at 68 for 25 min. |
| 7 | Kin detail panel can't be closed; hides DIG! payoff | **FIXED** | The panel has an ✕ (dash4-022), Escape closes it (#27), and tapping outside closes it (#29). I couldn't check whether the DIG! burst draws on top, because the HOWL panel was covering the den when the dig landed (new finding 4). |
| 8 | More HOWL voices don't change the estimate | **PARTLY** | Going from 1 to 3 voices moved DIG from ~19M to ~16M (#18 → #20). That is a change, but small, because most of the wait is the GATHER phase, which voices apparently don't speed up. The button doesn't say so. |
| 9 | Top meter overflows at 390 px; alpha meter vs look text disagree | **PARTLY** | At idle the HOWL meter still clips to "Q" behind the shield button (dash4-007). Alpha never left 0, so I couldn't check the alpha mismatch. Pulse still disagrees: the look says `pulse 7336` while the meter says FULL (#71). The POUNCE button says "PULSE 3/3" while the meter shows 6 (dash4-029). |
| 10 | Words split / clipped / small lies | **PARTLY** | **Fixed:** FANG2CLAW is no longer split (dash4-011); DASHPAW4 is fully visible on the prowl screen (dash4-028); my own HUNT row no longer says IDLE (#58); ENTER DEN worked first try (#8). **Still broken:** "FORGE BADG…" (dash4-036); the WORDS step gets a green ✓ after LATER (dash4-004); the name placeholder says "VexTail" while the header says "Warden" (#4). The 5-line loss banner was not retested. |

### New findings

1. **[MAJOR] There is still no reward in the first 30 minutes on a phone**
   - **Where:** #/den, the whole first session
   - **Steps:**
     1. Join (0:47).
     2. Call a Dig Mole and a Forge Badger, and set HOWL to 3 voices.
     3. Prowl and AUTO-pounce the richest prey I could reach.
     4. Wait.
   - **Expected:** a first dig under a minute, or some visible payoff before the ten-second player leaves.
   - **Actual:**
     - The den banner promised "5 SHARD IN GROUND · + DIG MOLE" (#8). The first dig took ~17 min and gave **+1 shard** (#56).
     - The forge of that one shard was still ~9M from done at 30:00.
     - The PvP run felled a Forge Badger and an Iron Rhino and gave **nothing**: no shards and no reward burst (#40).
     - At 30 minutes the scoreboard is ALPHA 0, SHARD 1.
   - **Screenshots:** dash4-007.png, dash4-033.png, dash4-036.png

2. **[MAJOR] The two howl estimates on screen disagree by 2 to 3 times, and the percentages don't match the times**
   - **Where:** den canvas labels over the kin vs the HOWL panel
   - **Steps:**
     1. With DIG and FORGE running, reload (#71). The canvas labels read "DIG ~20M" and "FORGE ~17M" (dash4-036).
     2. Open HOWL 9 seconds later (#72). It reads "DIG ~7M 67%" and "FORGE ~9M 85%".
   - **Expected:** one honest number everywhere.
   - **Actual:**
     - The canvas and the panel disagree by 2 to 3 times at the same moment.
     - FORGE showed "49%" next to "~16M" a minute after starting (dash4-033).
     - The forge estimate fell only 6 min in 9 min of real time (16M at 09:53 → 10M at 10:02). Round 3 praised the honest estimates; that is gone.
   - **Screenshots:** dash4-033.png, dash4-035.png, dash4-036.png

3. **[MAJOR] A wounded Sun Lion never heals, and nothing says how to fix it**
   - **Where:** #/den, KIN tray, after a prowl
   - **Steps:**
     1. Prowl RUCKUS and AUTO-pounce. My Sun Lion takes return damage and drops to fur 2/6 (#40).
     2. Go HOME and wait 24 minutes (#41 to #74).
   - **Expected:** fur regenerates, or a HEAL / NAP control and a timer.
   - **Actual:** still 2/6 at 10:03. The tray shows the same lion art with no wound state. One more hit fells my king, and the game doesn't tell me.

4. **[MINOR] The HOWL panel follows me across routes and covers controls and payoffs**
   - **Where:** HOWL meter panel, any route
   - **Steps:**
     1. Open HOWL on #/den.
     2. Tap CALL (#21): nothing happens, because the CALL bar is under the panel.
     3. Go to #/hunt (#58). The panel now covers the PREY header and the − / + zoom (dash4-034).
     4. Leave it open while the dig lands (#56).
   - **Expected:** the panel closes on a route change or a tap outside, and bursts draw on top.
   - **Actual:** only ✕ or Escape close it, so the one reward moment of my session (DIG +1) happened behind it.
   - **Screenshots:** dash4-016.png, dash4-033.png, dash4-034.png

5. **[MINOR] The pounce screen is ambiguous and cut off at 390 px**
   - **Where:** #/prowl/1-57
   - **Ambiguous words:**
     - The header says "POUNCE THEIR KING", but the default target was their FORGE BADGER (dash4-028).
     - Under the same header, "KING FALLS" in big red means *my* king would fall, not theirs (dash4-030).
     - "NO SAFE BLOW" is the only hint that AUTO stopped on purpose.
   - **Clipped and stale:**
     - The "WHAM! −2" damage number is cut off at the right edge (dash4-029).
     - The POUNCE button keeps saying "PULSE 3/3" while the meter shows 6 and the look shows pulse 2 (#38).
   - **Screenshots:** dash4-028.png, dash4-029.png, dash4-030.png

6. **[MINOR] Felling enemy kin gives no visible result**
   - **Where:** #/prowl, AUTO
   - **What happened:** the deed log shows 7 successful pounces, including 3 on their Iron Rhino and 3 on their Forge Badger (#40).
   - **Missing:**
     - No "FELLED!" burst.
     - No loot.
     - Their prey row still shows ◆17 (#58).
   - **Expected:** I can't tell whether I achieved anything, and that is the opposite of the ten-second hit.

7. **[MINOR] Prey idle times jump around, and duplicate chief names are shown side by side**
   - **Where:** #/hunt PREY list
   - **Steps:** read the list at #11, #58 and #74.
   - **Expected:** idle times only grow, and two chiefs can't share a name.
   - **Actual:**
     - FANG2CLAW reads IDLE 21H → 23H → 21H.
     - RUCKUS reads IDLE 11H → 12H → 11H.
     - Two different "FANG2CLAW" chiefs (◆19 and ◆3) are listed next to each other, which makes it easy to pick the wrong one.
   - **Screenshots:** dash4-010.png, dash4-034.png

8. **[POLISH] Toasts sit on top of the PREY list and the deed log skips the dig**
   - **Where:** #/hunt PREY sheet; DEEDS list
   - **Toast:** the "✓ CALL · DIG MOLE" toast covers the 4th prey row (dash4-010).
   - **Deed log:**
     - The DEEDS list never recorded the dig completing; it shows only pounces and PACK · HOME (#57).
     - The only trace of my first reward is the shard meter ticking from 0 to 1.

## 4. Delights

- **The stall is gone.** Every tap and 60 s wait returned in real time, even with three voices hashing. Round 3 was unplayable after minute 20; this round never hitched once.
- **Join is faster still.** I was in my den in 47 seconds with no failed taps, down from 2:12.
- **The HUNT sheet is now usable one-handed.** It has search, ALL/SHARD/IDLE filters, three readable rows, and a tapped row opens the card right away.
- **The kin panel behaves.** It has an ✕, closes on Escape, and closes on a tap outside.
- **AUTO with "NO SAFE BLOW"** stopped me before I suicided my king. That is the right instinct; it just needs clearer words.

## 5. One change I'd make first

Make the first dig short and big: under 60 seconds and at least the "5 SHARD" the banner promises, with the burst drawn on top of every panel. The page now stays responsive, so the remaining reason a phone player quits is that nothing pays off in the first half hour.
