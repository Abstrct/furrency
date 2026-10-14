# Playtest report: glyph

## 1. Who I am & what I tried
I'm **glyph**, the language and symbol director, playing on desktop (1280x800). The rule I checked against: use symbols wherever possible, only simple basic words, no sentences, no Structs words (planet / fleet / struct / ore / guild / reactor / command ship / charge / proof / ambit), no raw chain ids, no dev or error jargon.
I visited every place: home, GLYPHS, KIN, DEN, HUNT, PROWL, GLOW. I went through every dialog I could reach: the JOIN wizard (NEW PAW, I HAVE WORDS with bad words, KEEP WORDS, CHIEF/name with a bad name), the paw panel (WORDS, FORGET? and its NO), the CALL dialog and the slot CALL · STAR dialog, the kin cards (Sun Lion, Dig Mole, Forge Badger), the hunt card, PEEK, and a full PROWL → POUNCE → AUTO → SNATCH fight.
I also triggered these on purpose: FEED with 0 alpha, ROAM while the den still had shard, a disabled CALL card, and an empty hunt search. While I was gone my own king got pounced, which showed me the NO KING banner.
The box was under very heavy load (load average about 70). Several lab calls took more than 2 minutes.

## 2. Scores
- **Fun 8**: The comic bursts (CALL!, UP!, POW!, WHAM!, SNATCH!) and the PICK → PROWL → KING → SNATCH steps are a joy, and the kin names are great.
- **Clarity 5**: The vocabulary is mostly clean, but the clan is literally "DEVNET GUILD" everywhere, raw ids and a `structs1…` address show in the paw panel, and several things go by two names.
- **Beauty 9**: Strong ink style, coherent colours, and the GLYPHS page is a lovely legend.
- **Feel/responsiveness 6**: Deeds land fast and the bursts feel punchy. The HOWL meter is not visible on desktop after joining, and DIG/FORGE howls sat at "0/N idle" for 15+ minutes (this may be the load).
- **Stability 7**: No crashes or page errors. The shard meter flickered between 0 and 1 across views, and I was robbed without any clear signal.

## 3. Findings

1. **[MAJOR] Clan named "DEVNET GUILD": a banned Structs word plus dev jargon, on almost every screen**
   - Where: JOIN → CHIEF step (clan pick "DEVNET GUILD · BEST FIRST"), JOINING… / DEN FOUND! ("GLYPHPAW · DEVNET GUILD"), paw panel (CLAN), every HUNT list row and the map label, hunt card tag, GLOW → CLAN SUNS card.
   - Steps: JOIN → NEW PAW → KEPT → NEXT.
   - Expected: a branded clan name (for example "SUN CLAN"). Actual: "DEVNET GUILD", which breaks two rules at once and is the most-seen piece of text in the game.
   - Shots: qa/playtests/shots/glyph-013.png, glyph-018.png, glyph-026.png, glyph-034.png

2. **[MAJOR] Paw panel shows raw chain ids and a `structs` address**
   - Where: top-right GLYPHPAW button → paw panel.
   - Expected: no ids, or a symbol or short tag. Actual:
     - "CHIEF 1-15"
     - "DEN 2-13"
     - "PAW structs15pqh4ppzunm6kwh8cyrjqs5gwltqgaett8q93q"

     The address contains the Structs name. The URLs `#/den/1-7` and `#/prowl/1-7` also put raw ids in the address bar.
   - Shot: glyph-020.png

3. **[MAJOR] Structs and dev words still on screen**
   - Home top bar (before JOIN): "LIVE STRUCTS NET".
   - GLYPHS page, HOWL tile: "WORK · PROOF" ("proof" is on the banned list).
   - HUNT footer: "14 DENS · 5 WITH SHARD · CHAIN" ("chain" is blockchain jargon).
   - Top bar: "GRASS" status dot. Players can't tell what it means; it reads like an internal service name.
   - Shots: glyph-002.png, glyph-003.png, glyph-026.png

4. **[MAJOR] Same thing, two names**
   - **Mole and Badger:** GLYPHS GROW strip says "CALL MOLE" / "CALL BADGER", but the CALL dialog and the den say "DIG MOLE" / "FORGE BADGER".
   - **"NAP 3H" vs "LAST MOVE 3H":** the HUNT list says "FANGRAIDER · NAP 3H" while the hunt card says "LAST MOVE 3H" for the same value. NAP already means "off · save glow" on GLYPHS and is a button on kin cards, so it now means three different things.
   - **Armor vs guard vs ward:** the kin page shows "SKILL ARMOR" and the fight log says "−1 · ARMOR", but GLYPHS teaches GUARD ("block for") and WARD ("den shield"). Iron Rhino's state is "GUARD" on PEEK.
   - **Wake vs awake:** the glyph is "WAKE · ON", but kin state reads "AWAKE".
   - **Damage words:** the kin page says "DMG 2", the kin card says "POUNCE 2 DMG", and the fight preview says "DMG 1 / BACK −2", while the kin stat is "BITE BACK".
   - **Pulse scales:** the top meter shows "FULL" / "81 PULSE", but the pounce button shows "PULSE 3/3".
   - **TOTEM:** used both as a slot class ("DIG MOLE · TOTEM", "EMPTY STAR TOTEM SLOT") and as the name of one ward ("STAR TOTEM · WARD +").
   - **New fight words not in GLYPHS:** "FELL", "FELL IT", "FALLS!", "TRADE", "BLOWS", "AUTO", "RELEASE", "STING", "LOB", "DODGE", "ANTI-SKY", "ALL-ROUND".

5. **[MAJOR] Howl speed labels contradict each other and the real time**
   - Where: CALL dialog vs kin card.
   - Actual: Dig Mole is "STEADY" on its CALL card but "HOWL QUICK" on its kin card. Forge Badger is also "HOWL QUICK", yet dig and forge are the slowest howls (my DIG howl sat at "0/N idle" for 15+ minutes).
   - "LONG" and "HUGE" are used as time words, but HUGE reads as size, and there is no clock symbol next to them.
   - Shots: glyph-021.png, glyph-025.png, glyph-052.png

6. **[MINOR] Symbol collisions: one icon, two meanings**
   - **PROWL:** the sidebar and den PROWL buttons use the starburst, which GLYPHS assigns to POUNCE. GLYPHS gives PROWL the paw print, which is also on the in-fight PROWL button.
   - **HUNT button:** the kin card's HUNT button uses the POUNCE starburst instead of the target rings.
   - **Sun icon:** WAKE and SUN share the same sun icon.
   - **Crown:** BIG PACK (GLOW strip) reuses the KING crown.
   - **"YOUR GLOW":** the heading on the GLOW page uses the DEN dome icon.
   - **ALL filter:** the HUNT "ALL" filter uses the PAW shield.
   - **Diamond:** the clan sun card's ◆ diamond matches the ◆ shard marker in the hunt list.
   - **Hush Moon:** drawn as a ringed planet, which reads as "planet".
   - Shots: glyph-003.png, glyph-024.png, glyph-033.png, glyph-040.png

7. **[MINOR] The alpha symbol doesn't read in the display font**
   - Where: GLOW page "YOUR FEED 0 α", clan card "FED 110 α".
   - Actual: in the comic font α renders like "u" / "a", so it reads "0 u" and "110 u". The coin logo is a circled "a", and the meter uses an α+ glyph, so there are three different alpha marks.
   - Shot: glyph-034.png

8. **[MINOR] Near-sentences and wordy strings**
   - Hunt card: "1 KIN CAN HIT KING".
   - Fight log: "THEIR IRON RHINO → THEIR SUN LION −2 · THEIR SUN LION FALLS!". Both sides say THEIR in someone else's fight, so you can't tell who is who.
   - Toast: "NO ALPHA · FORGE FIRST DEN".
   - FORGET? dialog: "WORDS ONLY WAY BACK".
   - Hint: "TAP A KIN · TAP +".
   - JOINING… step: "READ · ASK CLAN · WAIT CLAN" (what is "READ"?).
   - The name-rule hint "3–20 · A-Z 0-9" disagrees with its own error "A-Z 0-9 _ - ONLY".
   - "BAD WORDS" for an invalid seed reads as profanity.
   - Shots: glyph-027.png, glyph-031.png

9. **[MINOR] HOWL meter is missing on desktop after joining, and the PULSE label is clipped**
   - Where: top bar on every joined page.
   - Expected: ALPHA · SHARD · GLOW · PULSE · HOWL. Actual: HOWL disappears (it was visible as "OFF HOWL" before joining), and PULSE shows as "PULS" or "PUL". On #/prowl the GLOW and PULSE chips overlap.
   - Shots: glyph-041.png, glyph-047.png

10. **[MINOR] No clear signal when you're robbed, and the empty states don't add up**
    - Robbed: while I was on other pages my shard went 1 → 0 and my Sun Lion fell. The only sign was a passing banner and later "NO KING · CALL", with no POUNCED or SNATCHED toast.
    - Empty search: the HUNT search "zzzq" shows "0 DENS · 6 WITH SHARD · CHAIN" (contradictory) and no empty glyph.
    - KIN page: lists 13 kin but none of the call-able Dig Mole, Forge Badger or totems (Glow Stone, Star Totem…), so the kin reference is incomplete.
    - Hunt card: the name breaks mid-word as "FANGRA / IDER".
    - Shots: glyph-038.png, glyph-045.png, glyph-027.png

## 4. Delights
- **The GLYPHS page:** "ONE SIGN · ONE WORD" with tiny two-word captions (DIG "GROUND → SHARD", FORGE "SHARD → ALPHA") is exactly the right approach. The GROW / FIGHT / GLOW strips teach the loop in seconds.
- **Comic bursts as feedback:** CALL!, UP!, PROWL!, POW!, WHAM!, SNATCH!. The "+1 SHARD!" chip and the hatched (stealable) shard meter are excellent symbols.
- **Names with flavour:** the kin names (Comet Fox, Void Owl, Shade Bat, Fang Walrus, Quill Hog) and the zone set STAR / SKY / ROOT / TIDE are evocative and fun. PAW, WORDS, KEPT, BIND, ROAM, FEED and GLOW are a strong core vocabulary.
- **Short, clear error dialog:** "DEN NOT EMPTY · 5 SHARD LEFT · DIG FIRST · OK" is the model for all errors.
- **Prowl screen:** the zone lanes, the HIT 100% / DMG / FELL % chips and the PICK → PROWL → KING → SNATCH tracker make a fight readable without sentences.

## 5. One change I'd make first
Rename the clan from "DEVNET GUILD" to a branded name, and strip the paw panel of ids: drop "1-15", "2-13" and the `structs1…` address, or show a short glyph tag instead. Do it in the same pass as replacing "STRUCTS NET", "PROOF" and "CHAIN". These four strings are the only places the Structs and dev skin shows through, and players see them on every screen.
