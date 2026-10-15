# marrow · round 3 playtest report

## 1. Who I am & what I tried

marrow, the fursona hoarder. I want my name, my colours and my clan, and generic things offend me. Desktop (1280x800) first, then phone (390x844) about halfway, roughly 58 lab actions. I tried the name field hard: 2 letters, a space, accented, emoji, a Cyrillic look-alike "а", 20 and 21 characters, `___`, `-_-` and a rude word. I joined as `MarrowTheBoneHoarder` (exactly 20 characters). Then I looked for every place my name shows up and every way to make the den or king mine. I called a Dig Mole and a Forge Badger, dug 1 shard, and read my own card and other chiefs' cards on HUNT. I could not test a duplicate name: the name step can't be reopened after joining, and there is no rename or logout.

## 2. Scores

- **Fun 4**: digging loop works, but nothing I own feels like *mine*, and long dead waits on HOWL (0/42 → 0/10 "idle" for 10+ min) made it hard to care.
- **Clarity 4**: the name rules hint is wrong, the den/chief counts disagree on three screens, and my own card shows the wrong pack size and the wrong idle time.
- **Beauty 7**: the comic-ink art is strong (title, den dome, peek cards), but text overflow (mid-word wraps, `…` cut-offs) spoils it exactly where my name sits.
- **Feel/responsiveness 3**: the name chip does nothing when tapped. Screenshot and reload calls hung for 100 s+ for the last ~25 min, and a 60 s wait took over 2 min.
- **Stability 3**: no JS errors were reported, but rendering froze (screenshots time out, reload hung) and the viewport reverted to phone by itself. The host was heavily loaded (load avg ~72, Chrome GPU helpers ~300% CPU each), so part of this may be the environment.

## 3. Findings

1. **[MAJOR] Zero identity: every chief is the same Sun Lion, the king can't be named, there is one clan, and the name chip is dead**
   - Where: `#/den` (king card, name chip `[4]`), `#/hunt` (peek card), JOIN → NAME · CLAN, title ticker.
   - Steps: (1) JOIN → the CLAN list has exactly one option, `DEVNET CLAN · BEST FIRST`. (2) In the den, tap SUN LION; the card reads `SUN LION · KING`, with no name, colour or rename. (3) Click the `MARROWTHEBONEHOARDER` chip (top right); nothing happens. (4) `More` lists only STRUCTS / DOCS / GLYPHS / TITLE. (5) On `#/hunt`, open `___`, `LEOTHEDRAGONSLAYER20` and my own row; all show the identical Sun Lion portrait. (6) The title ticker reads `CHIEF · CHIEF · ROAM · ROAM` with no names.
   - Expected: at least one owned identity lever (a name for my king, a tint/palette, a den banner colour, a clan choice) and a tappable profile chip. Actual: the only thing that's mine is an uppercased text string. My den looks exactly like 60 others.
   - Screens: `qa/playtests/shots/marrow-012.png` (nameless king), `marrow-016.png` (other chief, same lion), `marrow-023.png` (my card, same lion), `marrow-008.png` (anonymous ticker).

2. **[MAJOR] Chief name wraps mid-word on the phone peek card**
   - Where: `#/hunt`, phone 390x844, tap your own row or any long-named chief.
   - Steps: phone viewport → `#/hunt` → click `MARROWTHEBONEHOARDER · YOU` (or search `LEOTHE` → click the row).
   - Expected: the name fits (scaled, ellipsized or hyphen-free shrink). Actual: it breaks inside the word, `MARROWTHEB` / `ONEHOARDER` and `LEOTHEDRAG` / `ONSLAYER20`. The 20-character limit the form enforces doesn't fit the card the game shows it in.
   - Screens: `qa/playtests/shots/marrow-023.png`, `marrow-029.png`.

3. **[MAJOR] Server doesn't enforce the name rules the client shows; bad and blank names are live on the chain**
   - Where: JOIN → NAME field vs `#/hunt` list and map.
   - Steps: (1) JOIN → type `___`; the hint says `3+ LETTERS` and the button is disabled. (2) After joining, open `#/hunt`; a chief named `___` is listed (`___ ◆1 DEVNET CLAN`) and huntable. (3) The HUNT canvas targets include `DEN OF 1-1`, a chief with no name shown by its raw ID.
   - Expected: one rule set, enforced at the source, and a fallback display name that isn't a raw ID. Actual: the client rule is cosmetic. Anyone who bypasses the browser can take an unreadable or impersonating name.
   - Screen: `qa/playtests/shots/marrow-015.png` (the `___` row), `marrow-016.png`.

4. **[MAJOR] Rendering stops responding after ~25 min: screenshots and reload hang, viewport flips by itself**
   - Where: any route, after a viewport switch to phone and two HOWLs (DIG, FORGE) running.
   - Steps: play ~25 min, switch to phone, let DIG and FORGE howls run → `look?shot=1` or any `do` with `"shot":true`. Then `{"reload":true}`. Then `{"viewport":"desktop"}` (reports 1280x800) and do any shot action → the next look reports `390x844` again.
   - Expected: screenshots in a few seconds; the viewport stays where I set it. Actual: every shot call timed out at 60–110 s (8 attempts). Reload returned nothing in 60 s, and a `{"wait":60000}` took over 2 min. Text-only looks still came back in ~20 ms. Caveat: host load avg was ~72, with Chrome GPU helper processes at ~270–300% CPU each. Worth checking whether the den canvas or the howl worker is what pins the GPU.
   - Screen: none (shots failed); last good one `qa/playtests/shots/marrow-030.png`.

5. **[MINOR] Name rule copy is wrong and input is silently changed**
   - Where: JOIN → NAME · CLAN.
   - Steps: (1) The hint reads `3–20 · A-Z 0-9`. (2) Type `Marrow Bonechewer`; it becomes `Marrow_Bonechewer` with `GOOD NAME` and no notice. (3) Type `MarrowTheHoarderOfBon` (21 characters); the last character is dropped with no notice. (4) Type `Márrow` → `A-Z 0-9 _ - ONLY` (so `_` and `-` are allowed, contrary to the first hint), and the button reads `NAME FIRST` even though a name *is* typed.
   - Expected: the hint states the real rule up front (`A-Z 0-9 _ -`), the space conversion is shown, and the disabled button says the name is bad, not missing. Actual: three different rule strings, plus silent changes to my identity.
   - Screen: `qa/playtests/shots/marrow-005.png`.

6. **[MINOR] My chosen casing is destroyed everywhere**
   - Where: DEN FOUND dialog, top-right chip, HUNT list, peek card.
   - Steps: join as `MarrowTheBoneHoarder` → every surface shows `MARROWTHEBONEHOARDER`.
   - Expected: casing is the one bit of expression the A-Z rule leaves me; keep it at least on my own card and chip (the comic font can render mixed case). Actual: all caps everywhere, so a CamelCase name becomes an unreadable block.
   - Screen: `qa/playtests/shots/marrow-008.png`.

7. **[MINOR] Name is cut off or missing where there is room; the phone chip has no label**
   - Where: desktop top-right chip, desktop HUNT list, phone den header, phone pack strip.
   - Steps: (1) Desktop 1280 → chip shows `MARROWTHEBONE...` with lots of empty top-bar space to its left. (2) `#/hunt` → my row reads `MARROWTHEBONEHOARDER · Y...`, so `YOU` is cut. (3) Phone → the chip is an icon only, my name appears nowhere on `#/den`, and the look exposes it as `[3] (button)` with no accessible name. (4) Phone pack strip → `FORGE BADG...`.
   - Expected: full name on desktop and a labelled chip on phone. Actual: truncated or absent.
   - Screens: `qa/playtests/shots/marrow-010.png`, `marrow-015.png`, `marrow-019.png`, `marrow-030.png`.

8. **[MINOR] My own card shows the wrong pack size and idle time**
   - Where: `#/hunt` → my row → peek card.
   - Steps: call a Dig Mole and a Forge Badger (3 kin total) → open my card: `GUARDS · PACK 0 · 0`, `IDLE 7M`. Later, after `HOWL · DIG · 7 → success` gave me 1 shard, the list showed me as `IDLE 21M`.
   - Expected: my 3 kin counted somewhere, and IDLE reset by my own dig. Actual: the card says I have no pack and have been idle, which advertises me as easy prey.
   - Screen: `qa/playtests/shots/marrow-023.png`.

9. **[MINOR] Den/chief counts disagree across screens**
   - Where: title `CHIEFS`, `#/hunt` footer, `#/glow` LINK.
   - Steps: the title reads `CHIEFS 53` before *and* after I joined. Then `#/hunt` reads `62 DENS`, later `63 DENS`, and `#/glow` reads `LINK 64 DENS` at about the same time.
   - Expected: one number, and it goes up when I join. Actual: three numbers, and my arrival doesn't count.
   - Screens: `qa/playtests/shots/marrow-002.png`, `marrow-015.png`, `marrow-018.png`.

10. **[MINOR] No profanity filter on names**
    - Where: JOIN → NAME.
    - Steps: type `Shithead` → `GOOD NAME`, and `JOIN · ROAM` is enabled.
    - Expected: a basic blocklist, since names are public on the HUNT list and the map. Actual: accepted. (A chain-level bypass, finding 3, makes this worse.)
    - Screen: none (text look in `qa/playtests/scratch/marrow/log.txt`).

## 4. Delights

- The NAME step itself is quick and friendly: a live `GOOD NAME` / `3+ LETTERS` verdict, a dice button with on-theme names (`Slyfang`, `Nixfur`, `Ashpaw`), and maxlength stops a 21st character instead of failing on submit.
- Accented, emoji and Cyrillic look-alike names (`Mаrrow`) are all rejected, so nobody can spoof my name with a homoglyph.
- The JOIN stepper (PAW · WORDS · CLAN · DEN with green checks) and `DEN FOUND!` with my name under the lion is a genuinely nice first-arrival moment.
- The den diorama (dome, clouds, slots on STAR/SKY/ROOT/TIDE, mole with a hard hat) is charming and reads well at both sizes.
- The HUNT search is case-insensitive and filters instantly (`marrow`, `jordan`, `___` all found).

## 5. One change I'd make first

Give every chief one owned identity lever that shows on the peek card and in the den, such as a mane/fur tint for the Sun Lion plus a name for the king. Also fit chief names to the card without mid-word breaks. Right now my "identity" is an uppercased 20-character string that the card can't even fit.
