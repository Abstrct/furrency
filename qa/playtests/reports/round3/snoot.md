# Playtest report: snoot (Round 3, the crypto skeptic, desktop 1280x800)

## 1. Who I am & what I tried
I came from a thread calling this a scam, and I read every word about the paw and the words. I tried I HAVE WORDS four ways: empty, nonsense, 12 real wordlist words with a bad checksum, and the well-known public all-zero test vector padded with extra spaces and capitals. Then I looked for any way to see, back up, lock, or forget the paw, or to sign out. After that I played the loop: name, roam, call a Dig Mole, dig, call a Forge Badger, forge. I watched what the HOWL (in-browser proof-of-work) did to my machine and how honest its time estimates were. I also checked GLOW/FEED for fees and HUNT for what other players can see about me. That came to about 80 lab actions over roughly 35 minutes of chain time (blocks #394,972 to #414,367). Final state: 2 shards, 0 alpha, and a forge still running at "AWOO ~8M 78%".

## 2. Scores
- **Fun: 4/10.** After about 35 minutes I had 2 shards and zero alpha. Nearly all of that was watching progress bars I had never agreed to start.
- **Clarity: 3/10.** The game never says where my key lives, what happens if I lose the words, that this is a devnet, or that HOWL uses my CPU. "One sign, one word" is fine for verbs. It isn't enough for custody of a key.
- **Beauty: 7/10.** I hate admitting it: the title screen, the den island and the comic-ink kin look good. The HOWL panel covering the HUNT target card is the main visual sin.
- **Feel/responsiveness: 4/10.** There are dead buttons: the top-bar JOIN, FEED at 0 alpha, and PEEK on HUNT. Time estimates swing between minutes and hours. Several actions came back with no response at all.
- **Stability: 6/10.** Nothing crashed and the look reported no NEW PAGE ERRORS. Reloading mid-howl resumed correctly, and the howl ON/OFF setting survives a reload. During the forge, screenshots took 3+ minutes or timed out. I can't tell whether that was the lab or the game.

## 3. Findings

**[MAJOR] Once a paw is bound there is no way to view or back up the words, lock the paw, forget it, or sign out**
- Where: every route. That covers the top-right chief chip (`SNOOT`, control [4]), the `More` menu (only STRUCTS / DOCS / GLYPHS / TITLE), and the title page (only ENTER DEN / HUNT / GLYPHS / KIN).
- Steps: `#/` → JOIN → I HAVE WORDS → enter a valid phrase → BIND → close the dialog → `{"reload":true}` → click `SNOOT` → open `More` → `goto #/`.
- Expected: a PAW panel with SHOW WORDS, FORGET THIS BROWSER and LOCK, plus a line saying the key is stored in this browser.
- Actual: the status reads `paw unlocked` with no password and no lock anywhere. Clicking SNOOT does nothing, and the paw survives reloads. On a shared or library computer the next person gets my chief with full signing power and nothing on screen tells them so. It also traps me: after binding the wrong phrase I could never get back to NEW PAW. The JOIN dialog's PAW/WORDS steps aren't clickable, so the only option left is NAME·CLAN.
- Screenshots: `qa/playtests/shots/snoot-011.png` (More menu), `snoot-024.png` (SNOOT chip clicked, nothing opens).

**[MAJOR] The paw onboarding makes no custody or money disclosures**
- Where: JOIN dialog (PAW and WORDS steps), the title page, and the GLYPHS PAW tile.
- Steps: `#/` → JOIN → read the dialog → I HAVE WORDS → read the dialog.
- Expected: a few plain words on what a paw is, that the words never leave the browser (or where they do go), "never share your words", "lost words = lost chief", and "devnet · no real money".
- Actual: the only hints are `NEW PAW · FRESH · THIS BROWSER` and `I HAVE WORDS · COME BACK`. The words box is a plain textarea that shows the phrase in the clear, with no "never paste these anywhere else" warning. GLYPHS just says PAW = "YOUR KEY". The title says "on the Structs network" with a green LIVE badge and coin (α) art, and calls alpha "COIN · SAFE" in GLYPHS. The only hint that this is a test network is the clan name "DEVNET CLAN". Deeds (ROAM, CALL) are signed silently with no confirmation step, so a player cannot tell which actions sign with their key. To a skeptic, an unexplained "COIN · SAFE", a bare words box and silent signing are exactly the phishing pattern they warn people about.
- Screenshots: `snoot-003.png`, `snoot-004.png`, `snoot-015.png` (GLYPHS "ALPHA · COIN · SAFE").

**[MAJOR] HOWL time estimates are not credible (minutes become hours and back)**
- Where: the HOWL panel (top-bar HOWL meter, control [2]) on `#/den` and `#/hunt`.
- Steps: CALL a DIG MOLE. A DIG howl starts by itself, showing `GATHER · ~17M`. Open the HOWL panel and wait in 60 s steps.
- Expected: an estimate that moves smoothly and roughly matches reality.
- Actual: around #404,900 the dig showed `GATHER · ~5M 73%`. One minute later it showed `AWOO · ~4H 74%`. Under two minutes after that (#405,484) the dig succeeded and the shard arrived. The forge showed `~28M 3%` at about #405,700, `~25M 15%` at #407,449, and `~16M 53%` at #411,600. That's about 15 minutes elapsed while the estimate dropped by only 12 minutes. A "~4H" that turns out to be 2 minutes is exactly the kind of claim the screen can't back up.
- Screenshot: `snoot-038.png` (panel with DIG ~16M and CALL ~55S). The ~4H reading came from the look text; my screenshot calls timed out at that point.

**[MAJOR] Proof-of-work starts and restarts by itself, defaults ON, and never mentions CPU or battery**
- Where: HOWL (toast `CALLING · HOWL ON`) and the den.
- Steps: CALL DIG MOLE (500 glow) → wait.
- Expected: when the game first uses my CPU, it says so ("HOWL uses this computer"), and a dig or forge starts when I tap it.
- Actual: the call howl starts immediately. When the mole arrives, a roughly 17-minute DIG howl starts without any tap. When that dig ends, another DIG starts on its own. When the badger arrives, FORGE starts too, so two "VOICES" run at once. Nothing anywhere says this is computation on my machine. The only control is a small ON/OFF and −/+ inside the HOWL meter popover. The −/+ buttons are labelled "Fewer paws" / "More paws" for screen readers. "Paw" already means my key, so "More paws" reads like "create more wallets". The same word is used for two things.
- Screenshot: `snoot-028.png` (HOWL panel, 1 VOICE, ON by default).

**[MAJOR] The top-bar JOIN button does nothing once a paw is bound but no chief exists**
- Where: top-right `JOIN` (control [4]) on `#/den` and `#/glyphs`.
- Steps: bind words → close the NAME·CLAN dialog with × → `goto #/glyphs` → click `JOIN` (by number, or `tapxy [1218,30]`).
- Expected: the JOIN dialog reopens at NAME·CLAN.
- Actual: nothing happens, with no toast and no dialog (tried 3 times on 2 routes). Only the `JOIN START` card on the den canvas reopens it. A new player who closed the dialog sees the main call to action do nothing.
- Screenshots: `snoot-018.png`, `snoot-019.png` (after clicking JOIN, no dialog), `snoot-012.png` (same on den).

**[MINOR] Every words failure says "BAD WORDS", and a world-famous public test phrase is accepted silently**
- Where: JOIN → I HAVE WORDS → BIND.
- Steps: BIND with (a) an empty box, (b) 11 English words of nonsense, (c) the same real wordlist word 12 times (wrong checksum). Then (d) the public all-zero-entropy test vector with leading, trailing and double spaces and one word in capitals.
- Expected: (a) "EMPTY", (b) "12 OR 24", (c) "TYPO?", or at least a word count. For (d), a warning that this is a publicly known phrase that anyone can use.
- Actual: (a), (b) and (c) all show the same pink `BAD WORDS` chip, and the button jumps about 20 px down when the chip appears. (d) is accepted with toast `PAW · BACK`, so every player who tries that phrase shares one chief. In fairness, the extra spaces and capitals were normalised correctly.
- Screenshots: `snoot-006.png` (nonsense → BAD WORDS), `snoot-008.png` (public phrase accepted).

**[MINOR] HUNT idle timers contradict each other, run backwards, and call me idle while I'm working**
- Where: `#/hunt` PREY list and the selected-den card.
- Steps: `goto #/hunt` → click the FANG2CLAW row → compare the list with the card, then look again a minute later.
- Expected: one consistent "idle" figure per chief that only increases.
- Actual: at #407,449 the list said `FANG2CLAW … IDLE 11H` while the card at the same moment said `IDLE 10H`. VERIFY6060 went `53M → 51M → 50M` over successive looks, and PIPSQUEAK went `12H → 11H → 12H`. My own row showed `SNOOT · YOU · IDLE 10M` with the "z" idle badge on my map marker while two howls were running. As soon as I dug one shard, my row showed `◆1` to all 63 dens. That is accurate, but it's a public "this one is AFK and holding loot" signal with no notice to me.
- Screenshot: `snoot-035.png`, `snoot-037.png`.

**[MINOR] FEED at 0 alpha does nothing, and "CUT 4%" is never explained**
- Where: `#/glow` → CLAN SUNS → DEVNET CLAN → `FEED`.
- Steps: with alpha 0, scroll down and click FEED.
- Expected: either FEED is disabled ("FORGE FIRST", as the ALPHA card already says) or a dialog explains who takes the 4% cut.
- Actual: the click gives no dialog and no toast. "CUT 4%" sits next to FEED with no hint whether it goes to the clan owner, is burned, or something else. The card also shows `OWN 0 · CLAN SHARE 1,477`, meaning all my power is borrowed from a clan that was pre-selected for me ("BEST FIRST", the only option offered). A skeptic will read an unexplained cut on a preselected operator as a rake. Credit where due: it is at least shown before any feed.
- Screenshot: `snoot-031.png`, `snoot-033.png`.

**[POLISH] The WORDS dialog's stepper highlights the wrong step, and WORDS gets a ✓ without any backup**
- Where: JOIN → I HAVE WORDS.
- Steps: open the dialog, then BIND a phrase.
- Expected: the stepper highlights WORDS while the title says WORDS. After an import, the WORDS ✓ means something.
- Actual: the title says `WORDS` but the yellow highlight stays on `PAW`. After binding, WORDS gets a green ✓ even though I never saw, confirmed or backed up anything (a ✓ for a step that never happened).
- Screenshot: `snoot-004.png`, `snoot-008.png`.

**[POLISH] The HOWL popover covers the selected-den card on HUNT, and unknown routes fall through silently**
- Where: `#/hunt` with the HOWL panel open; `goto #/paw`.
- Steps: open HOWL, then select a den in PREY. Separately, `goto #/paw`.
- Expected: the panels don't overlap. Unknown routes show "NO SUCH PLACE" or redirect.
- Actual: the HOWL panel sits on top of the target card, leaving only PEEK/DEN visible and hiding the name, shard and guard details. The `#/paw` route shows the title page with the bad hash still in the URL. Separately, `PEEK` (control [29]) on a selected den did nothing visible.
- Screenshot: `snoot-037.png`.

## 4. Delights
- Nothing anywhere asks for real money: no buy button, no top-up, no wallet-connect popup, no "limited offer" timer. Every CALL shows its glow price on the card before you commit (`500 GLOW · PULSE 8+`).
- The words box is forgiving in the right way: leading, trailing and double spaces and capitals are normalised rather than rejected.
- HOWL ON/OFF works, and the OFF choice persists across a reload. That's real consent once you find it.
- `1 SHARD · AT RISK` with the striped shard meter is blunt about what can be stolen. The game doesn't pretend shards are safe.
- Reloading mid-howl picks up where it left off. No lost progress and no duplicate deeds.

## 5. One change I'd make first
Make the `SNOOT` chief chip open a PAW panel with: "KEY · THIS BROWSER ONLY", SHOW WORDS (behind a hold-to-reveal), FORGET THIS BROWSER, "DEVNET · NO MONEY", and "HOWL · USES THIS COMPUTER" with the ON/OFF toggle. That gives the player one honest place to understand and control their key and their CPU.
