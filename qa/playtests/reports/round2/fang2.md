# Playtest report: fang2 (Fang2claw, den 1-17), desktop 1280x800, round 2

## 1. Who I am & what I tried
I played a PvP raider. I joined in about 6 actions (12:04–12:05) and called a fighter in every lane: Iron Rhino (ROOT), Storm Hare (SKY), Fang Walrus (TIDE) and Star Bear (STAR). I also called a Dig Mole and a Forge Badger.

I ran 9 raids in about 22 minutes, all of them won. Three hit round-1 dens (SAGEKEEPER, ROOK, NOVAPAW) plus GLYPHPAW. Four hit round-2 testers: NOVA2PAW and PIP2TAIL twice each, GLYPH2EAR and ECHO2WHISK once each. I went from 0 to 19 shards. I tried manual POUNCE, AUTO, both chip cyclers, choosing targets by tapping the canvas, PEEK → PROWL THIS DEN, and a refused POUNCE. I spent about 80 actions.

**Raid timeline (local time, for cross-checking victims' reports):**
| Victim | PROWL | Blows / KING DOWN | Result |
|---|---|---|---|
| SAGEKEEPER | 12:07:25 | 12:07:59, ~12:08:20, 12:08:48 king fell | +5 shard |
| ROOK | 12:09:45 | 12:10:18; AUTO 12:10:40, king fell ~12:10:45 | +4 shard |
| **NOVA2PAW** | 12:12:13 | 12:12:30, :34, :39 king fell | SNATCH · EMPTY |
| **PIP2TAIL** | 12:13:39 | 12:13:48 one blow, king fell (king already at 2/6) | +1 shard ~12:13:50 |
| **GLYPH2EAR** | 12:14:34 (via PEEK) | 12:14:43, :45, ~12:15:08 king fell | SNATCH · EMPTY |
| **ECHO2WHISK** | 12:15:32 | AUTO 12:16:09–:15, king fell ~12:16:15 | SNATCH · EMPTY |
| NOVAPAW | 12:21:57 | AUTO 12:22:01–:03 | +3 shard |
| GLYPHPAW | 12:22:32 | AUTO 12:23:00–:01 | +3 shard |
| **NOVA2PAW** (2nd) | 12:27:58 | 12:28:05, :08, :18 king fell | +1 shard ~12:28:22 |
| **PIP2TAIL** (2nd) | 12:28:51 | AUTO 12:29:20: Gust Ferret MISS·JAM, then ferret fell, king fell | +1 shard ~12:29:30 |

Incoming raids:
- 12:18:19: a "PROWLERS! · PIP2TAIL · DEFEND" toast and a DEFEND control appeared in the look while I was on #/kin. It was gone by 12:18:52.
- Between 12:16:37 and 12:17:04, my Storm Hare vanished with no message (see finding 1). Pip2tail should be able to confirm or deny attacking me around then.

## 2. Scores
- **Fun 8**: Hunt, prowl, AUTO and +N SHARD! takes about 10 seconds now and feels greedy in a good way. Getting revenge-prowled by PIP2TAIL made the devnet feel alive. It loses a point because defending barely matters: every king I hit died in 1–3 blows and nobody hit back.
- **Clarity 7**: Big improvement. The cycling striker/prey chips show HIT/DMG/FELL plus a verdict, and a refusal is now stated three ways ("NO REACH · ROOT"). Points lost for kin that vanish silently, a hunt list that shows stale shard counts, and enemy fur pips I can't read.
- **Beauty 8**: The VS lane screen is still gorgeous, and WHAM!/−2 now rise above the target's head. But KING DOWN! + SNATCH! + WHAM! still pile on top of each other into "KISNATCH!", over the middle of the board.
- **Feel/responsiveness 8**: Prowls, pounces and snatches land in a second or two, and AUTO finishes a whole raid in about 10 s. Snatches finished so fast I never saw HOLD · SNATCHING on screen. Screenshots never hung this round.
- **Stability 7**: No page errors and no hangs. Problems: one kin vanished unexplained, the hunt list shows stale shard and idle data, and the lab's "control is gone" errors come from the POUNCE label changing as pulse refills.

## 3. Findings

1. **[MAJOR] A pack kin vanished from my den with no alarm, no FELL message, and no attacker name**
   - Where: global (I was on #/den, then #/hunt)
   - Steps:
     1. At 12:16:37 my den showed 6 kin, including STORM HARE (SKY, 3/3 fur).
     2. At 12:16:56 I called a Forge Badger (−500 glow, 3,561 → 3,061).
     3. At 12:17:04 on #/hunt, STORM HARE was gone from KIN and the PACK panel, and glow had risen +125 to 3,186 (exactly Storm Hare's call cost).
   - Expected: if it was killed, a "POUNCED · NAME" or "STORM HARE FELL" alarm (that is what the new alarms promise). If it was dismissed or refunded (cap or upkeep), say so.
   - Actual: Nothing. No toast, no SIGNS, and the den SKY slot was simply empty. A PROWLERS! · PIP2TAIL toast showed up 75 s later (12:18:19), while I was on #/kin. Calling a Gust Ferret into the empty slot afterwards did not remove anything else, so it does not look like a kin cap.
   - Screenshot: qa/playtests/shots/fang2-023.png (hare present), fang2-027.png (SKY slot empty)

2. **[MAJOR] The PROWLERS! alarm is short-lived and did not show up in the screenshot**
   - Where: #/kin, global toast
   - Steps: Stay on #/kin while PIP2TAIL prowls my den.
   - Actual:
     - The 12:18:19 look listed "PROWLERS! · PIP2TAIL DEFEND" and a DEFEND control.
     - The screenshot taken in the same request (fang2-025.png) shows only the KIN cards: no banner and no toast.
     - The alarm was gone by 12:18:52, and the den showed nothing afterwards.
   - Expected: The alarm is visible on screen, and stays at least until the prowl ends or the player looks at it.
   - Note: The attacker name in the alarm is a clear round-1 fix. It just needs to stay up long enough to see.
   - Screenshot: fang2-025.png, fang2-026.png

3. **[MAJOR] The hunt list and prey panel show stale shard counts after a raid**
   - Where: #/hunt prey list and the selected-den panel
   - Steps: Snatch 4 shards from ROOK at ~12:10:45, then reopen ROOK on HUNT.
   - Expected: ROOK shows SHARD NONE.
   - Actual:
     - Two minutes later the list still showed "ROOK ◆4", and the panel said "SHARD 4 · KING DOWN".
     - My own row read "◆5" while I held 9, then "◆10" while I held 16.
     - "IDLE 2M–4M" showed seconds after I had acted.
   - Impact: A raider picks targets by ◆ count, so stale numbers send packs to empty dens.

4. **[MINOR] Combat stickers still stack into an unreadable "KISNATCH!" and cover kin**
   - Where: #/prowl/<id> at the moment the king falls
   - Actual: KING DOWN!, SNATCH! and WHAM! all spawn in the middle at once and overlap (see the shots). They cover my Iron Rhino and the middle of the enemy board. WHAM!/−2 on single blows now sit nicely above the target's head (fixed). The king-down/snatch splash pair is not.
   - Screenshot: fang2-008.png, fang2-012.png, fang2-017.png, fang2-033.png

5. **[MINOR] The BLOWS panel covers my own kin**
   - Where: #/prowl, bottom-left
   - Actual: The BLOWS log grows upward with each blow and hides my Fang Walrus (TIDE lane) and, after 4–5 blows, my Sun Lion.
   - Screenshot: fang2-009.png, fang2-033.png

6. **[MINOR] The HOME button stays after the pack auto-returns, and still logs a pointless deed**
   - Where: #/prowl after the snatch
   - Steps: After +5 SHARD!, the look says "pack HOME", but HOME is still shown. Clicking it logs "PACK · HOME → success".
   - Expected: The HOME button hides or changes to a "PACK HOME ✓" chip. (This is the same as round 1, finding 4.)
   - Other leftovers after the fight:
     - The guard's dashed targeting line from my Iron Rhino to their Dig Mole stays drawn.
     - On an empty den the HOME button sits on top of the VS badge (fang2-016.png).

7. **[MINOR] AUTO quietly assigns a guard and uses that guard for the killing blow**
   - Where: #/prowl AUTO
   - Actual: The first AUTO on ROOK fired "GUARD · IRON RHINO → SUN LION" without asking. In 5 of 5 AUTO raids, the final blow was "YOUR IRON RHINO → THEIR SUN LION", meaning the guard left the king to strike. (This is the same as round 1, finding 6.)
   - Separately, the "SNATCH!" toast fires even when the banner says "SNATCH · EMPTY".

8. **[MINOR] Enemy fur pips read the opposite way to mine**
   - Where: #/prowl, pips under the enemy kin
   - Actual: My kin's pips are filled pink for fur left. The enemy's pips are hollow squares that turn dark as fur is lost, so a full-health enemy king looks "empty". Combined with the faded or dim look some enemy kings have (ROOK, PIP2TAIL), I couldn't judge an enemy's health without reading BLOWS.
   - Screenshot: fang2-006.png, fang2-032.png

9. **[POLISH] The verdict chip repeats the stat, and the meters disagree**
   - The odds row can read "HIT 33% · DMG 2 · FELL 33%" with the verdict chip also saying "FELL 33%". When it's a gamble, the verdict should be a word (e.g. RISKY).
   - The look's pulse counter climbs past 1,500 while the meter says FULL and POUNCE says "PULSE 5/5". The POUNCE cap still flips between 5/5 and 3/3 depending on the striker, which nothing explains. (This partly overlaps round 1, finding 9.)
   - The CALL · ROOT dialog showed GLOW 4,978 while the meter showed 5,572 right after joining.

10. **[POLISH] The den banners still hide the Star Bear, and a lab-side note**
    - The "N SHARD · AT RISK / FORGING" banner sits on the STAR lane, so only the Star Bear's ears and its label show (fang2-023.png).
    - Lab-side: the POUNCE label includes the live pulse ("POUNCE PULSE 4/5"), so clicking by number often fails with "control is gone" between a look and the click. I had to do a fresh look before every pounce.
    - Minor for the game, but the lab tooling might want to match labels by prefix.

## 4. Delights
- **The strike panel chips cycle, and the striker re-picks itself to fit the chosen prey.** Tapping an enemy on the canvas also sets the prey. Choosing who hits whom finally feels like a real decision.
- **POUNCE always explains a refusal:** "NO REACH · ROOT" appears as a verdict chip, under the button, and as a toast. No more silent no-ops.
- **The screen no longer goes stale when a king falls.** The prey chip jumps to the next kin, the odds flip from FELL IT back to FREE HIT, and after the snatch the strike panel cleanly gives way to "✓ PICK ✓ PROWL ✓ KING ✓ SNATCH · +N SHARD!".
- **AUTO plus a fast snatch:** A full raid (prowl, 3 pounces, snatch, pack home) takes about 10–15 seconds, and the step bar along the top makes progress obvious.
- **The PROWLERS! alarm now names the attacker** (PIP2TAIL) and offers DEFEND from a non-den screen, a clear round-1 fix.

## 5. One change I'd make first
Make every loss at my den a persistent, named event: "STORM HARE FELL · PIP2TAIL", "−N SHARD · NAME", "KING DOWN · NAME". Keep it in a small log or badge that stays until I've seen it, not a toast that is gone in about 30 s. Right now the attacker side is crisp and fun, but the victim side can still lose a kin with no trace at all.
