# Playtest report: rook (desktop)

## 1. Who I am & what I tried
I'm a Structs veteran, so I tested Furrency by matching each action to its Structs mechanic. Joined as "Rook" (Devnet Guild, den 1-12). Called kin into all four zones: Comet Fox (STAR, Starfighter), Shade Bat (SKY, Stealth Bomber), Iron Rhino (ROOT, Tank) and Deep Mink (TIDE, Submersible). Also called a Star Totem (Orbital Shield), Dig Mole (Ore Extractor), Forge Badger (Ore Refinery) and Glow Stone (Field Generator).
Exercised NAP/WAKE, HIDE (on both stealth kin), GUARD/FREE, LEAP (king through all four zones), a live defense against Musemane's prowl (POUNCE ×3 for KING DOWN), PROWL + SNATCH on their den, ROAM gating, FEED and PULL on the clan sun, and every KIN card's numbers.

Structs mapping I confirmed working on-chain: CALL = struct build (+ auto-activate) · NAP/WAKE = deactivate/activate (glow is freed and re-charged correctly: 4875→4975→4875) · HIDE/SHOW = stealth (and attacking from stealth drops it, as on-chain) · GUARD/FREE = defense set/clear · LEAP = command-ship ambit move · PROWL = fleet move · SNATCH = planet raid PoW · POUNCE = attack (counter-attack range respected: "FREE HIT" from SKY onto a ROOT king) · DIG/FORGE = mine/refine PoW · FEED/PULL = reactor infuse/defuse · Glow Stone FEED = generator infuse · ROAM = explore (blocked while ore remains) · PULSE = charge.

## 2. Scores
- **Fun: 8** — The defense-into-KING DOWN-into-PROWL chain felt like a real Structs raid, compressed into three taps.
- **Clarity: 6** — The symbols are great, but zone labels, glow numbers and guard state are unclear or inconsistent in places (see findings).
- **Beauty: 9** — Comic ink, the kin portraits and the battle lanes split by zone are gorgeous. A couple of render artifacts.
- **Feel/responsiveness: 5** — Calls are snappy, but DIG and FORGE share one howl queue, and the first alpha took about 15 minutes after the Badger was up.
- **Stability: 8** — No page errors and every deed I sent succeeded. One wrong-target guard, and one confirm button that ignored the first click.

## 3. Findings
1. **[MAJOR] GUARD picker set the wrong target** · #/den → SHADE BAT → GUARD 1 → "GUARD · WHO?" list · Steps: open GUARD; the list showed [1] STAR TOTEM … [4] DEEP MINK TIDE [5] SUN LION ROOT; I clicked [5]. · Expected `GUARD · SHADE BAT → SUN LION`. · Actual deed `GUARD · SHADE BAT → DEEP MINK → success`. FREE, then picking "SUN LION ROOT" by its words, worked correctly. This might be the list re-sorting between render and click, or lab indexing, but a wrong-target tx is serious. The guarded kin also never shows that it is guarded: the Sun Lion and Deep Mink cards had no indicator, and only the guard shows a shield. Screenshot: qa/playtests/shots/rook-019.png
2. **[MAJOR] One howl at a time starves FORGE while shards sit "AT RISK"** · HOWL queue · Steps: have the Mole and Badger both up with 3 shards. · Expected: forging (which makes shards safe) to come first, or to run alongside digging. · Actual: FORGE hashed 6/9, then went "idle" while DIG took over and finished (adding another stealable shard). The first alpha landed about 15 min after the Badger came up (blocks ~187.5k→196k). In Structs, mine and refine compute independently.
3. **[MINOR] Totem kin show "TOTEM" instead of their zone** · PACK panel, kin detail, look KIN list · `DIG MOLE[TOTEM …]`, `FORGE BADGER TOTEM · FORGE`, `GLOW STONE TOTEM`, `STAR TOTEM TOTEM · AWAKE`. On-chain these planetary structs live in an ambit (the canvas draws the Mole/Badger in ROOT and the Totem in STAR), and the KIN page says the Mole is "ROOT TIDE". CALL MOLE also never lets you choose ROOT vs TIDE, which Structs allows. Screenshot: rook-015.png
4. **[MINOR] Glow (power) numbers don't add up** · #/glow, top meter · (a) Before I called anything, spare glow fell 7,925 → 7,310 → 6,782, with no toast or explanation (shared clan capacity being re-split as more dens joined?). (b) "LINK 16 DENS · EACH UP TO 6,000" next to a clan sun with GLOW 4,400. (c) USE is always 25 more than the sum of my kin's costs (1,125 vs 1,100; 2,200 vs 2,175), with no line item for the extra. (d) HUNT says "14 DENS" while GLOW says "16 DENS". Screenshot: rook-027.png
5. **[MINOR] SNATCH result is silent** · #/prowl/1-13 → PROWL 1 SHARD · My pack went AWAY, a SNATCH howl appeared, then the pack was HOME with SHARD 1→2. No SNATCH deed and no toast appeared, so I had to work it out from ROAM's "4 SHARD LEFT" (5 − 1 dug) to confirm the steal. A raid is the biggest payoff in the game and needs its own WHAM.
6. **[MINOR] Black filled burst over the den canvas** · #/den during CALL/UP!/WHAM effects · A solid black starburst covered the Comet Fox and the Sun Lion's head. Screenshots: rook-019.png, rook-020.png
7. **[MINOR] FEED confirm ignored the first click** · #/glow → FEED dialog → FEED · The first click left the dialog open with no deed, and the second click fed. PULL instead has an explicit two-step "PULL? GLOW DROPS NOW" confirm. Screenshot: rook-045.png
8. **[MINOR] Some totem tags don't match what they do** · #/kin · HUSH MOON is tagged "JAM" but its card says "DOES WARD +12". THORN SPIRE (Planetary Defense Cannon) is "STING" but shows only a passive "WARD +13". In Structs, the PDC actively shoots back at attackers, so it reads as a flat shield here. GLOW STONE's detail card shows a "HOWL QUICK" stat, which means nothing for a generator. Screenshot: rook-039.png
9. **[POLISH] PULL leaves no trace of the alpha on its way back** · #/glow · After PULL it shows "YOUR FEED 0 α · 1 SUN" and ALPHA 0. Nothing shows the alpha returning or when it arrives, and the PULL button stays active with 0 fed.
10. **[POLISH] Panels cover the den; a chief named "___"** · #/den desktop · The PACK and detail panels cover roughly 40% of the canvas: the Star Totem is under PACK, and the hidden Shade Bat and SKY kin are hard to find. A HUNT list entry is named "___" ◆2. Screenshots: rook-015.png, rook-029.png

**KIN page check:** The numbers match Structs genesis as I remember it, from memory, not checked against the chain. The king and all totems have 6 fur (Glow Stone 8, Heart and Tree 10), every pack kin has 3. Zones hit:
- Bear (Battleship): ROOT/TIDE/STAR + JAM
- Fox (Starfighter): STAR with a 2·1 secondary
- Owl (Frigate): STAR/SKY
- Ferret (Pursuit Fighter): SKY + JAM
- Bat (Stealth Bomber): ROOT/TIDE + HIDE
- Hare (Interceptor): STAR/SKY + DODGE
- Boar (Artillery): LOB, bite back 0
- Rhino (Tank): ARMOR
- Hog (SAM): STAR/SKY
- Otter (Cruiser): JAM
- Walrus (Destroyer): bite back 1·2
- Mink (Submersible): STAR/TIDE + HIDE

Costs charged on-chain matched the cards (Bat −125, Badger −500, Rhino −75, Glow Stone −500).

**Missing compared to Structs (probably deliberate scope cuts):** substation/allocation management, guild membership management, alpha transfer, and the energy marketplace (agreements/providers). Pack kin can't LEAP, which matches the chain (only the command ship changes ambit).

## 4. Delights
- The defense flow: PROWLERS! → DEFEND drops you into the lanes with HIT 100% · DMG 2 · FELL % · FREE HIT. Three POUNCEs gave KING DOWN!, and it rolled straight into a PROWL on their den. Structs combat, made legible.
- Counter-attack range and stealth behave exactly as on-chain: FREE HIT when the target can't reach your zone, and HIDE drops when the bat strikes.
- ROAM gating says "DEN NOT EMPTY · 4 SHARD LEFT · DIG FIRST": the explore rule in seven words.
- NAP/WAKE refund and re-charge glow to the exact unit, and FEED gives exactly +960 (4% cut shown up front).
- The KIN page and GLYPHS page are the best Structs reference I've seen. Every role is one word (HEAVY, REACH, LOB, ANTI-SKY).

## 5. One change I'd make first
Run FORGE alongside DIG, or always ahead of it, and give SNATCH and forge completions their own deed and toast. The core loop (shards at risk → make them safe) is currently the slowest and quietest part of the game.
