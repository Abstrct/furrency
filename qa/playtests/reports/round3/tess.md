# Playtest report: tess (round 3, lore pedant, desktop 1280x800)

## 1. Who I am & what I tried

I'm tess. I read every word on every screen and I keep a glossary. The game promises "ONE SIGN · ONE WORD", so I held it to that. I visited the title, GLYPHS (all three chains), the More drawer, the JOIN stepper (PAW → WORDS → CLAN → DEN), DEN, the CALL dialog (all 20 cards), the kin drawers (Sun Lion, Gust Ferret), the HOWL drawer, HUNT/PREY, PEEK, PROWL (pick prey, then a live prowl on RUCKUS with LEAP and POUNCE), GLOW with FEED, KIN (PACK and TOTEMS), the ROAM dialog, and the title again after joining.

I called a Dig Mole, a Forge Badger and a Gust Ferret. I dug, forged, fed 1 α, prowled and pounced. That was about 75 lab actions. From about block #402,800 the lab's screenshots took 5–10 minutes or timed out, so the second half was read mostly from the look text plus the shots that did land.

## 2. Scores

- **Fun 5/10.** The core loop works (dig, forge, feed, prowl) and the comic popups are cute. But I spent most of my time asking "what does this word mean?" and the screen never answered.
- **Clarity 3/10.** About 30 words on screen aren't on GLYPHS. PACK, WARD, GUARD and BITE BACK each mean two or three things. Three different nav concepts use the wrong glyph.
- **Beauty 7/10.** The ink style, glyph tiles and zone rails are clean. The colour coding of STAR/SKY/ROOT/TIDE is consistent everywhere I looked.
- **Feel/responsiveness 5/10.** Calls finished in roughly 25 s, as promised. Dig and forge estimates moved around a lot (~17M → done in ~12M; FORGE ~12M → ~33M on the next run), and pounce results produced no sign at all.
- **Stability 4/10.** The top-bar chip is dead (see finding 4). Canvas targets dropped out of the look once, and for a while lab screenshots took 5–10 minutes or never came back, which stalled my tester.

## 3. Findings

**1. [MAJOR] PROWL, DIG and MOLE are drawn with the wrong glyphs**
- **Where:** `#/den` progress strip, bottom dock and PEEK dock.
- **Steps:**
  1. Join and land on `#/den`.
  2. Look at the strip `CHIEF · MOLE · DIG · BADGER · ALPHA · PROWL` and at the dock button `PROWL · FIGHT`.
  3. PEEK any den and look at `PROWL · THIS DEN`.
- **Expected:** each word shows its GLYPHS sign. PROWL is the paw print (as in the sidebar and on GLYPHS), DIG is the claw marks, and SHARD is the gem.
- **Actual:**
  - PROWL is drawn with the **POUNCE starburst** in the dock, the strip and the PEEK dock.
  - **MOLE** is drawn with the DIG claw marks.
  - **DIG** is drawn with the SHARD gem.
  - The dock labels PROWL "FIGHT", a word that isn't on GLYPHS (GLYPHS says "PACK GOES"). On the most important screen, three of the six strip icons lie.
- **Screenshots:** `qa/playtests/shots/tess-017.png`, zoom in `qa/playtests/scratch/tess/z017.png`, plus `tess-031.png` (PEEK dock).

**2. [MAJOR] "TOTEM" is a core category that GLYPHS never defines, and it fights with the CALL categories and the zones**
- **Where:** `#/kin` section header, `#/den` pack cards, den canvas slots.
- **Steps:**
  1. Call a Dig Mole.
  2. Read its pack card: `DIG MOLE · TOTEM · CALLING`, then `TOTEM · DIG`.
  3. Read the canvas targets: `EMPTY ROOT TOTEM SLOT` vs `EMPTY ROOT PACK SLOT`.
  4. Open `#/kin` and scroll to `TOTEMS`.
- **Expected:** TOTEM appears on GLYPHS with its own sign, and the same kin are grouped the same way everywhere. The pack card shows the kin's zone, like every other card (`SUN LION · ROOT · WAKE`).
- **Actual:**
  - TOTEM isn't on GLYPHS.
  - The KIN page header `TOTEMS` uses the **DEN glyph** (arch).
  - The pack card says `TOTEM` where a zone belongs, but the mole visibly stands in ROOT, and its KIN card says ROOT/TIDE.
  - The CALL dialog splits the same kin into `GROW` / `GLOW` / `WARD` instead of TOTEM.
  - The two slot rings per zone (`TOTEM SLOT` / `PACK SLOT`) differ only by colour (cyan vs yellow) and have no label on the canvas.
- **Screenshots:** `tess-047.png` (TOTEMS header), `tess-019.png` / `tess-020.png` (pack card), `tess-022.png` (CALL categories).

**3. [MAJOR] PACK means three different things**
- **Where:** `#/den` PACK panel, CALL dialog, `#/kin`, prowl.
- **Steps:**
  1. Den: the panel reads `PACK 4 KIN` and lists Sun Lion, Gust Ferret, Dig Mole and Forge Badger.
  2. CALL: the `PACK` section holds only the 12 fighters. There's no Sun Lion, mole or badger.
  3. `#/kin`: the `PACK` section **includes** the Sun Lion and excludes the mole and badger, which sit under TOTEMS.
  4. Canvas: `PACK SLOT` vs `TOTEM SLOT`.
  5. Prowl: `pack AWAY` / `PACK · HOME`, and only the ferret actually went.
- **Expected:** GLYPHS defines PACK as "YOUR KIN", and it should mean that everywhere. Fighters need their own word.
- **Actual:** the same word covers all your kin, fighters only, fighters plus king, and the travelling party. Three screens give three different memberships.
- **Screenshots:** `tess-024.png` (CALL PACK), `tess-036.png` (KIN PACK with Sun Lion), `tess-045.png` (den PACK with totems).

**4. [MAJOR] The top-bar JOIN / name chip does nothing**
- **Where:** top-right chip on every route.
- **Steps:**
  1. Before joining, `goto #/glyphs`.
  2. Click `JOIN` (I tried by name, by `[4]`, and again after `{"reload":true}`).
  3. After joining, click the `TESSGLOSSA` chip (`[4]`) twice from `#/den`.
- **Expected:** JOIN opens the JOIN stepper. After joining, the chip opens the paw/chief drawer.
- **Actual:** nothing happens: no dialog, no drawer, no sign. Five other JOIN buttons on `#/den` work. The only JOIN that fails is the most visible one, and once you're a chief there's no reachable place that shows your paw, your words or your clan.
- **Screenshots:** `tess-008.png` to `tess-011.png` (the screen is unchanged after each click).

**5. [MAJOR] Shield words and shield glyphs overlap: WARD, GUARD, ARMOR, DODGE, HIDE, CHIEF and PAW**
- **Where:** GLYPHS, CALL dialog, `#/kin`, prey card, kin drawer, prowl.
- **Steps:** compare these screens:
  - GLYPHS: `GUARD · BLOCK FOR` is a plain shield. `WARD · DEN SHIELD` is a hexagon. `PAW · YOUR KEY` is a shield with a paw.
  - CALL dialog: `WARD` is a **category of kin** that includes THORN SPIRE `STING`.
  - KIN cards: `DOES WARD +13` / `WARD +50`, used as a stat.
  - Prey card: `GUARDS · PACK 1 · 3`.
  - Gust Ferret drawer: `GUARD 1`.
  - Prowl: `GUARD KING · GUST FERRET`.
  - Iron Rhino: `ARMOR` (trait and skill). Storm Hare: `DODGE`.
  - The chief badge, the `NO CHIEF` banner and the `ALL` filter all use a **fourth** shield (a chevron shield) that isn't on GLYPHS.
- **Expected:** one meaning and one glyph per word. WARD stays the den shield, and the kin category gets its own name.
- **Actual:** five defence words and four shield glyphs. WARD is at once a den stat, a kin category and a kin stat. On the prowl screen I couldn't tell whether `GUARD KING · GUST FERRET` meant *my* ferret or one of theirs.
- **Screenshots:** `tess-003.png` (GLYPHS), `tess-023.png` (CALL WARD section), `tess-038.png` (KIN WARD stats), `tess-030.png` (GUARDS · PACK).

**6. [MAJOR] Old-world and dev words leak through, and some labels are full sentences**
- **Where:** global.
- **Steps:** join with the default clan, then read:
  - The clan card on the NAME · CLAN step.
  - `DEN FOUND!`.
  - Every row in the HUNT list, the map label and the GLOW sun card.
  - The kin cards (`DMG`, `SKILL`).
  - The HOWL drawer's button names.
  - The prowl screen's control names.
- **Expected:** fur-beast words only, one or two at a time.
- **Actual:**
  - `DEVNET CLAN` is the only clan, and it's printed about 10 times per screen.
  - `DMG` is a gamer abbreviation. `SKILL` is generic RPG vocabulary.
  - The HOWL drawer's −/+ buttons are named `Fewer paws` / `More paws` (in the look). The drawer itself calls them `VOICE`, and on GLYPHS PAW means `YOUR KEY`, so "more paws" reads as "more wallets".
  - Prowl controls are named `Your kin: SUN LION. Next` and `Their kin: STAR BEAR. Next`.
  - Sentences on screen: `1 KIN CAN HIT KING`, `READY TO FEED`, `5 SHARD IN GROUND`, `LOW GLOW · 10K GLOW`, `TAP KIN · TAP +`, `MOSTLY MISS · JAM`, `63 DENS · 9 WITH SHARD · NET`.
- **Screenshots:** `tess-015.png` (DEVNET CLAN), `tess-016.png`, `tess-029.png`, `tess-034.png`, `tess-036.png` (DMG / SKILL).

**7. [MINOR] The HUNT legend doesn't match the map, and SHARD and IDLE each get several symbols**
- **Where:** `#/hunt` footer legend and map.
- **Steps:** open `#/hunt` and compare the legend `● SHARD ● NONE ♛ YOU z IDLE` with the map and the list.
- **Expected:** the legend's marks are exactly what's drawn.
- **Actual:**
  - The legend's NONE is a **black** dot, but the empty dens on the map are **yellow** dots.
  - YOU is a **crown** in the legend (the KING glyph), but on the map YOU is a dashed ring with a pointer.
  - IDLE is a **clock** on the filter tab and a **z** in the legend.
  - SHARD shows up as the gem (filter tab and GLYPHS), as `◆19` in the list, and as a pink `●` in the legend.
  - The clan is a ◇ diamond on list rows, the join card and the sun card, but a flag on GLYPHS and on the prey card chip.
- **Screenshots:** `tess-030.png`, zoom in `qa/playtests/scratch/tess/z030.png`.

**8. [MINOR] PULSE is written six ways, and the meter's screen value disagrees with its text**
- **Where:** top meter, CALL cards, kin drawer, prowl.
- **Steps:**
  1. With pulse FULL, call a Dig Mole.
  2. Read the top meter right away.
  3. Open the CALL dialog, the Sun Lion drawer and a prowl.
- **Expected:** one unit and one format.
- **Actual:**
  - The meter is drawn as `41` while its accessible text says `PULSE 3`.
  - Other forms seen: `FULL`, `PULSE 8+` (CALL cost), `LEAP · 3 PULSE` (number first), `POUNCE PULSE 3/3` (a fraction).
  - GLYPHS only says `READY · REFILLS`, so nothing tells you what 8+ means against a meter that shows FULL.
- **Screenshots:** `tess-019.png` (meter 41 while the look says PULSE 3), `tess-018.png`, `tess-028.png`.

**9. [MINOR] Trait words contradict stats, and about 25 words on screen aren't on GLYPHS**
- **Where:** CALL dialog, `#/kin`, HOWL drawer, GLOW, prowl.
- **Steps:** compare CALL traits with the KIN stat blocks, then search GLYPHS for each word.
- **Actual:**
  - `BITE BACK` is both a stat label on every kin card and Fang Walrus's trait (`FANG WALRUS · BITE BACK … BITE BACK 1 · 2`).
  - Quill Hog's trait is `ANTI-SKY`, but its stats say `HITS STAR SKY`.
  - The GLYPHS grid itself lacks **HUNT**, even though its target glyph is in the sidebar and in the FIGHT chain. It also lacks KIN (cat face), CHIEF and WORDS.
  - Never defined anywhere:
    - Kin traits and skills: TOTEM, JAM, STING, LOB, REACH, CHEAP, HEAVY, FAST, DODGE, ARMOR, ALL-ROUND.
    - Call speeds: STEADY, QUICK, LONG.
    - Howl drawer: GATHER, AWOO/AWOOO, VOICE.
    - Kin drawer: RELEASE.
    - Prowl: FELL, FREE HIT, BACK.
    - GLOW page: LINK, CUT, SPLIT, CLAN SHARE (shown twice in one card), USE/HAVE/OWN, NET.
    - `DMG 2 · 2`.
  - Other symbol double-uses:
    - STRUCTS in the More drawer uses the **STAR zone** glyph.
    - HOWL `OFF` uses the **NAP** moon.
    - GLOW HEART uses the **FUR** heart.
    - The WORDS tab and the DOCS link share the same lines icon.
    - TITLE uses a house next to the DEN arch.
  - Spelling: GLYPHS says `AWOO`, the den bubble and the drawer chip say `AWOOO`, and the drawer's own phase label says `AWOO`, all on one panel.
- **Screenshots:** `tess-024.png`, `tess-036.png`, `tess-047.png`, `tess-007.png`, `tess-046.png`.

**10. [MINOR] Prey numbers disagree on one screen, and names are ambiguous**
- **Where:** `#/hunt` list vs prey card.
- **Steps:**
  1. Open `#/hunt` and click RUCKUS.
  2. Compare the list row with the card.
  3. Look at your own row.
- **Expected:** the same idle value in both places. "IDLE" means no action for a while. Names are unique and whole.
- **Actual:**
  - The list said `RUCKUS … IDLE 26M` while the card said `IDLE 52M` (block #416,767).
  - A minute earlier the card said `IDLE 25M` while the list had no idle at all.
  - My own row read `TESSGLOSSA · YOU · IDLE 18M` minutes after I called a Gust Ferret.
  - `FANG2CLAW` appears **twice** with different shard counts (◆19 and ◆3).
  - The prey card breaks the name as `RUCK / US`.
  - `2 SHARD LEFT` (ROAM dialog) and `5 SHARD IN GROUND` (den banner) describe the same pile in different words.
- **Screenshot:** `tess-030.png` (RUCK US).

## 4. Delights

- **GLYPHS as a concept.** "ONE SIGN · ONE WORD" plus the three numbered chains (GROW, FIGHT, GLOW) is the best onboarding page in the game. It reads in seconds.
- **The four zones are perfectly consistent.** The STAR / SKY / ROOT / TIDE glyphs and colours match on the den rail, KIN chips, CALL placement icons, prowl lanes and the LEAP buttons. That's the standard everything else should meet.
- **Deeds read like a ledger in the game's own words.** For example `LEAP · SUN LION → STAR`, `POUNCE · SUN LION → RUCKUS·STAR BEAR`, `FEED · 1.00 α · DEVNET CLAN`.
- **FEED is honest.** The dialog promised `+960 GLOW · 4% TO SUN`. GLOW went from 402 to 1,362, exactly +960.
- **The JOIN stepper.** The PAW → WORDS → CLAN → DEN tabs tick green, and `24 WORDS · PAPER · SAFE` / `NEVER SHARE` is a model of terse and correct.

## 5. One change I'd make first

Run a lexicon pass that makes GLYPHS the single source of truth. Every word printed anywhere should be on GLYPHS with exactly one sign, or be cut:
- Add TOTEM, HUNT, KIN, CHIEF and WORDS, plus the trait words.
- Give the fighters a word other than PACK.
- Pick one of WARD and GUARD for each meaning.
- Fix the PROWL starburst and the shifted MOLE/DIG icons in the progress strip.
- Rename DEVNET CLAN.

---

## Appendix: tess's glossary (every word and symbol seen)

Format: **WORD** · glyph as drawn · where seen · meaning as shown · ⚠ conflict

### Resources and meters
| Word | Glyph | Where | Meaning shown | Conflicts |
|---|---|---|---|---|
| ALPHA / α | α with sparkle (meter, GLYPHS, strip), bare α (logo, GLOW hero, `0 α`) | top meter, GLOW, FEED, deeds | the coin; "COIN · SAFE" | ⚠ two alpha marks; formats `0` vs `1.00`; `ALPHA!` with "!" on GLYPHS |
| SHARD | gem | meter, GLYPHS, filters, den banner | "RAW · STEALABLE" | ⚠ also `◆` (hunt list), pink `●` (legend); the strip's "DIG" step uses the gem |
| GLOW | lightning bolt | meter, sidebar, CALL costs, KIN `GLOW −135`, GLOW page | "POWER"; cost shown as `135 GLOW` in CALL and `−135` on KIN | ⚠ spare-glow bar fills with *used* (USE 1,075 / HAVE 1,477) |
| SPARE GLOW / USE / HAVE / OWN | bolt | GLOW page | capacity breakdown | ⚠ not on GLYPHS |
| CLAN SHARE · SPLIT | none | GLOW page | ? | ⚠ undefined; "CLAN SHARE" appears twice on one card |
| LINK | flag (the CLAN glyph) | GLOW page, `65 DENS · EACH UP TO 1,477` | ? | ⚠ undefined; reuses the CLAN glyph |
| YOUR FEED | bowl | GLOW page | α you fed | |
| CUT | none | clan sun card `4%` | clan commission | ⚠ undefined |
| FED / YOURS | none | clan sun card | | |
| PULSE | heartbeat line | meter, CALL, LEAP, POUNCE | "READY · REFILLS" | ⚠ FULL / 41 / 3 / `PULSE 8+` / `3 PULSE` / `PULSE 3/3` |
| HOWL | sound bars | meter (`QUIET`, `1`, `2`), drawer, canvas dial | "WORK · AWOO" (proof of work) | ⚠ AWOO vs AWOOO |
| QUIET | sound bars | howl meter | no howls running | |
| VOICE | none | howl drawer `1 VOICE` | worker count | ⚠ the buttons are named "Fewer paws / More paws" |
| GATHER | none | howl drawer `DIG · GATHER · ~17M` | waiting phase? | ⚠ undefined; also used for FORGE |
| AWOO / AWOOO | none | GLYPHS, den bubble, drawer chip and phase label | hashing | ⚠ spelled both ways on one panel |
| ON / OFF | howl bars / NAP moon | howl drawer | howl toggle | ⚠ OFF reuses the NAP glyph |
| BEAT | scent-like radio icon | title `BEAT #417,615` | block number | ⚠ not on GLYPHS; icon looks like SCENT |
| LIVE | green dot | top bar | chain connection | |
| SCENT | radio waves | GLYPHS only | "LIVE NEWS" | ⚠ never seen in play |

### Verbs
| Word | Glyph | Where | Meaning | Conflicts |
|---|---|---|---|---|
| DIG | claw marks | GLYPHS, howl drawer, mole card | "GROUND → SHARD" | ⚠ the strip shows DIG with the gem and MOLE with the claws |
| FORGE | flame | GLYPHS, badger card, howl | "SHARD → ALPHA" | |
| CALL | ⊕ | dock, CALL dialog, slots | "NEW KIN" | `MORE KIN` on the GLOW chain reuses it |
| CALL STEADY / QUICK / LONG | zone icons beside them | CALL cards | call duration | ⚠ undefined |
| CALLING | none | pack card, canvas `CALLING 66% · ~25S` | | |
| WAKE / AWAKE | sunrise | pack cards `ROOT · WAKE`, drawer chip | "ON" | ⚠ the look says AWAKE, the screen says WAKE |
| NAP | moon | kin drawer button | "OFF · SAVE GLOW" | ⚠ the moon is also HOWL OFF |
| HUNT | target | sidebar, dock `HUNT · PREY`, kin drawer button, FIGHT chain | find prey | ⚠ **missing from the GLYPHS grid**; the kin drawer HUNT just navigates |
| PREY | none | HUNT page title, dock subtitle | targets | ⚠ page called PREY, nav called HUNT |
| PEEK | eye | title, prey card | view den read-only | ⚠ not on GLYPHS |
| PROWL | paw print (sidebar, GLYPHS) / **starburst** (dock, strip, PEEK) | many | "PACK GOES" | ⚠ wrong glyph; dock subtitle "FIGHT" |
| FIGHT | none | dock subtitle, prey card button after prowl | prowl | ⚠ the same button changed PROWL → FIGHT |
| POUNCE | starburst | GLYPHS, prowl button | "HIT" | ⚠ the starburst is also used for PROWL |
| HIT / HITS | none | KIN `HITS STAR SKY`, prowl `HIT 33%`, `1 KIN CAN HIT KING` | can attack / hit chance | |
| MISS / MOSTLY MISS | none | prowl banner | low hit chance | ⚠ two-word phrase |
| FREE HIT | none | prowl banner | no bite back | ⚠ undefined |
| FELL | none | prowl `FELL 0%` | kill chance? | ⚠ undefined |
| BACK / BITE BACK | none | prowl `BACK −1`, KIN stat, Fang Walrus trait | counter damage | ⚠ stat and trait share one name |
| NO REACH | none | prowl `NO REACH · ROOT` | can't hit that zone | ⚠ REACH is also Void Owl's trait |
| SNATCH | swap arrows | GLYPHS, PEEK banner `9 SHARD · SNATCH` | "TAKE SHARD" | |
| LEAP | curved arrow (GLYPHS) / none (drawer) | kin drawer `LEAP · 3 PULSE`, prowl | "KING ZONE" | ⚠ prowl button flips POUNCE ↔ LEAP depending on the target |
| ROAM | compass | dock `ROAM · NEW DEN`, deed `ROAM · FIRST DEN` | "NEW DEN" | |
| FEED | bowl | GLOW, FEED dialog | "ALPHA → GLOW" | |
| HIDE | closed eye | GLYPHS, Shade Bat / Deep Mink traits, SKILL HIDE | "UNSEEN" | |
| GUARD | plain shield | GLYPHS, rhino state, `GUARDS · PACK`, `GUARD 1`, `GUARD KING · …` | "BLOCK FOR" | ⚠ overloaded |
| WARD | hexagon | GLYPHS, CALL category, `WARD +25` stat | "DEN SHIELD" | ⚠ category and stat |
| RELEASE | none | Gust Ferret drawer | dismiss kin? | ⚠ undefined |
| JAM | none | Hush Moon `WARD · JAM`, SKILL JAM | ? | ⚠ undefined |
| STING / LOB / ARMOR / DODGE / REACH / CHEAP / HEAVY / FAST / ALL-ROUND / ANTI-SKY | none | CALL and KIN traits | kin roles | ⚠ none on GLYPHS; ANTI-SKY contradicts HITS STAR SKY |
| UP! / CALL! | comic burst | den canvas | kin ready / calling | |
| DONE | none | signs `FEED · DONE`, `LEAP · DONE`, `PACK · DONE` | success | |
| HOME / AWAY | chevron | prowl `HOME`, PEEK `MY DEN · HOME`, `KING · HOME` | den / return | ⚠ HOME vs DEN |

### Beings and places
| Word | Glyph | Where | Meaning | Conflicts |
|---|---|---|---|---|
| KIN | cat face | sidebar, `PACK 4 KIN`, KIN page | your beasts | ⚠ not on GLYPHS |
| PACK | two heads | GLYPHS, den panel, CALL section, KIN section, slots, prowl | "YOUR KIN" | ⚠ three meanings (finding 3) |
| TOTEM / TOTEMS | DEN arch on the KIN page | pack cards, slots, KIN page | non-fighting kin | ⚠ not on GLYPHS; uses the DEN glyph |
| GROW | DIG claws | CALL section, GLYPHS chain | economy kin | |
| KING | crown | GLYPHS, Sun Lion `KING` tag, `THEIR KING` | "PACK LEADER" | ⚠ the crown also means YOU in the hunt legend |
| CHIEF / CHIEFS | chevron shield | title `CHIEFS 63`, `NO CHIEF`, strip `CHIEF`, name chip | the player | ⚠ not on GLYPHS; a fourth shield |
| DEN | arch | sidebar, GLYPHS | "HOME" | ⚠ arch reused for TOTEMS; TITLE uses a house |
| DENS | none | `63 DENS` (hunt), `65 DENS` (GLOW link) | | |
| CLAN | flag (GLYPHS, chips) / ◇ diamond (join card, list rows, sun card) | | "FRIENDS · GLOW" | ⚠ two glyphs |
| DEVNET CLAN | ◇ | everywhere | the only clan | ⚠ dev word leak |
| SUN / CLAN SUN / CLAN SUNS | sun | GLYPHS, GLOW page | "CLAN GLOW" | ⚠ vs SUN LION (the king) and SUN TREE (a totem) |
| PAW | shield with paw | JOIN button, GLYPHS, join tab | "YOUR KEY" (wallet) | ⚠ "Fewer paws / More paws" = howl workers |
| WORDS | lines | join tab, `I HAVE WORDS` | recovery phrase | ⚠ not on GLYPHS; same icon as DOCS |
| FUR | heart | GLYPHS, kin cards (♥♥♥, `♥ ×8`) | "LIFE" | ⚠ heart is also GLOW HEART; two notations |
| STAR / SKY / ROOT / TIDE | sparkle / cloud / mountain / waves | everywhere | "ZONE" | ✓ consistent; ⚠ STAR sparkle reused for the STRUCTS link |
| ZONE / OWN ZONE | none | GLYPHS, Sun Lion `HITS OWN ZONE` | | |
| SKILL / DMG / DOES / MAX | none | KIN cards | stats | ⚠ DMG and SKILL are RPG/old-world; `MAX ∞` |
| STRUCTS / DOCS / TITLE / GLYPHS · HOW TO PLAY | sparkle / lines / house / document | More drawer | links | ⚠ symbol reuse |
| IDLE | clock / z | hunt filter, legend, rows | time since last action | ⚠ two symbols; values disagree |
| NET | none | `· NET` in hunt footer | ? | ⚠ undefined |
| BEST FIRST / NAME FIRST | none | join clan step | | ⚠ BEST FIRST is unexplained |
| KEPT / LATER / NEXT / COPY / NEVER SHARE | ⚠ triangle | words step | | ✓ |

### Kin roster (CALL and KIN)
- **Grow:** DIG MOLE (DIG), FORGE BADGER (FORGE).
- **Glow:** GLOW STONE (GLOW), GLOW HEART (GLOW +), SUN TREE (GLOW ++).
- **Ward:** STAR POLE (WARD +), HUSH MOON (WARD · JAM), STONE BURROW (WARD ++), THORN SPIRE (STING).
- **Pack:**
  - STAR BEAR (HEAVY), COMET FOX (FAST), VOID OWL (REACH), GUST FERRET (CHEAP)
  - SHADE BAT (HIDE), STORM HARE (DODGE), BOULDER BOAR (LOB), IRON RHINO (ARMOR)
  - QUILL HOG (ANTI-SKY), TIDE OTTER (ALL-ROUND), FANG WALRUS (BITE BACK), DEEP MINK (HIDE)
- **King:** SUN LION (KING).
