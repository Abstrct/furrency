# ruckus · round 3 playtest report

## 1. Who I am & what I tried

ruckus, the PvP sweat, on desktop at 1280x800. I play to win and call everything rigged. I joined (skipped the words with LATER), called a Comet Fox, Star Bear and Iron Rhino in about 90 seconds, then raided four real dens: JORDANJ +9, MUSEMANE +2, DASHPAW +10 and GRIZZLE +5. While I was out, DASHPAW took 9 shards from me. I also re-raided GREMLIN to try a double snatch. I hammered POUNCE (four parallel clicks), double-clicked AUTO, reloaded mid-forge, and tried the richest den (FANG2CLAW ◆19) three times. I finished at 18 shards and 0 alpha, with the forge on ~30 minutes. About 70 lab actions.

## 2. Scores

- **Fun 7**: The raid loop is quick and violent: prowl, three pounces, SNATCH!, done in under a minute. The revenge banner is great. But no fight was ever in doubt.
- **Clarity 4**: GUARD KING, SKY FULL, FULL, FREE HIT, the PULSE 8+ badge and "3/5 vs 3/3" all needed guesswork. Nothing told me that prowling leaves my den empty.
- **Beauty 8**: The fight screen is a real comic page: KING DOWN, WHAM stacks, the split cyan and pink arena. Den banners cover my own Star kin, though.
- **Feel/responsiveness 6**: Prowl and pounce land in about a second. A forge is quoted at ~32 minutes and I couldn't skip it. The HOWL panel said "idle 0/18" while it also said "GATHER 16%".
- **Stability 6**: Chain deeds never failed and parallel clicks didn't double-spend. From about 22:18, screenshots and `reload` hung for 45–100 s ("eval: no answer in 90000ms") with host load average at 73–104. That is probably shared-machine load, but the page was unusable for screenshots for the last 20 minutes.

## 3. Findings

**[MAJOR] Prowling takes your whole den with you, king included, and the "GUARD KING" step suggests the opposite**
- Where: #/prowl fight screen, GUARD KING · IRON RHINO, then PROWL; then #/den.
- Steps: Join and call Star Bear, Comet Fox and Iron Rhino. Snatch some shards (I had 9 from JORDANJ). Go to #/hunt, select MUSEMANE and press the panel PROWL. Earlier, at FANG2CLAW, the game had made me press "GUARD KING · IRON RHINO" first (deed `GUARD · IRON RHINO → SUN LION`). Fight with AUTO.
- Expected: Something on screen says your den is empty while you're away (KING AWAY, DEN OPEN, ◆9 at risk). The guard should keep the king home guarded.
- Actual: `pack AWAY at 2-11` takes the Sun Lion and the "guard" rhino too. Within the same minute a toast read "PROWLERS! · DASHPAW DEFEND", and my shards went 9 → 0 with my king still at 6/6. Nothing was killed: the den was simply empty. The only warning was a toast that vanished while I was on another den's fight screen.
- Screenshot: qa/playtests/shots/ruckus-032.png (LOST · −9 SHARD banner). ruckus-030.png shows my king fighting at MUSEMANE.

**[MAJOR] Combat is rigged for the attacker: Star Bear can't be hit back, and the counter-move takes ~30 minutes**
- Where: #/kin, #/prowl, HOWL panel.
- Steps: Call a Star Bear (135 glow, call is "STEADY", ~15 s). Prowl to any king and POUNCE or AUTO. Afterwards check KIN fur in the look.
- Expected: Defenders bite back, and raiding costs roughly what protecting costs.
- Actual:
  - In four raids my kin never lost a single heart (Star Bear fur 3/3 throughout). The preview always said "FREE HIT".
  - #/kin explains why. SUN LION "HITS OWN ZONE" (ROOT) only, while STAR BEAR sits in STAR and "HITS ROOT TIDE STAR · DMG 2 · 2 · JAM", so a king can never touch it.
  - Comet Fox is strictly worse for 35 less glow: it hits STAR only, DMG 2 · 1, no skill.
  - A whole raid takes 20–60 s (three pounces, then an automatic snatch). Turning the shards into unstealable alpha is quoted "FORGE GATHER · ~32M" in the HOWL panel. "More paws" ×3 only moved that to ~27M.
  - Shards are free loot for anyone with one bear. Pay-to-win isn't the word; first-bear-wins is.
- Screenshot: qa/playtests/shots/ruckus-020.png (KING DOWN with no damage to me).

**[MAJOR] The richest den can't be reached: PROWL stays live but only toasts "SKY FULL"**
- Where: #/hunt → FANG2CLAW ◆19 (the IDLE 10H one) → PROWL. Also #/den/1-17 → PROWL THIS DEN → PROWL 19 SHARD.
- Steps: Select FANG2CLAW ◆19 and press the panel PROWL. I tried at 22:06, 22:13 and 22:41.
- Expected: Either the prowl works, or the button is disabled with a reason the player understands: whose sky, and when it frees.
- Actual:
  - Every press toasts "SKY FULL" and nothing happens. No deed is created.
  - The hunt card still says "3 KIN CAN HIT KING". The fight screen shows a bright pink PROWL · 19 SHARD with a small "FULL" tag under it.
  - I have no SKY kin at all, so "SKY FULL" reads as nonsense.
  - The peek shows "PROWLED / PROWLERS!", so other packs are probably parked there, but the game never says so.
  - This lasted at least 35 minutes. The best target on the map is permanently camped and the UI pretends it isn't.
- Screenshot: qa/playtests/shots/ruckus-028.png. The peek is ruckus-022.png.

**[MAJOR] PROWL THIS DEN from PEEK leads to a main button for a different action, on the wrong side**
- Where: #/den/1-17 (peek) → PROWL THIS DEN → #/prowl/1-17.
- Steps: Peek FANG2CLAW and press PROWL THIS DEN.
- Expected: A big PROWL button.
- Actual:
  - The big button is "GUARD KING · IRON RHINO", in the middle of the opponent-facing screen, while their own Iron Rhino is highlighted as the target. I read it as "their rhino guards their king". It actually means "make *your* rhino guard *your* king", and pressing it spent my pulse.
  - The "PROWL · 19 SHARD" chip in the step bar looks like a button but isn't one: tapping it at (888,91) did nothing.
  - "FREE HIT · FELL 0%" is shown before I have even prowled.
- Screenshot: qa/playtests/shots/ruckus-023.png.

**[MINOR] The hunt list shows stale shards, which lures you into empty raids (no double snatch, which is good)**
- Where: #/hunt list and card for GREMLIN.
- Steps: Raid GREMLIN ◆1 to "SNATCH! +1 SHARD". Return to #/hunt and search GREMLIN.
- Expected: GREMLIN shows ◆0 (or no shard badge) and KING DOWN.
- Actual: The card still says "SHARD 1 SHARD · KING DOWN". Prowling again auto-starts "HOLD · SNATCHING" and ends in "SNATCH · EMPTY". My total stayed 13, so no exploit, but the trip was wasted and my den was emptied for nothing.

**[MINOR] The PAY BACK banner outlives the payback and loses the name after a reload**
- Where: #/den banners.
- Steps:
  1. Get raided by DASHPAW.
  2. Press FIGHT on "PAY BACK · DASHPAW", prowl, and snatch +10 back from DASHPAW.
  3. Return to #/den.
  4. Reload.
- Expected: The banner clears or reads "PAID BACK".
- Actual: It still says "PAY BACK · DASHPAW FIGHT". After the reload it says "PAY BACK · THEM" and "LOST · PROWLED · −9 SHARD · PROWLED" (the attacker's name is gone). Before the reload, "PROWLED" appears twice in one line. Clicking SEEN by its words did nothing; clicking it by its number [17] worked.

**[MINOR] Den banners cover your own Star-zone kin**
- Where: #/den canvas, top (STAR) row.
- Steps: Call a Comet Fox and a Star Bear (both go to STAR) and stay on #/den while the "WORDS NOT KEPT", "5 SHARD IN GROUND" or "LOST…" banners are up.
- Expected: I can see my fighters.
- Actual: Both STAR kin and their "CALLING 22%" labels sit under the banners. Only stray ring edges show. After the raid banner appears, the fox and bear can't be seen at all.
- Screenshots: qa/playtests/shots/ruckus-013.png, ruckus-032.png.

**[MINOR] Pulse numbers don't mean anything**
- Where: CALL dialog cards, the fight POUNCE button, the top PULSE meter.
- Steps: Call a Star Bear (pulse drops to 4). Within about a second, reopen CALL and pick IRON RHINO (card says "PULSE 8+"). Then pounce twice.
- Expected: An action under 8 pulse is blocked, or the badge means something else and says so.
- Actual:
  - `CALL · IRON RHINO → success` with pulse 3–4.
  - The POUNCE label goes "PULSE 5/5" → "3/5" → "3/3" (the denominator changes).
  - The top meter flips FULL → 3 → FULL within seconds.
  - Pulse never limited me once. The text look and the screenshot disagreed too: PULSE 3 in the look, 64 in shot ruckus-013.png.

**[MINOR] AUTO and repeated POUNCE do things you didn't pick**
- Where: #/prowl fight, AUTO toggle and POUNCE.
- Steps:
  1. (a) At JORDANJ, POUNCE the selected "Their kin: SUN LION" and the king falls.
  2. Press POUNCE again during "HOLD · SNATCHING".
  3. (b) At DASHPAW, click AUTO twice.
- Expected: (a) The second pounce is blocked, or it hits the target shown. (b) A second click turns AUTO off and attacks stop.
- Actual:
  - (a) The deed reads `POUNCE · STAR BEAR → JORDANJ·IRON RHINO`: it silently retargeted to their rhino.
  - (b) After the second click AUTO showed off, yet three POUNCE deeds landed and the king fell anyway.
  - The good part: four truly parallel POUNCE clicks at GREMLIN collapsed into one deed, so pulse wasn't double-spent.

**[POLISH] Duplicate chief names, and a placeholder name leaks during join**
- Where: #/hunt list and canvas; the JOIN → NAME · CLAN step.
- Steps: Search "FANG" in #/hunt. During join, look at the status line versus the name field.
- Expected: Unique names, or a tag that tells them apart. The header shows the name being typed.
- Actual:
  - Two "FANG2CLAW" dens (canvas targets c0 and c55), one ◆19 IDLE 10H and one IDLE 3M. The only difference is the idle time, so I raided the wrong one at first.
  - During join the header said chief "Warden" while the name field said "VexTail".
  - A chief named "___" is also listed.

## 4. Delights

- The win screen is pure comic payoff. SNATCH!, KING DOWN, stacked WHAM!s, −2 bursts and the BLOWS log made every raid feel like a splash page (ruckus-020.png, ruckus-035.png).
- The revenge loop. "LOST · −9 SHARD · DASHPAW" became "PAY BACK · DASHPAW FIGHT", which dropped me on DASHPAW's fight screen in one click. I got my shards back plus one.
- Hammering is safe. Four parallel POUNCE clicks produced one deed with no double-spend, and re-raiding an empty den gives "SNATCH · EMPTY", not free shards.
- The forge howl survived a mid-howl reload, and calls are quick. The first fighter was awake in about 10 s.
- The PICK → PROWL → KING → SNATCH step bar and the HIT/DMG/FELL preview tell a sweat exactly what the next pounce will do.

## 5. One change I'd make first

Make leaving home a visible decision. When the pack prowls, flash "DEN OPEN · KING AWAY · ◆N AT RISK" on the PROWL button and keep a persistent den-under-attack alert (not a toast) for as long as the pack is away. Let a GUARD kin actually stay home. Right now the best defence is never attacking, and the game never tells you that.
