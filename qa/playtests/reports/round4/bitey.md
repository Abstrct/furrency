# Furrency playtest: bitey (community mod), round 4 verification

## 1. Who I am & what I tried

I'm a community moderator (tester `bitey4`, chief 1-84). I re-ran the repro steps for all ten of my round-3 findings. I started logged out with PEEK on desktop. Then I probed the name field with about 50 names: existing chiefs, case and look-alike variants, staff-like names, and rude names. I joined as **FANGZCLAW**, a look-alike of the live chief FANG2CLAW that the filter let through. I called a Dig Mole, prowled and "snatched" an emptied AFK den (JORDANJ), checked attribution, the PROWLED banner and the links out, and then switched to phone (390x844) to check name display and responsiveness. That was about 35 interactive lab actions plus about 50 quick name-field probes, with no page errors and no hangs.

## 2. Scores

- **Fun: 6**. The den, VS screen and PROWL! burst still land. My first raid was again against a player who wasn't there, for nothing.
- **Clarity: 5**. Name errors are now clear one-word states ("NAME TAKEN", "STAFF NAME", "NOT ALLOWED", "3+ LETTERS"), and "SKY FULL · PACK THERE · WAIT" is better than a bare "FULL". Losses are still unexplained to anyone but the attacker.
- **Beauty: 8**. Same strong ink. On phone, long names now end in "…" instead of breaking mid-word.
- **Feel/responsiveness: 7**. Every navigation took about 1 s on desktop and phone, and actions felt snappy.
- **Stability: 7**. Nothing froze this time. I couldn't recheck last round's freeze under load, because my DIG howl sat at "0/N idle" for more than 20 minutes and never started hashing.

## 3. Findings

### Round-3 verdicts

| # | Round-3 finding | Verdict | Evidence (round 4) |
|---|---|---|---|
| 1 | Exact-name impersonation accepted | **PARTLY** | `FANG2CLAW`, `fang2claw`, `FANG2CLAW ` (trailing space), `FANG2CLAW-`, `FANG2C1AW`, `SN00T`, `RUCKU5` and `RUCKUSS` are now all "NAME TAKEN". But `FANGZCLAW`, `FANG2CLAVV` and `6RIZZLE` are "JOIN · ROAM", and I joined as FANGZCLAW. No chief tag is shown anywhere, the prowl screen reads "FANGZCLAW VS FANG2CLAW", and the two pre-existing FANG2CLAW rows are still both live (`bitey4-010.png`, `bitey4-020.png`) |
| 2 | No reserved-word / profanity filter | **PARTLY** | These are blocked as "STAFF NAME": `ADMIN`, `ADM1N`, `FURRENCYSUPPORT`, `SUPPORT_FURRENCY`, `FURREN_CY_HELP`, `MODERATOR`, `MODS`, `MOD`, `THEADMIN`, `STAFF`, `SYSTEM`, `OFFICIAL`, `STRUCTS`, `DEV_TEAM`. These are blocked as "NOT ALLOWED": `SHITHEAD`, `SH1THEAD`, `S_H_I_T`, `FUCK`, `CUNT`. These still pass: `MOD_TEAM`, `GAMEMASTER`, `CLAUDE`, `ANTHROPIC`, `FVCK`, `PISS`. New `___` names are refused ("3+ LETTERS"), but the old `___` den is still on the map |
| 3 | Logged-out PEEK publishes a rich-and-AFK target list | **STILL BROKEN** | Logged out, PEEK still opens a panel titled "PREY" with ALL/SHARD/IDLE filters and exact idle times. The top card shows SHARD 19, IDLE 21H, KING HOME and GUARDS · PACK 1 · 4 (`bitey4-002.png`, `bitey4-003.png`). The top-bar JOIN side bug is **fixed**: it now opens the JOIN dialog from `#/hunt` with a card open |
| 4 | IDLE timer marks active players idle | **FIXED** | About 10 minutes after joining and 5 minutes after a prowl, my card reads "IDLE —", my HUNT row has no idle label, and no "z" appears on the map (`bitey4-019.png`). Caveat: I checked this only from my own client |
| 5 | Pointless griefing allowed and cheered | **STILL BROKEN** | JORDANJ (KING DOWN, 0 shard, IDLE 13H): the screen showed "HIT 100% · FELL 100% · FELL IT". After PROWL the SNATCH howl ran on its own and ended with "SNATCH · EMPTY". There was no warning and no cooldown (`bitey4-014.png`, `bitey4-015.png`) |
| 6 | No new-player protection | **STILL BROKEN** | My new den card shows GUARDS · PACK 0 · 0 with no ward. Six minutes after joining, my account was offered "FREE HIT" on a 7-kin den and completed a raid. The GLYPHS page still lists WARD · DEN SHIELD, but the game never offers one (`bitey4-019.png`, `bitey4-020.png`, `bitey4-028.png`) |
| 7 | Raids advertised publicly, losses unexplained | **PARTLY** | "SKY FULL" now carries "PACK THERE · WAIT". A peek of FANG2CLAW 1-17 still shows the public "PROWLED" banner and a "PROWLERS!" lion, with no name and nothing to tap (`bitey4-021.png`). JORDANJ's den shows only "KING DOWN" after my raid, with no attribution. The promised attacker attribution is not visible to third parties, and I couldn't check the victim side because nobody hit me |
| 8 | Tester browser froze during a DIG howl on phone | **PARTLY** | On phone with a DIG howl queued, `#/glow`, `#/den` and `#/hunt` each took about 1 s, and nothing hung across more than 3 minutes of waits. But the howl stayed "HOWL · DIG 0/35→0/18 idle" and never hashed, so I couldn't recreate the case that froze last time |
| 9 | Raid fires with no confirm, screen loses track | **PARTLY** | The view now stays on `#/prowl/1-26` with "HOLD · SNATCHING", a "PROWL · DONE" toast and ticked step chips. There is still no confirm step, and the KING chip ticked even though I never pressed POUNCE (`bitey4-015.png`) |
| 10 | Links out don't show their destination | **STILL BROKEN** | The More menu is unchanged. "STRUCTS · OFFICIAL GAME" shows no domain, "DOCS · STRUCTS.AI" shows only text, and there is no leaving-the-game notice (`bitey4-018.png`) |

Score: 1 fixed, 5 partly, 4 still broken.

### New findings (moderation risks, most severe first)

1. **[MAJOR] The look-alike filter misses Z↔2, VV↔W and 6↔G, so I'm in the game as a fake FANG2CLAW. Moderation risk: HIGH (impersonation raids, framing).**
   · Where: JOIN → NAME · CLAN; HUNT list; PROWL VS header.
   · Steps: JOIN → NEW PAW → KEPT → NEXT → type `FANGZCLAW` → "JOIN · ROAM" → join. Then HUNT → search "FANG".
   · Expected: confusables are folded the same way 0/O, 1/L and 5/S already are.
   · Actual: the list shows FANGZCLAW · YOU right above FANG2CLAW ◆19 and FANG2CLAW ◆3. In the comic font Z and 2 are near-identical at both sizes, and the prowl screen headline reads "FANGZCLAW VS FANG2CLAW". With no chief tag, a victim cannot tell them apart. `FANG2CLAVV` and `6RIZZLE` pass too.
   · Screenshots: `bitey4-010.png` (desktop), `bitey4-029.png` (phone), `bitey4-020.png` (VS)

2. **[MAJOR] An anonymous parked prowler can lock other raiders out of a rich AFK den indefinitely. Moderation risk: MEDIUM-HIGH (one player claims a victim, and nobody can see who).**
   · Where: `#/prowl/1-17` (FANG2CLAW, ◆19, IDLE 21H) and `#/den/1-17`.
   · Steps: open PROWL on 1-17.
   · Expected: a pack parked at a den leaves after a while, and the prowler is named or at least tappable.
   · Actual: the button reads "SKY FULL · PACK THERE · WAIT", as it did in round 3, a day earlier in game terms. The peek shows "PROWLED" and a "PROWLERS!" lion that is not a tap target and has no name. Players will report "X is camping Y" and a moderator has nothing to look at.
   · Screenshots: `bitey4-020.png`, `bitey4-021.png`, `bitey4-022.png`

3. **[MAJOR] A new "LATER" button lets players skip keeping their recovery words. Moderation risk: MEDIUM-HIGH (lost-account tickets, fake "recovery support" scams).**
   · Where: JOIN → NEW PAW → KEEP WORDS step.
   · Steps: open the words step.
   · Expected: the round-3 friction stays: you tick KEPT before you can continue.
   · Actual: next to COPY / KEPT / NEXT there is now a "LATER" control. I didn't press it, so I don't know whether the game ever asks again. Players who skip the words are the ones who later believe a "FURRENCY_HELP"-style DM promising to restore their account.
   · Screenshot: `bitey4-005.png`

4. **[MAJOR] The name filters leak on obvious variants. Moderation risk: MEDIUM (staff impersonation, crude names).**
   · Where: NAME field.
   · Steps: type each name and read the button.
   · Actual: `MOD_TEAM`, `GAMEMASTER`, `CLAUDE` and `ANTHROPIC` → "JOIN · ROAM", even though `MODS` and `DEV_TEAM` are blocked. `FVCK` and `PISS` → "JOIN · ROAM", even though `FUCK` and `SH1THEAD` are blocked. The staff check folds separators for some words but not for MOD + TEAM.
   · Screenshot: `bitey4-007.png`

5. **[MINOR] Legacy names were never cleaned up. Moderation risk: MEDIUM (the old impersonation is still live).**
   · Where: HUNT and the map.
   · Actual: both pre-round-4 FANG2CLAW chiefs (1-17 and 1-61) still exist with identical names. The `___` den still appears on the map, drawn as a bare dash, and in the target list as "DEN OF ___". The new rules apply only to new joins.
   · Screenshots: `bitey4-002.png`, `bitey4-003.png`

6. **[MINOR] The new "1 KIN CAN HIT KING" hint on other players' den cards ranks the weakest dens for attackers. Moderation risk: MEDIUM (it combines with finding 3 to make a curated victim list).**
   · Where: HUNT → any other den card (for example MARROWTHEBONEHOARDER: GUARDS · PACK 0 · 0, "1 KIN CAN HIT KING").
   · Expected: helpful to the attacker, maybe. But together with the "PREY" title, the IDLE filter and exact idle hours, it's a target-selection tool.
   · Screenshot: `bitey4-024.png`

7. **[MINOR] Phone hides parts of names. Moderation risk: LOW-MEDIUM (players can't read or report the full name).**
   · Where: phone den card and top bar.
   · Actual: the 20-character name shows as "MARROWTHEBON…" with no way to expand it. The phone top bar shows only the clan icon, never your own name. A reporter on phone can't copy or read the full name of whoever hit them, and there is still no chief tag to quote instead.
   · Screenshots: `bitey4-024.png`, `bitey4-023.png`

## 4. Delights

- The name field now answers instantly with one honest word ("NAME TAKEN", "STAFF NAME", "NOT ALLOWED", "3+ LETTERS"). It also catches case, trailing spaces, separators, doubled letters and 0/O, 1/L and 5/S. That's real progress.
- The staff list is broad: ADMIN, ADM1N, THEADMIN, XADMINX, FURRENCYSUPPORT and SUPPORT_FURRENCY are all blocked.
- The idle timer finally tells the truth about active players: no "z" and no "IDLE 8M" on a chief who is playing.
- The prowl screen no longer jumps to an empty `#/prowl` page after PROWL. You see HOLD · SNATCHING and PROWL · DONE.
- The phone stayed responsive the whole session, at about 1 s per navigation.

## 5. One change I'd make first

Show a short chief tag (for example `#1-17`) next to every name on HUNT rows, den cards, the VS header and any future loss log, and make it tappable to copy. Look-alike filtering will always miss a pair (Z/2 got through today), and legacy duplicates still exist. A tag is the only thing a victim, a reporter or a moderator can rely on. Second, hide exact idle times and the PREY list from logged-out PEEK.
