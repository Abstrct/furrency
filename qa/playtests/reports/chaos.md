# Playtest report: chaos

## 1. Who I am & what I tried
I'm **chaos**, an edge-case breaker playing at desktop size (1280x800), with a short phone detour. I went to deep routes before joining, bound garbage words, and closed or reloaded the join flow halfway through. I tried weird chief names and fired concurrent double and triple clicks at JOIN · ROAM, CALL, WAKE, RELEASE and POUNCE. I tried ROAM while my den still had shards and released my only mole while it was digging. I prowled with my king napping, reloaded during a howl, and navigated away during a deed. I also hit FEED with 0 alpha, defended a live raid (and lost my king), re-called the king, and opened the FORGET flow and cancelled it. About 70 lab actions. **NEW PAGE ERRORS stayed empty the whole run.**

## 2. Scores
- **Fun 7**: being raided mid-test, the "YOUR KING!" splash and the instant +2 SHARD snatch felt alive. Long idle howls slow the middle.
- **Clarity 5**: the symbols are lovely, but several labels are wrong: "8 PULSE" cost, "ALPHA 0 · READY TO FEED", DIG ✓ without digging, PROWL left enabled while the king naps.
- **Beauty 9**: the comic-ink den, prowl split-screen and glyph wall are gorgeous. On desktop the header HOWL pill is clipped.
- **Feel/responsiveness 4**: lab actions often took 25–57 s. Twice the page stopped answering for many minutes (once over 10 min) right after a howl or ROAM.
- **Stability 7**: I created no duplicate deeds and no JS errors despite heavy click-spam. I found one stuck state (dig never queued) and two long freezes.

## 3. Findings

**[MAJOR] Page freezes for minutes (lab look/do time out) around howls and ROAM**
- Where: #/den, ROAM NEW DEN; reload while the CALL howl was running.
- Steps: (a) Join. On the den, while 5 shards are in the ground, click ROAM NEW DEN. The action took more than 120 s to return, then showed the (correct) "DEN NOT EMPTY · 5 SHARD LEFT · DIG FIRST" dialog. (b) Call a Dig Mole, then `{"reload":true}` while "HOWL · CALL · DIG MOLE" is pending. Every look on my tester timed out for over 10 minutes, while other testers' looks answered in under 1 s.
- Expected: the UI stays responsive while proof-of-work runs (in a worker). Actual: this tester's page was unresponsive for minutes. That suggests main-thread hashing, or hashing that starves the page after a reload.
- Shots: qa/playtests/shots/chaos-012.png (the ROAM guard once it finally rendered).

**[MAJOR] First Dig Mole never started digging; only NAP → WAKE unstuck it**
- Where: #/den, DIG MOLE.
- Steps: Join. CALL MOLE, then send three concurrent `{"click":1}` (the 2nd and 3rd landed on the den screen, where [1] is the HOWL pill). Reload while the call howl is pending. After the call finished: mole TOTEM AWAKE, label "DIG", but HOWL OFF, no DIG howl, and the "5 SHARD IN GROUND" banner gone. Clicking the HOWL pill did nothing. NAP then WAKE on the mole queued "HOWL · DIG" right away.
- Expected: a DIG howl queues as soon as the mole is awake. Actual: the mole sat idle with nothing to show it was stuck. A clean call → reload → wait run later did queue DIG, so this is intermittent. Likely trigger: the extra HOWL-pill clicks plus the reload.
- Shots: chaos-037.png, chaos-042.png (mole "DIG", HOWL OFF, no progress).

**[MAJOR] POUNCE during a live defense gave no deed and no feedback while my king fell**
- Where: banner PROWLERS! → DEFEND → #/prowl/1-10, control "POUNCE PULSE 5/5" (FREE HIT · HIT 100%).
- Steps: Pipsqueak raided my den. I clicked DEFEND, then sent three concurrent clicks on POUNCE.
- Expected: one POUNCE deed, or a clear "too late / king fell" sign. Actual: no POUNCE deed in DEEDS and no toast. The next state was "NO KING · YOUR KING!" and 2 shards stolen. The player can't tell whether the pounce fired, failed or came too late.
- Shots: chaos-074.png (pounce offered), chaos-075.png (after).

**[MINOR] A spaces-only name is accepted as "GOOD NAME" and shows as "___" (it looks like a loading placeholder)**
- Where: Join → CHIEF → NAME field.
- Steps: type three spaces into the name field. The field turns them into `___` and shows GOOD NAME, and JOIN · ROAM is enabled.
- Expected: reject names with no letters or digits. The hint itself says "3–20 · A-Z 0-9". Actual: the chief is named "___". It shows as three yellow bars in the chief dialog, the header pill and the hunt list ("___ · YOU"), and is easy to mistake for an unloaded skeleton.
- Other names: "a", "🦊🦊🦊" and "Ab<i>x" correctly disable NAME, but no reason is shown. 30 characters truncate silently to 20. "Bad Name" becomes "Bad_Name", and underscores are not in the shown A-Z 0-9 rule.
- Shots: chaos-009.png, chaos-078.png.

**[MINOR] The "8 PULSE" call cost is wrong: a call drains the whole pulse**
- Where: CALL dialog (every card says 8 PULSE).
- Steps: with pulse FULL (about 190), call a Forge Badger. Pulse drops to 3. The same happened with the Dig Mole and the Tide Otter.
- Expected: the label matches what is spent (or reads "NEEDS 8"). Actual: it reads as a cost of 8 but empties the meter.

**[MINOR] Wrong signs after state changes**
- (a) The step strip shows **DIG ✓** although no dig ever finished: the shards came from a snatch, and "5 SHARD IN GROUND" was still showing (chaos-062.png).
- (b) On #/glow, the ALPHA card reads **"0 · READY TO FEED"** (chaos-072.png).
- (c) After the snatch auto-returned the pack (ME: pack HOME), #/prowl/1-7 still drew my Sun Lion at FangRaider's den with an aim line to their king. Tapping their king did nothing, with no feedback (chaos-058.png).
- (d) Route #/prowl/1-7 was labelled "HUNT" in the page title on the first render.
- (e) Forge Badger stays "TOTEM · FORGE" after its shards were stolen and its howl was dropped.

**[MINOR] PROWL stays enabled while the king naps**
- Where: #/hunt → prey card → PROWL.
- Steps: NAP the Sun Lion (the confirm says "NO CALLS · NO PROWL"), then open hunt and pick prey. The card still says "1 KIN CAN HIT KING" and PROWL looks active. Clicking it gives only a "KING NAPS" toast (no deed, which is correct).
- Expected: PROWL disabled, with a nap glyph.

**[POLISH] Header HOWL pill is clipped at desktop 1280 width**
- The meter row overflows: the HOWL pill shows only as a sliver between PULSE and GRASS (chaos-042.png, chaos-071.png). On phone, the GLOW number is cut off ("4…") and the PROWLERS!/forging banners cover the enemy king sprite (chaos-073.png).

**[POLISH] Some dialog and prowl controls have no accessible name or role**
- The RELEASE? and CALL (from a banner) confirm buttons were missing from the lab's control list, even though they could be clicked by text. The prowl screen has an unlabelled "(button)" (the white bar at the top-left of the stage, chaos-074.png).

**[POLISH] Idle times on the hunt list look inflated on devnet**
- "___ · YOU · NAP 63M" showed a few minutes after my last deed (NAP/WAKE). The idle time seems to use a mainnet block time, not 150 ms blocks.

## 4. Delights
- Double-click guards are solid. Concurrent spam on JOIN · ROAM, CALL, WAKE, RELEASE and the king re-call always produced exactly one deed. Buttons vanish or disable right away.
- The join flow resumes cleanly after Escape, Close or reload (same paw, same words), and garbage mnemonics get a crisp "BAD WORDS".
- The guards say exactly the right thing: "DEN NOT EMPTY · 5 SHARD LEFT · DIG FIRST", "KING NAP? NO CALLS · NO PROWL", "RELEASE? GONE FOR GOOD", "FORGET PAW? WORDS ONLY WAY BACK".
- The raid moments are thrilling: the SNATCH! burst with +2 SHARD, the PROWLERS! DEFEND banner, and the giant "YOUR KING!" splash.
- No new page errors at all, despite reloads, viewport flips and navigating mid-deed.

## 5. One change I'd make first
Move howl hashing fully off the main thread (or yield often) and re-arm queued kin jobs from chain state on every load. That fixes the multi-minute freezes and the mole that silently never digs. Both made the game feel dead and confused rather than "working".
