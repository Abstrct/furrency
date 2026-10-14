# Playtest report: glyph2 (round 2)

## 1. Who I am & what I tried
I'm **glyph2**, the language and symbol director, re-auditing on desktop (1280x800) as chief **Glyph2ear**. My rule: symbols where possible, only simple words, no sentences, no Structs words (planet / fleet / struct / ore / guild / reactor / command ship / charge / proof / ambit / chain), and no raw ids or addresses shown by default.
I visited home, GLYPHS, KIN, DEN, HUNT, PROWL and GLOW. I went through every dialog I could reach: JOIN (I HAVE WORDS with bad words, NEW PAW, KEEP WORDS, CHIEF with a bad name), the paw panel (PAW MARK, WORDS, FORGET? → NO), the CALL dialog, the slot CALL · SKY dialog, the HOWL panel, own and enemy kin cards, hunt cards, PEEK, an empty search, FEED with 0 α, and two PROWLs.
I was also pounced by FANG2CLAW mid-session, which showed me the PROWLERS! / DEFEND / KING DOWN / NO KING flow.
About 75 lab actions.

**Round 1 fixes I verified**
- Clan names no longer say "GUILD".
- The paw panel now shows CLAN / WORDS KEPT / DEN YOURS / KIN 1, with no ids.
- "STRUCTS NET" is now "LIVE".
- HOWL now reads "WORK · AWOO" (no "PROOF").
- The GLYPHS GROW strip says "DIG MOLE".
- α renders as a true α on GLOW.
- "SCENT" replaces "GRASS" on GLYPHS.
- The Dig Mole card says "SLOW · ~36M" and its CALL card says "CALL STEADY".
- The HOWL meter now shows on desktop, and PULSE is no longer clipped.
- The KIN page now lists the totems, the Dig Mole and the Forge Badger.
- The fight log uses YOUR / THEIR correctly.
- Being pounced now raises "PROWLERS! · FANG2CLAW · DEFEND".
- An empty search now reads "0 DENS · 0 WITH SHARD".

## 2. Scores
- **Fun 7**: The bursts (CALL!, UP!, WHAM!, KING DOWN!) still land well. Getting pounced a few minutes after joining was exciting, but two empty SNATCHes in a row felt flat.
- **Clarity 6**: Better than round 1. The paw panel is clean and most banned words are gone. But "DEVNET" is still on every screen, the HOWL meter shows raw numbers, and the fight messages contradict each other.
- **Beauty 8**: The ink style is still lovely, and the α is fixed. There are new overflow bugs: hearts print over the GLOW numbers, and a GLOW chip is clipped.
- **Feel/responsiveness 6**: Calls land fast (about 30 s). My DIG howl sat at "0/N idle" for 12+ minutes, and its estimate went up (~36M → ~38M).
- **Stability 7**: No page errors. IDLE data vanished after a reload, and clearing the search left the list empty.

## 3. Findings

1. **[MAJOR] "GUILD" is gone, but the clan is still "DEVNET CLAN", which is dev jargon and the most-seen string in the game**
   - Where: JOIN → CHIEF ("DEVNET CLAN · BEST FIRST"), DEN FOUND! ("GLYPH2EAR · DEVNET CLAN"), toast "CLAN · DEVNET CLAN" (says CLAN twice), paw panel CLAN, every HUNT row, the map label, the hunt card tag, and GLOW → CLAN SUNS.
   - Steps: JOIN → NEW PAW → KEPT → NEXT.
   - Expected: a branded clan name (for example "SUN CLAN"). Actual: "DEVNET CLAN".
   - Shots: qa/playtests/shots/glyph2-016.png, glyph2-019.png, glyph2-028.png, glyph2-046.png

2. **[MAJOR] Raw ids and dev numbers still leak**
   - **Address bar:** `#/den/1-17`, `#/prowl/1-11`, `#/prowl/1-15`.
   - **Unnamed chief:** shown as "CHIEF 1" (canvas target "DEN OF 1-1"), and searching "1-1" finds it.
   - **HOWL meter:** shows "1", "2", then "510K", "680K", "2M". "2M" could mean 2 million or 2 minutes.
   - **HOWL panel:** shows "0 /S".
   - **Home tile:** "BEAT #210,659" (the block height).
   - **HUNT footer:** "19 DENS · 9 WITH SHARD · NET". NET replaced CHAIN but is still tech jargon.
   - **PAW MARK:** opening it shows `structs1fzk7rzyz9kj0t52nkjm9p86n37cnzgqkkrpc8l`. Hiding it behind a toggle is fine, but it still spells "structs", and the toggle needed two clicks to open.
   - Shots: glyph2-030.png, glyph2-033.png, glyph2-052.png, glyph2-048.png

3. **[MAJOR] Same thing, two names (still left)**
   - **Mole:** the den banner still says "5 SHARD IN GROUND · CALL MOLE", while GLYPHS and the CALL dialog say "DIG MOLE".
   - **Wake vs awake:** the glyph is "WAKE · ON", but kin state reads "ROOT · AWAKE".
   - **Armor vs guard:** Iron Rhino is tagged "ROOT · GUARD" and also "ARMOR" with "SKILL ARMOR". GLYPHS only teaches GUARD and WARD.
   - **Damage:** the KIN page says "DMG 2", but kin cards say "POUNCE 2 DMG".
   - **Pulse:** "PULSE FULL" sits next to "PULSE 8+" in the same CALL dialog.
   - **TOTEM:** the TOTEMS section and "TOTEM · DIG" state include the Dig Mole and Forge Badger, but "STAR TOTEM" is also one ward's name.
   - **PAW:** in the HOWL panel, "1 PAWS" and the "Fewer paws" / "More paws" buttons mean CPU workers, but GLYPHS says PAW = "YOUR KEY".
   - **Status dot:** the top bar dot says "LIVE", but GLYPHS calls it "SCENT · LIVE NEWS".
   - **Hush Moon:** tagged "JAM", yet its stat reads "DOES WARD +12".
   - **Fur:** shown as ♥ hearts everywhere except the PROWL lanes, which use small squares.
   - Shots: glyph2-020.png, glyph2-042.png, glyph2-053.png, glyph2-011.png, glyph2-040.png

4. **[MAJOR] Fight messages contradict each other or are unclear**
   - **KING DOWN:** when FANG2CLAW felled *my* Sun Lion, the burst read "KING DOWN! FANG2CLAW" and the toast "KING DOWN · FANG2CLAW · FIGHT". It reads as if *their* king fell.
   - **Robbed toast:** "−0 SHARD · FANG2CLAW".
   - **Defender banner:** "PROWLERS! · FELL THEIR KING". The DEFEND button took me to the attacker's den with "PROWL · 10 SHARD", not to a defence view.
   - **Empty SNATCH:** on GLYPHPAW the hunt card said "SHARD 3 SHARD". On arrival I saw "SNATCH · EMPTY", but also a "SNATCH!" toast, all four steps PICK / PROWL / KING / SNATCH ticked though I did nothing, and shard sprites flying to me. I gained 0 shard.
   - **Pounce count:** the hunt card says "1 KIN CAN HIT KING" while I had 0 pack kin (my king was still being called).
   - Shots: glyph2-039.png, glyph2-040.png, glyph2-061.png, glyph2-063.png

5. **[MINOR] Symbol collisions (mostly unchanged since round 1)**
   - **PROWL:** the sidebar PROWL, the den PROWL tile and "PROWL THIS DEN" use the POUNCE starburst. Hunt cards and the in-fight PROWL button use the paw print, which is the icon GLYPHS teaches.
   - **HUNT button:** the kin-card HUNT button uses the starburst instead of the target rings.
   - **IDLE filter:** uses the NAP moon, so the round 1 NAP vs IDLE word split is undone by the icon.
   - **Sun icon:** WAKE and SUN still share the same sun.
   - **Crown:** BIG PACK still reuses the KING crown.
   - **Den dome:** the "YOUR GLOW" and "TOTEMS" headings use the DEN dome.
   - **Paw shield:** the HUNT "ALL" filter uses the PAW shield.
   - **Diamond:** the hunt-list bullets and the clan sun card use ◆, which is also the shard mark.
   - **Flag:** GLOW "LINK" uses the CLAN flag.
   - **((·)) icon:** used for both SCENT/LIVE and BEAT.
   - **Hush Moon:** still drawn as a ringed planet.
   - Shots: glyph2-003.png, glyph2-028.png, glyph2-045.png, glyph2-056.png, glyph2-012.png

6. **[MINOR] Near-sentences and odd words still on screen**
   - **GLOW page:**
     - "SHARE SPLITS · MORE DENS · LESS EACH"
     - "USE 525 · HAVE 4,571 · OWN 0 · CLAN SHARE 4,571" (dense, and next to SPARE 4,046)
     - "READY TO FEED" under ALPHA 0
     - "NOTHING FED"
   - **Den, dialogs and kin pages:**
     - "TAP A KIN · TAP +"
     - "WORDS ONLY WAY BACK"
     - "READ · ASK CLAN · WAIT CLAN"
     - "ONLY MANY" on Star Totem and Stone Burrow
   - **JOIN wizard:**
     - "BAD WORDS" (reads as profanity)
     - The lowercase placeholder "12 or 24 words"
     - The name hint "3–20 · A-Z 0-9" still disagrees with its error "A-Z 0-9 _ - ONLY", and the too-short "G!" got no length error.
     - The CHIEF step's submit button is labelled "NAME". It changes to "JOIN · ROAM" only once the name is valid.
   - Shots: glyph2-045.png, glyph2-014.png, glyph2-017.png, glyph2-024.png

7. **[MINOR] Text overflow and overlaps**
   - **KIN cards:** Glow Stone (8♥), Glow Heart and Sun Tree (10♥) print their hearts over the GLOW cell ("-10K", "-100K" are unreadable).
   - **GLOW chip:** "SHARE SPLITS…" is clipped at "LESS E".
   - **Hunt card:** names still break mid-word ("NOVAP / AW").
   - **Den:** the Dig Mole covers the ROOT zone label.
   - **PEEK:** the "FANG WALRUS" label sits under the water.
   - **Hunt map:** the "DEVNET CLAN" label is overlapped by a den dot.
   - **Den hint:** the "TAP A KIN" panel cuts off the PROWL step chip.
   - Shots: glyph2-009.png, glyph2-011.png, glyph2-045.png, glyph2-030.png, glyph2-052.png

8. **[MINOR] HOWL panel is jargon, and the dig howl stalls**
   - The panel shows "0 /S", "1 PAWS", "WAIT · 0/18", and an unlabelled "- +".
   - The DIG howl stayed at "0/N idle" for 12+ minutes.
   - Its den label went from "DIG ~36M" to "DIG ~38M", and the progress showed "0%" the whole time.
   - There is no glyph for "waiting for its turn" or for "N" (what is 18?).
   - Shots: glyph2-048.png, glyph2-056.png

9. **[MINOR] IDLE data and search are inconsistent**
   - **IDLE data:** after a reload the HUNT rows lose their "IDLE 88M" tags, the IDLE filter shows "0 DENS · 0 WITH SHARD · NET", and hunt cards show "IDLE —". The data comes back minutes later.
   - **Search:** clearing the search field left "0 DENS" until I reloaded.
   - **Empty search:** still has no empty-state glyph.
   - Shots: glyph2-029.png, glyph2-033.png

10. **[POLISH] Small JOIN wizard mismatches**
    - **Titles vs tabs:** the dialog title disagrees with the step tab. "WORDS" shows while the PAW tab is lit, and "CHIEF" shows while the CLAN tab is lit.
    - **Clan option:** shows an empty checkbox and a ✓ at the same time.
    - **Random-name button:** it shares the word "name" with the "NAME" submit button. A click on "NAME" hit the random-name die and replaced my name.
    - Shots: glyph2-014.png, glyph2-016.png

## 4. Delights
- **Paw panel:** now four calm tiles (CLAN · WORDS KEPT · DEN YOURS · KIN 1), with the address tucked behind PAW MARK. This is exactly right.
- **α:** reads as a true α everywhere I checked ("0 α", "FED 112 α"), and the coin logo matches.
- **Pounce warning:** "PROWLERS! · FANG2CLAW · DEFEND", the NO KING · CALL banner and the one-tap king re-call make getting robbed legible.
- **CALL dialog:** grouped GROW / GLOW / WARD / PACK, "ONLY ONE" / "NO KING" / "FIRST" stickers, and zone glyphs on every card. It's clean and wordless.
- **GLYPHS page:** still the best screen. HOWL "WORK · AWOO" and SCENT "LIVE NEWS" are good replacements.

## 5. One change I'd make first
Do a "one name, one sign" sweep:
- Rename DEVNET CLAN to a branded clan name.
- Make the den banner say DIG MOLE.
- Pick WAKE or AWAKE, and GUARD or ARMOR.
- Rename the HOWL "PAWS" workers.
- Give PROWL the paw print everywhere and HUNT the target rings everywhere.
- Fix "KING DOWN · FANG2CLAW" so it says *whose* king fell (YOUR KING DOWN vs THEIR KING DOWN).

Most of what's left is the same idea under two names or one icon with two meanings. Fixing these makes the GLYPHS page true across the whole game.
