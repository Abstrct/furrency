# Playtest report: tess4 (round 4, lore pedant, desktop 1280x800)

## 1. Who I am & what I tried

I'm tess, back to check the team's fixes with my round-3 glossary in hand. I joined from the GLYPHS page using the top-bar JOIN chip and went through PAW, WORDS, CLAN and DEN. As chief TESSLEXICON I opened the name chip, the CALL dialog (all 20 cards), DEN, KIN, HUNT and the prey cards, PEEK on RUCKUS, GLOW, More and the title page. I called a Dig Mole and a Gust Ferret, started a dig, prowled PATCHES, pounced their Sun Lion by hand, then tried AUTO, which pounced and snatched +3 shard. I re-ran the repro steps for all ten round-3 findings, which took about 60 lab actions. Screenshots are `qa/playtests/shots/tess4-001.png` … `tess4-043.png`, and the zoomed crops are in `qa/playtests/scratch/tess4/`.

## 2. Scores

- **Fun 6/10 (up from 5).** The prowl now pays off fast. AUTO turned a pounce into a kill and a snatch (`+3 SHARD!`) in about 10 seconds, and the new BLOWS log plus the WHAM burst finally tell you what happened. The dig still sat in GATHER for over 25 minutes.
- **Clarity 4/10 (up from 3).** The progress strip and dock glyphs are fixed, and TOTEM and HUNT are now on GLYPHS. The lexicon is still not one sign per word, though:
  - PACK and GUARD still mean several things.
  - About 15 new undefined words arrived with the new features (AUTO, TRADE, BLOWS, FALLS!, SKY FULL, AT RISK, KEY, NET, FORGET and more).
- **Beauty 7/10 (unchanged).** The ink style is still great. There are some overlaps: the BLOWS panel sits under the deed toasts, a banner covers kin on PEEK, and a map label covers a den name.
- **Feel/responsiveness 6/10 (up from 5).** Screens respond instantly, and screenshots came back in about a second every time (round 3 stalled for 5–10 minutes). Calls are slower than promised: the Dig Mole took about 75 s and its canvas label said `~2M`.
- **Stability 7/10 (up from 4).** No errors, and the chip works. Two problems remain:
  - The HOWL drawer stays open across route changes and covers the KIN page.
  - Canvas targets drop out of the look while a drawer is open (`tess4-041`) and on PEEK (`tess4-022`).

## 3. Findings

### 3a. Round-3 verdicts

| # | Round-3 finding | Verdict | Evidence (round 4) |
|---|---|---|---|
| 1 | PROWL/DIG/MOLE drawn with wrong glyphs | **PARTLY** | The strip now reads ✓CHIEF · ⊕MOLE · claws DIG · ⊕BADGER · α ALPHA · paw PROWL, and the dock and PEEK dock use the paw (`scratch/tess4/z010-strip.png`, `z010-dock.png`, `tess4-022`). But the dock subtitle still says `PROWL · FIGHT`, and the prey-card button still changes PROWL → `FIGHT` after the prowl starts (`tess4` look at #616,000). FIGHT is still not on GLYPHS. |
| 2 | TOTEM undefined and inconsistent | **PARTLY** | GLYPHS now has a `TOTEM · DEN KIN · STAYS` tile, and the KIN header uses it (`tess4-003`, `tess4-019`). But the pack card still puts TOTEM where the zone goes: `DIG MOLE · TOTEM · DIG` beside `GUST FERRET · SKY · GUARD`, while the mole stands in ROOT (`tess4-041`). The CALL dialog still splits totems into GROW/GLOW/WARD and never says TOTEM (`tess4-012`). The canvas TOTEM/PACK slot rings are still unlabeled cyan and yellow. |
| 3 | PACK means three things | **STILL BROKEN** | The den shows `PACK 3 KIN` with the mole inside. CALL `PACK` lists the 12 fighters only. KIN `PACK` includes the Sun Lion. The enemy panel on PEEK is now headed `RUCKUS 6 KIN`, a fourth header for the same panel. The GLOW chain ends in `BIG PACK` (`tess4-041`, `tess4-012`, `tess4-017`, `tess4-022`, `tess4-004`). |
| 4 | Top-bar JOIN / name chip dead | **FIXED** | Before joining, JOIN on `#/glyphs` opens the stepper (`tess4-005`). After joining, the TESSLEXICON chip opens a chief card (`tess4-011`). The card brings new words of its own (see new finding N3). |
| 5 | Shield words/glyphs overlap (WARD/GUARD/…) | **STILL BROKEN** | `GUARDS · PACK 1 · 4` (prey card), `GUARD KING · GUST FERRET` (prowl), `SKY · GUARD` (pack card), `IRON RHINO ROOT · GUARD` (PEEK), `WARD` as a CALL category, `DOES WARD +13` (KIN). The old chevron shield is gone; a filled PAW shield now marks the chip, the ALL filter, the CHIEFS panel and the TAP KIN hint, so PAW ("YOUR KEY") now has 4 meanings (`scratch/tess4/z-shields.png`). |
| 6 | Old-world/dev words and sentences | **STILL BROKEN** | `DEVNET CLAN` on every row, card and map label. Still on screen: `DMG`, `SKILL`, `Fewer paws`/`More paws`, `Your kin: SUN LION. Next`, `1 KIN CAN HIT KING`, `TAP KIN · TAP +`, `5 SHARD IN GROUND`, `LOW GLOW · 10K GLOW`, `82 DENS · 16 WITH SHARD · NET`. New: `DEN NOT EMPTY`, `DEVNET · NO MONEY`, `HOWL · THIS COMPUTER`, `PATCHES'S SUN LION FALLS!` (`tess4-020`, `tess4-011`, `tess4-039`, `tess4-043`). |
| 7 | HUNT legend ≠ map; SHARD/IDLE multi-symbol | **STILL BROKEN** | The legend is unchanged: `● SHARD ● NONE ♛ YOU z IDLE` (`scratch/tess4/z020-legend.png`). The map still draws NONE as yellow dots and YOU as a dashed ring. IDLE is a clock on the tab and `z` in the legend. The GLOW sun card shows the ◇ diamond *and* the ⚑ flag for the same clan on one card (`tess4-026`). |
| 8 | PULSE written six ways; meter ≠ text | **PARTLY** | The meter now matches the look text. But the meter counts 1 → ~100 and then shows `FULL`, POUNCE counts charges `PULSE 3/3`, CALL asks for `PULSE 8+`, LEAP says `3 PULSE`, and the ME line says `pulse 595` while the meter says FULL. In `tess4-038` the meter shows **4** and the button shows **PULSE 3/3** at the same moment. |
| 9 | Trait words contradict stats; ~25 words not on GLYPHS | **PARTLY** | HUNT and TOTEM were added (33 tiles). KIN, CHIEF and WORDS are still missing. Every round-3 trait/stat word is still undefined: JAM, STING, LOB, REACH, DODGE, ARMOR, ALL-ROUND, ANTI-SKY, STEADY/QUICK/LONG, GATHER, VOICE, FELL, FREE HIT, LINK, CUT, SPLIT, NET. BITE BACK is still both a stat and Fang Walrus's trait. Glyph reuse is unchanged: STRUCTS uses the STAR sparkle, DOCS uses the WORDS lines, TITLE is a house, and BEAT on the title uses the SCENT glyph (`tess4-028`, `tess4-040`). I could not re-check AWOO vs AWOOO because the dig never left GATHER. |
| 10 | Prey numbers disagree; names ambiguous | **PARTLY** | Fixed: `RUCKUS` no longer breaks across lines, the list and card both say `IDLE 11H`, and my own row shows no fake IDLE (`tess4-021`). Still broken: `FANG2CLAW` appears twice (◆19 and ◆3), and the card says `17 SHARD` while the list says `◆17`. The same pile is `5 SHARD IN GROUND` on the den and `5 SHARD LEFT` in ROAM, and the shards in hand are now `3 SHARD · AT RISK`. New: canvas targets named `DEN OF ___` and `DEN OF 1-1`, and the map's `DEVNET CLAN` label covers RUCKUS's den name. |

**Tally:** 1 FIXED, 5 PARTLY, 4 STILL BROKEN. The same problem keeps coming back: the team fixes a sign in one place and adds new unlisted words next to it.

### 3b. New findings

**N1. [MAJOR] AUTO is drawn as POUNCE, guards first, then fires five pounces at a target I didn't pick**
- **Where:** prowl screen (`#/prowl/1-63`), `AUTO` button.
- **Steps:**
  1. Prowl PATCHES.
  2. Cycle the target to their SUN LION (the screen then reads `TRADE`).
  3. Pounce once.
  4. Wait for pulse to refill, then click `AUTO`.
- **Expected:** AUTO is on GLYPHS, has its own sign, and keeps attacking the target I chose (or says what it will do).
- **Actual:**
  - AUTO uses the POUNCE starburst. When it is on, the sign changes to the HOWL sound bars (`AUTO ON`).
  - Its first action was `GUARD · GUST FERRET → SUN LION`, not a pounce.
  - It switched the target back to `DIG MOLE` (`POUNCING…`) and made five pounce deeds in about 10 s. It killed the mole and the king and snatched `+3 SHARD!`.
  - The `GUARD KING · GUST FERRET` chip from round 3 turns out to be a **button** (a suggested action), styled exactly like a status label. That's why I couldn't tell whose ferret it was.
- **Screenshots:** `tess4-035.png` (before), `tess4-038.png` (AUTO ON), `tess4-039.png` (after).

**N2. [MAJOR] "SKY FULL" replaces PROWL, shown with the IDLE clock and no explanation**
- **Where:** `#/hunt` prey card for RUCKUS and FANG2CLAW (both PACK 1·4).
- **Steps:**
  1. Call a Gust Ferret (SKY).
  2. Open `#/hunt` and click RUCKUS.
  3. Click the second button.
- **Expected:** the PROWL button stays PROWL. If something blocks it, the sign says what (their SKY or mine?) and for how long.
- **Actual:**
  - The button reads `SKY FULL` with the **IDLE clock** glyph, while the same card says `1 KIN CAN HIT KING`.
  - Clicking it shows the toast `SKY FULL · WAIT`. It doesn't say what to wait for.
  - The PATCHES card (PACK 0·0) shows PROWL as normal.
  - FULL already means "pulse refilled" in the top meter.
- **Screenshots:** `tess4-031.png`, crop `qa/playtests/scratch/tess4/z031-card.png`, toast in `tess4-032.png`.

**N3. [MINOR] The new chief card leaks old-world words and a raw chain address**
- **Where:** top-bar name chip, then the TESSLEXICON dialog.
- **Steps:** after joining, click the chip, then click `PAW MARK`.
- **Expected:** fur-beast words that are on GLYPHS. PAW is the key.
- **Actual:**
  - The card says `KEY · THIS BROWSER`, but GLYPHS calls the key PAW.
  - `NET · DEVNET · NO MONEY` uses three old-world words.
  - `HOWL · THIS COMPUTER` is another old-world word.
  - `PAW MARK` expands to a raw `structs1mfjj…` address.
  - `FORGET` (a destructive action) isn't on GLYPHS.
  - The `WORDS` button uses the DOCS lines icon.
- **Screenshot:** `tess4-011.png`.

**N4. [MINOR] The pounce log (BLOWS) is a sentence log with three notations, and the toasts cover it**
- **Where:** prowl screen, BLOWS panel and the deed toasts.
- **Steps:** pounce once, then turn on AUTO.
- **Expected:** a log in the game's own terse grammar, unobstructed.
- **Actual:**
  - Lines read `YOUR SUN LION → PATCHES'S SUN LION −2 · 4/6 · PATCHES'S SUN LION BACK −2` and `PATCHES'S SUN LION FALLS!`. These are full sentences with a wrong English possessive.
  - The deed for the same event is written `PATCHES·SUN LION`.
  - The odds chip says `FELL 0%`, while the log says `FALLS!`.
  - BLOWS, FALLS and TRADE are undefined.
  - The deed toasts at the bottom-left cover the BLOWS panel.
- **Screenshots:** `tess4-036.png`, `tess4-038.png` (overlap), `tess4-039.png`.

**N5. [MINOR] The JOIN flow added new unlisted phrases**
- **Where:** JOIN stepper (NAME · CLAN step and the JOINING step).
- **Steps:** click NEW PAW, tick KEPT, then click NEXT and NAME FIRST.
- **Actual:**
  - The JOINING step shows `READ · ASK CLAN · WAIT CLAN · LOOK AROUND` and the title `JOINING…`.
  - The submit button `NAME FIRST` (later `JOIN · ROAM`) uses the CLAN flag.
  - The only clan is `DEVNET CLAN · BEST FIRST`, still shown with the ◇ diamond.
  - `DEN FOUND!` keeps its exclamation mark, like `ALPHA!` and `SNATCH!` on GLYPHS, while the glow chain says plain `ALPHA`.
- **Screenshots:** `tess4-007.png`, `tess4-008.png`, `tess4-004.png`.

**N6. [MINOR] Undefined numbers and units in deeds and calls**
- **Where:** DEEDS list, den canvas, HOWL drawer.
- **Steps:**
  1. Call a Dig Mole.
  2. Read the deeds list and the howl progress.
- **Expected:** consistent units that GLYPHS explains.
- **Actual:**
  - The deed reads `HOWL · CALL · DIG MOLE · 6`, and nothing says what 6 is.
  - The canvas showed `CALLING 3% · ~2M`; the call took about 75 s (round 3 promised about 25 s).
  - The look shows `HOWL · DIG 0/15 idle` while the drawer shows `GATHER · ~13M 34%`.
  - The new CALL tag `ONLY ONE` (Dig Mole) isn't on GLYPHS.
- **Screenshots:** `tess4-013.png`, `tess4-042.png`.

**N7. [POLISH] The HOWL drawer follows you between routes and covers content**
- **Where:** HOWL meter.
- **Steps:**
  1. Open the HOWL drawer on `#/den`.
  2. `goto #/kin`.
- **Expected:** the drawer closes on navigation, or stays docked out of the way.
- **Actual:** it stays open over the Void Owl card on KIN.
- **Screenshot:** `tess4-017.png`.

**N8. [POLISH] Overlaps and colour drift**
- **PEEK:** STAR-zone kin are drawn above the dome, and the `17 SHARD · SNATCH` banner covers Comet Fox's head (`tess4-022`).
- **Title page:**
  - The tag colours disagree with GLYPHS: DIG is cyan (orange on GLYPHS), FORGE is orange (yellow) and HOWL is white (purple).
  - BEAT uses the SCENT glyph (`tess4-040`).
- **Route labels:**
  - `#/prowl/1-63` is titled `HUNT`, then `PROWL`.
  - PEEK at `#/den/1-57` lights the HUNT nav.

## 4. Delights

- **The progress strip finally tells the truth.** ✓CHIEF → ⊕MOLE → claws DIG → ⊕BADGER → α → paw PROWL, with done steps ticked green. The dock and PEEK now use the paw for PROWL.
- **The JOIN chip and name chip work.** The chief card answers "what's my clan, did I keep my words, is howl on" in six tiles.
- **Pounces now give feedback.** You get a WHAM burst, `−2` on the target, a BLOWS log, and the prowl strip ticking PICK → PROWL → KING → SNATCH → `+3 SHARD!`. That was the most satisfying 10 seconds I've had in Furrency.
- **TOTEM is on GLYPHS and on the KIN header.** It has a proper totem-pole sign, and `DEN KIN · STAYS` is exactly the right gloss.
- **The zones are still perfect.** The STAR/SKY/ROOT/TIDE sign and colour agree on the den rail, the KIN chips, the prowl lanes and the LEAP buttons.

## 5. One change I'd make first

Freeze the lexicon. Make a CI check (or a test page) that fails whenever a word rendered on screen isn't a GLYPHS tile.

This round fixed five words and added about fifteen. Start with these:
- Give fighters a word other than PACK.
- Make GUARD a verb only, and make WARD the den shield only.
- Put the zone, not TOTEM, on totem pack cards.
- Rename DEVNET CLAN.
- Turn SKY FULL and AUTO into defined signs.

---

## Appendix: tess's glossary (round 4)

Legend: ✓ = fixed since round 3 · ✚ = new this round · ⚠ = conflict.

### Resources and meters
| Word | Glyph | Where | Meaning shown | Conflicts |
|---|---|---|---|---|
| ALPHA / α | α with sparkle (meter, GLYPHS), bare α (logo, `0 α`) | meter, GLOW, title `YOUR ALPHA` | "COIN · SAFE" | ⚠ `ALPHA!` (grow chain) vs `ALPHA` (glow chain) |
| SHARD | gem | meter (✚ now striped pink when you hold some), filters, banners | "RAW · STEALABLE" | ⚠ `◆17` in the list vs `17 SHARD` on the card; pink `●` in the legend |
| ✚ AT RISK | gem | den banner `3 SHARD · AT RISK` | held shards can be stolen | ⚠ not on GLYPHS; the striped meter is unexplained |
| SHARD LEFT / IN GROUND | claws (den) | ROAM `5 SHARD LEFT`, den `5 SHARD IN GROUND` | ground pile | ⚠ two phrasings |
| GLOW | bolt | everywhere | "POWER" | ⚠ the SPARE GLOW bar fills with *used* (USE 635 / HAVE 1,143) |
| SPARE / USE / HAVE / OWN / CLAN SHARE · SPLIT | bolt | GLOW page | capacity | ⚠ undefined; CLAN SHARE twice on one card |
| LINK | CLAN flag | GLOW `84 DENS · EACH UP TO 1,143` | ? | ⚠ reuses the CLAN glyph |
| CUT / FED / YOURS | none | clan sun card | commission etc. | ⚠ undefined |
| PULSE | heartbeat | meter `1…~100` then `FULL`; CALL `8+`; LEAP `3 PULSE`; POUNCE `3/3` | "READY · REFILLS" | ⚠ three scales; meter `4` while button `3/3` (tess4-038) |
| HOWL | sound bars | meter, drawer | "WORK · AWOO" | ⚠ ✚ the same bars also mark `AUTO ON` |
| VOICE / Fewer paws / More paws | none | howl drawer | workers | ⚠ unchanged |
| GATHER | none | howl drawer `GATHER · ~13M 34%` | pre-phase | ⚠ undefined; look shows `0/15 idle` meanwhile |
| AWOO / AWOOO | none | GLYPHS | hashing | not re-checked (dig never left GATHER) |
| BEAT | SCENT radio glyph | title | block | ⚠ unchanged |
| ✚ NET | none | chief card `DEVNET · NO MONEY`, hunt footer `· NET` | network | ⚠ old-world |

### Verbs
| Word | Glyph | Where | Meaning | Conflicts |
|---|---|---|---|---|
| DIG | claws | GLYPHS, strip ✓, howl | "GROUND → SHARD" | ✓ strip fixed |
| FORGE | flame | GLYPHS, KIN | "SHARD → ALPHA" | |
| CALL | ⊕ | dock, strip (MOLE, BADGER) ✓, slots | "NEW KIN" | `MORE KIN` on the glow chain |
| CALL STEADY / QUICK / LONG | zone icons | CALL cards | duration | ⚠ undefined |
| ✚ ONLY ONE | none | CALL Dig Mole after calling | cap reached | ⚠ undefined (KIN says `MAX 1`) |
| WAKE / NAP | sunrise / moon | cards, drawer | on / off | |
| HUNT | target | sidebar, dock, GLYPHS ✓ (`FIND PREY`) | find prey | ✓ now on GLYPHS; ⚠ page title is PREY |
| PEEK | eye | prey card | look | ⚠ not on GLYPHS |
| PROWL | paw ✓ everywhere | | "PACK GOES" | ⚠ dock subtitle `FIGHT`; button flips to `FIGHT` |
| ✚ SKY FULL | IDLE clock | prey card button, toast `SKY FULL · WAIT` | can't prowl? | ⚠ undefined; reuses the IDLE clock and FULL |
| POUNCE | starburst | prowl | "HIT" | ⚠ the strip prompt says `POUNCE THEIR KING` even when the target is a DIG MOLE |
| ✚ AUTO / AUTO ON | starburst / howl bars | prowl | auto guard + pounce | ⚠ undefined; borrows two other glyphs |
| ✚ TRADE | none | prowl verdict chip | both sides take damage? | ⚠ undefined; pairs with FREE HIT |
| FREE HIT / FELL / BACK | none | prowl chips | odds | ⚠ undefined |
| ✚ BLOWS | none | prowl log panel | pounce log | ⚠ undefined |
| ✚ FALLS! | none | BLOWS log | kin killed | ⚠ vs `FELL 0%` |
| ✚ WHAM! | comic burst | prowl canvas | hit landed | fine (sound effect) |
| SNATCH / SNATCH! | swap arrows | GLYPHS, PEEK, prowl strip | "TAKE SHARD" | ⚠ "!" on the fight chain only |
| GUARD | plain shield | GLYPHS, `GUARDS · PACK`, `SKY · GUARD`, `ROOT · GUARD`, `GUARD KING · …` button, deed `GUARD · GUST FERRET → SUN LION` | "BLOCK FOR" | ⚠ stat, state, button and verb |
| WARD | hexagon | GLYPHS, CALL category, `DOES WARD +25` | "DEN SHIELD" | ⚠ category and stat |
| LEAP | curved arrow on GLYPHS / none in drawer | Sun Lion drawer `LEAP · 3 PULSE` | "KING ZONE" | ⚠ no glyph in use |
| ROAM | compass | dock, ROAM dialog `DEN NOT EMPTY · DIG FIRST` | "NEW DEN" | ⚠ sentence |
| FEED | bowl | GLOW | "ALPHA → GLOW" | |
| HIDE | closed eye | GLYPHS, traits | "UNSEEN" | |
| ✚ FORGET | ✕ | chief card | drop paw from browser? | ⚠ undefined, destructive |
| ✚ READ / ASK CLAN / WAIT CLAN / LOOK AROUND | none | JOINING step | join stages | ⚠ undefined |
| HOME | none (prowl), chevron (PEEK) | prowl `HOME`, PEEK `MY DEN · HOME` | return | ⚠ vs DEN |

### Beings and places
| Word | Glyph | Where | Meaning | Conflicts |
|---|---|---|---|---|
| KIN | cat face | sidebar, `PACK 3 KIN`, ✚ `RUCKUS 6 KIN` | your beasts | ⚠ still not on GLYPHS |
| PACK | two heads | den, CALL, KIN, slots, `BIG PACK` | "YOUR KIN" | ⚠ four memberships |
| TOTEM | totem pole ✓ | GLYPHS ✓ `DEN KIN · STAYS`, KIN header ✓, pack cards, slots | non-fighting kin | ⚠ shown in place of the zone on pack cards; CALL never says it |
| GROW / GLOW / WARD (CALL sections) | claws / bolt / hexagon | CALL | totem subtypes | ⚠ overlap with verbs and resources |
| KING | crown | GLYPHS, cards, prowl strip `KING` | "PACK LEADER" | ⚠ crown = YOU in the hunt legend |
| CHIEF / CHIEFS | ✚ filled PAW shield | chip, title `CHIEFS 82`, ALL filter, TAP KIN hint | player | ⚠ not on GLYPHS; PAW glyph now has 4 uses |
| PAW | shield with paw | GLYPHS, JOIN | "YOUR KEY" | ⚠ the chief card calls it `KEY`; `PAW MARK` = raw `structs1…` address |
| DEN | arch | sidebar, GLYPHS | "HOME" | ✓ no longer reused for TOTEMS; ⚠ TITLE house |
| ✚ DEN OF ___ / DEN OF 1-1 | none | hunt canvas targets | dens with blank or raw names | ⚠ |
| CLAN | flag / ◇ diamond | GLYPHS, join card, list, sun card | "FRIENDS · GLOW" | ⚠ both glyphs on one sun card |
| DEVNET CLAN | ◇ | everywhere | the only clan | ⚠ dev leak |
| SUN / CLAN SUN | sun | GLOW | "CLAN GLOW" | ⚠ vs SUN LION, SUN TREE |
| WORDS | lines | join tab, chief card button | recovery phrase | ⚠ not on GLYPHS; same icon as DOCS |
| FUR | heart | GLYPHS, cards (`♥ ×8`, `♥♥♥`) | "LIFE" | ⚠ two notations; heart = GLOW HEART |
| STAR / SKY / ROOT / TIDE | sparkle / cloud / mountain / waves | everywhere | "ZONE" | ✓ consistent; ⚠ the sparkle also marks STRUCTS |
| SKILL / DMG / DOES / MAX / HITS | none | KIN, drawer | stats | ⚠ DMG and SKILL are old-world; Star Bear and Gust Ferret `SKILL JAM` while JAM is Hush Moon's trait |
| IDLE | clock / z | hunt | time since last action | ⚠ two signs; ✚ the clock also marks SKY FULL |
| STRUCTS / DOCS / GLYPHS / TITLE | sparkle / lines / doc / house | More drawer | links | ⚠ unchanged |

### Kin roster (CALL / KIN): unchanged from round 3
- **Grow:** DIG MOLE (DIG, `ONLY ONE` once called), FORGE BADGER (FORGE).
- **Glow:** GLOW STONE (GLOW), GLOW HEART (GLOW +), SUN TREE (GLOW ++).
- **Ward:** STAR POLE (WARD +), HUSH MOON (WARD · JAM), STONE BURROW (WARD ++), THORN SPIRE (STING, yet `DOES WARD +13`).
- **Pack:**
  - STAR BEAR (HEAVY), COMET FOX (FAST), VOID OWL (REACH), GUST FERRET (CHEAP)
  - SHADE BAT (HIDE), STORM HARE (DODGE), BOULDER BOAR (LOB), IRON RHINO (ARMOR)
  - QUILL HOG (ANTI-SKY), TIDE OTTER (ALL-ROUND), FANG WALRUS (BITE BACK), DEEP MINK (HIDE)
- **King:** SUN LION (KING; KIN card lists all four zones, den shows ROOT).
