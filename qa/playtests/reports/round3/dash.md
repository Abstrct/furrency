# dash · round 3 · the ten-second phone player

## 1. Who I am & what I tried

One thumb, 390x844 phone viewport the whole time, between classes. I timed everything from opening the game to my first real reward.

I went through JOIN (new paw, skipped the words, typed a name, took the Devnet clan), called a Dig Mole, then a Forge Badger, turned the HOWL voices up, hunted, got refused prowling FANG2CLAW, prowled RUCKUS, snatched 9 shards, lost my king and every shard to a payback raid, and tried the FIGHT / PROWL payback.

That was 55 lab actions over about 75 minutes of wall clock. From about minute 21 on, each single action took 2 to 12 minutes to return.

**Timings (action # / wall clock from opening the title screen)**

| Moment | Action | Time |
|---|---|---|
| Title screen | #1 | 0:00 |
| Inside my den | #9 | 2:12 (7 taps plus typing a name; one tap failed on a race) |
| Dig Mole called / awake | #11 / #13 | 3:07 / 4:19 (the "~1m" estimate was honest) |
| Dig howl estimate | #14 | **"SLOW · ~17M"** |
| **First real reward: SNATCH +9 shards from RUCKUS** | **#44** | **18:39**. It came from PvP. Digging had produced nothing yet. |
| Dig finished | ~#50 | ~22–27 min. **Total yield +1 shard** (9 → 10) |
| Lost: KING FELL, −10 shards (prowled by RUCKUS) | #51 | by ~27:17. Everything I owned was gone about 9 minutes after I got it |
| First alpha (meter shows 1.00, look text still says 0) | #54 | ~40–52 min |

## 2. Scores

- **Fun 4/10.** The SNATCH! burst at minute 18 was the only rush. Before it came 15 minutes of watching a progress bar. Within 9 minutes I had lost it all, and the revenge button didn't work. I would not come back tomorrow.
- **Clarity 3/10.** I hit "SKY FULL", "NO KING" and "1 KIN CAN HIT KING" with nothing to explain them. My glow drained by itself. The FIGHT button and the PROWL button went nowhere after my king fell, and nothing said how or when he comes back.
- **Beauty 7/10.** The title screen, the comic bursts and the beasts look great at phone size. The score is held back by mid-word splits, clipped names and a 5-line loss banner.
- **Feel/responsiveness 2/10.** Taps were snappy for the first ~20 minutes. Once the dig and forge howls were running, the page stopped answering: one tap took 12 minutes.
- **Stability 3/10.** I got no page errors, but the game was effectively frozen for the last ~45 minutes of the session. The text look and the meters disagreed on alpha (0 vs 1.00).

## 3. Findings

1. **[BLOCKER] Page stops responding while the dig and forge howls run**
   - **Where:** any route, any control, after DIG and FORGE howls are active
   - **Steps:**
     1. Phone viewport, join, call a Dig Mole and a Forge Badger.
     2. Open HOWL and press `+` twice (3 voices).
     3. Get some shards so FORGE starts.
     4. Do anything: `{"wait":60000}`, `{"tapxy":[200,180]}`, a plain `look`, `{"click":"FIGHT"}`, `{"click":"PROWL 13 SHARD"}`.
   - **Expected:** a tap answers in under a second, with hashing kept in the background.
   - **Actual:** the 60 s wait took about 4.5 min (#49–50). A tap took about 5.5 min (#51). A plain look took 4 min 0 s. FIGHT took 3 min 10 s (#53). PROWL took **12 min 07 s** (#54). Navigating back to the den (#55, `{"goto":"#/den"}`) **never returned**: I abandoned it after 21+ minutes, so I couldn't confirm whether my king ever came back.
   - **Caveat:** 10 testers share this machine, so CPU contention may contribute. The lab's own `/testers` endpoint still answered in 1 ms, so the stall is in my game page. On a real phone this is an "app frozen, close it" moment.
   - **Screenshots:** `qa/playtests/shots/dash-032.png`, `dash-034.png`

2. **[MAJOR] A new den is emptied within minutes; raiding pays 9 times more than digging**
   - **Where:** #/den, #/hunt, #/prowl
   - **Steps:**
     1. A fresh chief with only a Sun Lion, a Dig Mole and a Forge Badger (no pack beasts) taps the RUCKUS den, then PROWL (#44).
     2. That instantly snatched +9 shards from a player who had been active 2 minutes earlier. There was no fight and the enemy side was empty (dash-029).
     3. About 9 minutes later RUCKUS felled my king and took all 10 shards. They were already in "10 SHARD · FORGING", so shards are still stealable while they're being forged.
     4. Meanwhile the 17-minute dig yielded **+1 shard**.
   - **Expected:**
     - Some new-player protection, such as a shield for the first N minutes or forging shards being safe.
     - Digging is worth doing.
   - **Actual:** one tap of PvP earns 9 shards, 17 minutes of digging earns 1, and a new den is wiped before its first forge finishes.
   - **Screenshots:** `dash-029.png`, `dash-034.png`

3. **[MAJOR] After KING FELL, the game offers FIGHT and PROWL buttons that can't work**
   - **Where:** #/den banner "PAY BACK · RUCKUS · FIGHT", then #/prowl/1-57 "PROWL 13 SHARD"
   - **Steps:**
     1. Lose your king to a prowl.
     2. Tap FIGHT on the den banner. It goes to the prowl screen showing "NO KING" and "NO PACK", with a big enabled PROWL button.
     3. Tap PROWL. You get a "NO KING" toast and nothing else.
   - **Expected:** either no revenge button while kingless, or a clear "KING BACK IN 5M" countdown or a way to bring him back.
   - **Actual:** two dead-end calls to action. Nothing anywhere says how or when the Sun Lion returns; he is simply gone from the kin tray.
   - **Screenshots:** `dash-034.png`, `dash-035.png`, `dash-036.png`

4. **[MAJOR] The HUNT prey list on phone barely shows and doesn't open prey**
   - **Where:** #/hunt, PREY sheet
   - **Steps:**
     1. Open HUNT on phone. The PREY sheet covers the bottom ~40% of the screen but shows only 1.5 rows (my own row, then a cut-off FANG2CLAW).
     2. Tap the FANG2CLAW row (#16) or the JORDANJ row (#22). Nothing visible happens.
     3. Tap `c1` (the JORDANJ den, which sits under the sheet) (#23). Still nothing.
   - **Expected:** tapping a prey row opens its card.
   - **Actual:** the only way I found was to tap a row (which seems to quietly re-centre the map), then tap the matching den dot inside the crowded sun disc. With one thumb that is several tries per target.
   - **Screenshots:** `dash-013.png`, `dash-018.png`, `dash-019.png`

5. **[MAJOR] PROWL on FANG2CLAW only flashes "SKY FULL" and does nothing**
   - **Where:** #/hunt, FANG2CLAW prey card, PROWL
   - **Steps:**
     1. Open the FANG2CLAW card. It shows "1 KIN CAN HIT KING" and Guards · Pack "1 · 4".
     2. Tap PROWL (#18, and again at #40).
   - **Expected:** a prowl starts, or a reason I can understand ("THEIR SKY IS FULL · NEED FLYER", or similar).
   - **Actual:** a short "SKY FULL" toast. It isn't even visible in the screenshot taken right after. The pack stays HOME and the card stays open.
   - **Screenshots:** `dash-016.png`, `dash-027.png`

6. **[MINOR] Glow drains by itself with no explanation**
   - **Where:** top GLOW meter, #/glow
   - **Steps:**
     1. Join. Glow shows 1,639.
     2. Spend 500 on the Dig Mole and do nothing else.
     3. Watch it fall: 1,109 → 1,080 → 1,052 → 999 → 973 → 925 over about 4 minutes.
   - **Expected:** the number moves only when I spend, or a sign says why it moved.
   - **Actual:** the GLOW page shows "OWN 0 · CLAN SHARE 1,477 · LINK 65 DENS", so my share shrinks every time someone joins. A phone player only sees their power leaking away.
   - **Screenshots:** `dash-009.png` to `dash-013.png`, `dash-022.png`

7. **[MINOR] The kin detail panel can't be closed on phone and hides the DIG! payoff**
   - **Where:** #/den, tap FORGE BADGER
   - **Steps:**
     1. Tap the Forge Badger. The panel covers the middle of the den and has no ✕.
     2. Press Escape (#48). It stays open.
     3. Tap the empty sky with `tapxy [200,180]` (#51). It stays open.
     4. While it is open, the dig finishes and the "DIG!" burst draws *behind* it.
   - **Expected:** a ✕, tap-outside to close, and celebration bursts drawn on top of panels.
   - **Actual:** the panel stuck through 4 more actions, and the only dig reward moment I got was hidden.
   - **Screenshots:** `dash-030.png`, `dash-032.png`, `dash-034.png`

8. **[MINOR] More HOWL voices don't change the estimate**
   - **Where:** HOWL meter → `+` (More paws)
   - **Steps:**
     1. With DIG at 29% and "~12M" on 1 voice, press `+` twice (3 voices).
     2. Read the bar: 34% "~12M", then 37% "~11M" about a minute later.
   - **Expected:** tripling the voices visibly speeds things up, or the button says why it doesn't.
   - **Actual:** the estimate is unchanged, so the only "go faster" button feels fake.
   - **Screenshots:** `dash-020.png`, `dash-021.png`, `dash-022.png`

9. **[MINOR] The top meter bar overflows at 390 px, and alpha disagrees between the meter and the look text**
   - **Where:** top meter bar, #/prowl
   - **Steps:** once alpha becomes non-zero, read the meter bar.
   - **Expected:** all meters fit, and the look text matches the meter.
   - **Actual:**
     - The ALPHA meter reads "1.00" and widens, pushing the HOWL meter partly off the right edge.
     - At the same moment the look text reports `alpha 0 · ALPHA 0`.
     - Earlier, the meter read PULSE "51" while the look text said "PULSE 2" (dash-009).
   - **Screenshots:** `dash-036.png`

10. **[POLISH] Words get split, clipped and crammed, and a few small lies**
    - **Where:** various
    - **Text and layout:**
      - The prey card splits "FANG2C / LAW" mid-word (dash-015).
      - "DASHPAW" is clipped behind the VS burst on every prowl screen (dash-028, dash-035).
      - The kin tray shows "FORGE BADG…" (dash-024).
      - The loss sign is a 5-line wall: "LOST · KING FELL · −10 SHARD · PROWLED · RUCKUS" (dash-034).
      - The "WELCOME"-style banner at the top of the den is cut off ("OME!") (dash-007).
    - **Small lies:**
      - The WORDS step shows a green ✓ after I tapped LATER (dash-006).
      - My own HUNT row says "IDLE 3M → 6M" while I'm actively tapping.
      - "ENTER DEN" failed once with "no control" because the dialog was still re-rendering (#8).
      - The name field placeholder said "VexTail" while the header said chief "Warden".

## 4. Delights

- **The title screen** reads in one second on a phone. The JOIN and PEEK buttons are big, thumb-sized and obvious.
- **Join is fast.** I was in my den in 2:12 with one typed field, a dice button for a name, and the clan pre-picked as "BEST FIRST".
- **The SNATCH! burst plus "+9 SHARD!"** is exactly the hit a ten-second player wants. More of this, sooner.
- **The call estimates are honest.** "CALL ~1m" became AWAKE in about 72 s, with a clear "UP!" burst.
- **The loss sign names who hit you** and offers payback right away. The idea is right, even though the button is broken (finding 3).

## 5. One change I'd make first

Give a new den a real reward in the first 60 seconds and keep it safe until it lands:
- The first dig should be quick (under a minute) and pay out visibly on top of everything.
- New dens and forging shards should be unsnatchable for the first ~30 minutes, with the shield shown on the den.

Then fix the howl stall (finding 1). Without that, nothing else matters on a phone.
