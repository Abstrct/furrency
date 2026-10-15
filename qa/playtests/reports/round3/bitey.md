# Furrency playtest: bitey (community mod), round 3

## 1. Who I am & what I tried

I'm a community moderator. I enjoy the game for five minutes and then start thinking about what players will do to each other. I began logged out on desktop with PEEK, to see what a stranger can learn about other players. Then I joined under a copy of an existing player's name (`fang2claw`, the same as the live chief FANG2CLAW) after probing the name field with impersonation and rude names. I called a Dig Mole, scouted and prowled an AFK player whose den had already been emptied, and switched to phone partway through. I also checked how idle and loss states are shown, what the WARD glyph promises, and where the links out point. About 60 lab actions. The session ended early because my browser stopped answering the lab for more than 25 minutes (finding 8).

## 2. Scores

- **Fun: 6**. The first five minutes are great: the den, the VS screen and the SNATCH! burst all land. After that the fun mostly comes from hitting players who aren't there.
- **Clarity: 4**. Symbols plus single words work for my own den. They don't work for losses. "KING DOWN", "SKY FULL" and "FULL" tell nobody what happened, who did it, or what to do next.
- **Beauty: 8**. Strong comic ink and a readable den on both desktop and phone. Names break mid-word on the phone den card ("FANG2C / LAW").
- **Feel/responsiveness: 3**. Desktop actions felt snappy. On phone during a DIG howl, a single navigation took more than 120 s, and later the page stopped answering entirely.
- **Stability: 2**. My tester browser stopped answering for good (look and reload both timed out at 400–590 s) after a DIG howl on phone. No page errors were reported before it went silent.

## 3. Findings (moderation risks, most severe first)

1. **[BLOCKER] Exact-name impersonation is accepted and indistinguishable. Moderation risk: CRITICAL (scams, framing, harassment).**
   · Where: JOIN → NAME · CLAN dialog; HUNT list; PROWL VS screen; den card.
   · Steps: Title → JOIN → NEW PAW → tick KEPT → NEXT → type `FANG2CLAW` (an existing chief, idle 9H, ◆19). It says "GOOD NAME". Lowercase `fang2claw`, `FANGZCLAW` and `FANG2CLAW ` (shown as `FANG2CLAW_`) are also all "GOOD NAME". I joined as `fang2claw`.
   · Expected: names are unique, ignoring case and look-alike letters, or carry a visible tag or ID.
   · Actual: the game shows my name in upper case as FANG2CLAW. HUNT lists two identical "FANG2CLAW" rows, and only my own view adds "· YOU". The prowl screen reads "FANG2CLAW VS FANG2CLAW". The chief ID (1-61) exists but is never shown, so a victim can't tell which FANG2CLAW raided them. On the phone den card the name also breaks mid-word ("FANG2C / LAW").
   · Screenshots: `qa/playtests/shots/bitey-010.png`, `bitey-015.png`, `bitey-023.png`, `bitey-033.png`

2. **[MAJOR] No reserved-word or profanity filter on names. Moderation risk: HIGH (staff impersonation in a game with recovery words).**
   · Where: NAME field ("3–20 · A-Z 0-9").
   · Steps: in the NAME field, type `ADMIN`, `FURRENCYSUPPORT` and `SHITHEAD` in turn.
   · Expected: these are rejected, or at least reserved or flagged.
   · Actual: all three show "GOOD NAME" with JOIN · ROAM enabled. A "FURRENCYSUPPORT" chief asking players for their 24 words is one message away. The hint says A-Z 0-9 only, but a space is accepted and turned into `_`. A live chief is named `___`, which renders as a near-invisible underline in HUNT and on the map. That's an unreportable, unsearchable identity.
   · Screenshots: `bitey-003.png` (the `___` row)

3. **[MAJOR] Logged-out PEEK publishes a ready-made "rich and AFK" target list. Moderation risk: HIGH (targeting of absent players).**
   · Where: title → PEEK → `#/hunt`. The panel is titled "PREY" and has ALL / SHARD / IDLE filters.
   · Steps: without joining, click PEEK, then the IDLE filter, then the top row.
   · Expected: players' idle times and defences are visible only to chiefs, and coarsely (for example "away"), not to anonymous viewers.
   · Actual: anyone, without an account, gets every den sorted by shards with exact idle time ("IDLE 10H") and a card showing SHARD 19, IDLE 9H, KING HOME and GUARDS · PACK 1 · 4. Other players are labelled "PREY" by default.
   · Side bug: on this route, the top-bar JOIN does nothing (clicked twice with a den card open). JOIN only works from the title screen.
   · Screenshots: `bitey-003.png`, `bitey-004.png`, `bitey-006.png`

4. **[MAJOR] The IDLE timer marks active players as idle. Moderation risk: HIGH (paints new or active players as free targets).**
   · Where: HUNT list, den card, map "z" marker.
   · Steps: join, call a Dig Mole, and keep clicking. About 2 minutes after a successful PROWL deed, open HUNT.
   · Expected: idle reflects the player's latest action (calls, prowls, snatches).
   · Actual: my own row reads "IDLE 8M", then "IDLE 14M" right after I prowled. The map draws the purple idle "z" next to my den, and everyone sees it.
   · Screenshots: `bitey-025.png` (list), `bitey-032.png` (z on map), `bitey-033.png` (card: IDLE 14M)

5. **[MAJOR] Griefing that gains nothing is allowed, and the game cheers for it. Moderation risk: HIGH (players emptied while away, then kept down).**
   · Where: `#/den/1-26` (JORDANJ) → PROWL THIS DEN → `#/prowl/1-26`.
   · Steps: I watched JORDANJ (IDLE 2H) go from ◆9 to "SHARD NONE · KING DOWN · GUARDS 0" between two HUNT views, while RUCKUS's row rose to ◆9. Then I peeked JORDANJ: only a "KING DOWN" banner. I opened PROWL anyway.
   · Expected: a den with no king and no shards is protected for a while, or at least the game warns "nothing to take".
   · Actual: the button and banner read "HIT 100% · FELL 100% · FELL IT". The raid completed: deeds `PROWL · JORDANJ DEN → success` and `HOWL · SNATCH → success`, all four steps ticked, then a full "SNATCH!" burst with the toast "SNATCH · EMPTY". Their Iron Rhino ended at 0 hearts. There is no cooldown and no repeat-raid limit. The same AFK player can be hit again the moment they're down.
   · Screenshots: `bitey-027.png`, `bitey-028.png`, `bitey-030.png`

6. **[MAJOR] No visible new-player protection, either way. Moderation risk: HIGH (veterans farming fresh dens; fresh accounts used to grief).**
   · Where: first den (`#/den`), prowl screen.
   · Steps: join and look at your den. Then, within about 3 minutes and with only a Sun Lion, open PROWL on a 7-kin den.
   · Expected: a starter WARD or grace period that is visible and explained. The GLYPHS page lists WARD · DEN SHIELD.
   · Actual: my new den card shows GUARDS · PACK 0 · 0 with no shield. WARD is never offered or mentioned during onboarding or in the den. A 3-minute-old throwaway chief is told "HIT 100% · FREE HIT" against a veteran's den. Throwaway paws cost nothing to make, so ban evasion and serial griefing are free.
   · Screenshots: `bitey-013.png`, `bitey-023.png`, `bitey-033.png`, `bitey-040.png` (WARD glyph)

7. **[MAJOR] Raids are advertised publicly; losses are not explained to anyone. Moderation risk: MEDIUM-HIGH (dogpiling, and "why was I robbed" tickets).**
   · Where: PEEK on a den under attack; prowl screen.
   · Steps: PEEK FANG2CLAW (`#/den/1-17`) and see a "PROWLED" banner plus a "PROWLERS!" callout. Open PROWL and press PROWL 19 SHARD.
   · Expected: a victim, or a moderator reading the screen, can see who acted and when. Blocked attackers are told why.
   · Actual: any viewer can see that a den is being raided right now, which invites a pile-on. A peeked victim den shows only "KING DOWN": no attacker, time or amount. My attack was refused with the toast "SKY FULL" and a "FULL" tag under the button, with no explanation (attacker cap? slot?). I could not see a victim-side loss log because my session died before I was hit (see finding 8). That part is unverified, not a pass.
   · Screenshots: `bitey-017.png`, `bitey-024.png`, `bitey-027.png`

8. **[BLOCKER] The tester browser stopped answering after a DIG howl on phone. Risk: retention (players who can't defend think the game froze while they were robbed).**
   · Where: phone viewport (390x844), during `HOWL · DIG` hashing.
   · Steps: switch the viewport to phone, have a DIG howl running, then `goto #/glow`. That took more than 120 s. `goto #/` did return, with shards at 1. Then `goto #/den` and `wait 60000`. After that, every `look` (400 s), `reload` (500 s) and `look` (590 s) timed out, while the lab's `/testers` endpoint answered in under 1 ms.
   · Expected: the howl doesn't starve the UI; navigation stays under a second.
   · Actual: the page went unresponsive for more than 25 minutes and the session could not continue. It may be partly the lab, but it started during hashing both times.
   · Screenshots: last good frame `bitey-040.png`

9. **[MINOR] A raid fires without confirmation and the screen loses track of it.**
   · Where: `#/prowl/<id>` big PROWL button.
   · Steps: on the JORDANJ prowl screen, click PROWL.
   · Expected: a confirm step, or a clear "pack on the way" state.
   · Actual: the view jumped to an empty `#/prowl` "PICK PREY · HUNT" page. ME still said "pack HOME". Only the DEEDS list showed `PROWL · JORDANJ DEN → success`. Reopening the den showed "HOLD · SNATCHING HOME" and then the finished raid. I never pressed POUNCE. A player can attack someone by accident and never notice, which leads to "I didn't do it" disputes.
   · Screenshots: `bitey-029.png`, `bitey-030.png`

10. **[MINOR] Links out don't show their destination. Moderation risk: MEDIUM (phishing look-alikes are easy to pass off).**
    · Where: title footer `STRUCTS ↗` / `DOCS ↗`; More menu "STRUCTS · OFFICIAL GAME" and "DOCS · STRUCTS.AI"; header link labelled "Structs — the official game"; title link labelled "Structs technical documentation".
    · Steps: open More, or look at the title footer.
    · Expected: each link shows its real domain, and there is a "leaving Furrency" step.
    · Actual: STRUCTS shows no domain at all. DOCS shows only the text "STRUCTS.AI". I couldn't confirm the actual targets through the lab, and per my brief I didn't follow them. There is no leaving-the-game notice. Players who learn "official links have no domain" are easy to phish in a game with recovery words.
    · Screenshots: `bitey-019.png`, `bitey-002.png`

## 4. Delights

- The title "scent" ticker shows POUNCE / PROWL / ROAM / CHIEF with **no names**. That's live activity with no public shaming. Keep it that way.
- The SHARD meter turns striped as soon as you hold stealable shards (`bitey-039.png`). It's an honest, wordless "you're exposed" signal.
- The ALPHA "COIN · SAFE" vs SHARD "RAW · STEALABLE" split gives victims a real way to protect what they've earned.
- The words step makes you tick "KEPT" before NEXT is enabled and says NEVER SHARE. That's the right amount of friction.
- The art and the VS / SNATCH! moments are genuinely exciting, and the phone den reads well at 390 px.

## 5. One change I'd make first

Make chief names unique, ignoring case and look-alike letters, and block reserved words (ADMIN, SUPPORT, FURRENCY, STRUCTS…), profanity and underscore-only names. Show a short chief tag (for example `#61`) wherever a name appears. Impersonation is the root of almost every other abuse here: a fake FANG2CLAW can raid people under someone else's name, and a fake FURRENCYSUPPORT can ask for recovery words.
