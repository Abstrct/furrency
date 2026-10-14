# nova2 — round 2 playtest (desktop, 1280x800)

## 1. Who I am & what I tried
First-time player, chief **Nova2paw** (DEVNET CLAN, den 1-19). I went from the title screen to my first alpha: JOIN → NEW PAW → keep the words → name → JOIN · ROAM → enter the den → CALL Dig Mole → first dig → CALL Forge Badger → first forge. I checked the round-1 fixes along the way: howl progress and time, speed words, the payoff splashes, the top-bar meters and raid alerts. **fang2claw** raided me twice. The first raid killed my king. The second killed it again and took my first shard. I called a Stone Burrow (WARD++). My second shard forged into **ALPHA 1.00** at chain #223950, about 40 minutes after I joined. I used about 60 lab actions.

## 2. Scores
- **Fun 6**: the join flow and the den are charming. Losing my only shard to a raid before I could forge it, with nothing explaining it afterwards, made me feel like a victim, not like someone in a fight.
- **Clarity 5**: the kin labels with "DIG ~37M" and the speed lines on the kin card are a real improvement. But the estimates are about 2x too long, the speed words contradict each other, and "WAIT · 0/10 0%" in the HOWL panel means nothing to me.
- **Beauty 9**: the comic-ink art, the den dome, the kin and the call cards are all lovely. Kin overlap on the den canvas, and the alpha burst text renders as a black smear.
- **Feel/responsiveness 7**: calls start at once and every deed succeeded. The howl ring on a digging mole never fills, so a 15-minute dig still looks frozen.
- **Stability 9**: no page errors and no failed deeds. The chain was live the whole time.

## 3. Findings

1. **[MAJOR] After a raid, nothing tells you what you lost or who took it** · #/den · steps: dig a shard, then wait while fang2claw raids you (about #218107) · expected: a lasting banner or log entry like "FANG2CLAW SNATCHED 1 SHARD · KING DOWN", plus a loud full-screen moment while it happens · actual: there is a toast, "PROWLERS! · FANG2CLAW DEFEND". It names the raider, which is good, but it is only a toast and I never caught it on screen. A minute later SHARD had gone 1 → 0, the Sun Lion had vanished, the running FORGE howl was silently dropped, and the only thing left was a "NO KING · CALL" banner. My chief menu has no history. A first-timer has no idea a raid happened or that a shard was stolen. · shot: qa/playtests/shots/nova2-024.png

2. **[MAJOR] Dig and forge time estimates are about 2x off, and the speed words contradict them** · den kin label and kin card · steps: call the Dig Mole and read "DIG ~37M" and "DIG SLOW · ~37M" · actual: the first dig finished in about 18 minutes. The second showed ~35M and finished in about 13–14 minutes. Separately, the estimate does not track the howl itself: at WAIT 0/10 it said ~26M, and later at WAIT 0/18 it said ~35M. The Forge Badger card says "FORGE VERY SLOW · ~2M" and the forge took about 4 minutes, so "VERY SLOW" was much faster than "SLOW". The round-1 complaint about speed words is only half fixed: the words still don't match reality. · shots: nova2-014.png, nova2-036.png

3. **[MAJOR] The howl progress ring on a digging kin never advances** · #/den, the ring above the Dig Mole · steps: compare the ring at DIG ~37M and DIG ~28M, about 9 minutes apart · expected: the ring fills as time passes · actual: the ring is identical, a tiny tick at 12 o'clock. The HOWL panel says "DIG WAIT · 0/10 · 0%" for most of the dig, and only the last minute or two shows "hashing 7/9". The time countdown helps, but the ring and "0%" still make the dig look idle, which was the round-1 complaint. Fill the ring by elapsed/estimated time, or label the wait phase in plain words. · shots: scratch/nova2/ring1.png and ring2.png, nova2-021.png

4. **[MAJOR] The first-alpha payoff is small and its text is unreadable** · #/den canvas · steps: let the first forge complete (#223950) · expected: a big "FIRST ALPHA!" moment · actual: a yellow burst with falling α coins appears over the badger for a few seconds. The word inside the burst renders as a solid black smear. There is no DOM banner, no toast and nothing that stays, apart from the ALPHA meter going to 1.00 and the quest strip ticking ALPHA. The shard payoff is a small "DIG!" burst that fades near the mole. My first-ever shard landed during a wait, and the lab recorded no toast or dialog for it at all. · shots: nova2-042.png, scratch/nova2/alpha-burst.png, nova2-036.png

5. **[MAJOR] Phone top bar still hides PULSE and HOWL and clips GLOW** · #/den on phone (390 wide) · expected: all five meters visible · actual: only α, shard and a clipped "2,746" glow show before the live dot and the chief button. PULSE and HOWL are gone. On desktop all five meters show correctly (α 1.00, shard 0, glow 2,746, pulse FULL, howl 1), so the fix only holds on desktop. The bottom nav also clips "GLY…". · shot: nova2-044.png

6. **[MINOR] The CALL dialog hides most kin below the fold** · CALL NEW KIN dialog · steps: open CALL and try to pick Stone Burrow · actual: at 1280x800 only the GROW and GLOW rows are visible. The WARD row peeks in at the bottom edge and PACK is fully hidden. Clicking the hidden card did nothing. Mouse-wheel scroll did not move the dialog either; only arrow keys after clicking inside it worked. A first-timer might think there are only 5 kin. · shots: nova2-026.png, nova2-028.png

7. **[MINOR] Kin overlap on the den canvas** · #/den · once the mole, badger and burrow are all on the root ring, the Forge Badger sits on top of the Dig Mole and Stone Burrow sprites. The "DIG ~xxM" label gets covered by the DIG! burst and "AWOO" text. · shot: nova2-036.png

8. **[MINOR] The HOWL panel ignores Escape and covers the kin card** · HOWL meter → panel · Escape left the panel open; only its × closed it. The panel also sits over the kin card, whose edges peek out behind it, and over the end of the quest strip. · shot: nova2-021.png

9. **[POLISH] The FORGE card says "VERY SLOW" with no estimate while there are no shards** · Forge Badger card · it should say something like "NO SHARD" until it has work. · shot: nova2-019.png

10. **[POLISH] The HOWL meter label keeps changing ("HOWL 1" → "HOWL 2.7M")**, so a by-name or by-number click on it often fails in the lab ("control is gone"). Mostly a tooling issue, but it is also hard to read: "2.7M" looks like a time, not a hash rate.

## 4. Delights
- Onboarding is smooth: NEW PAW, 24 words with a KEPT checkbox, a name check that says "GOOD NAME", JOIN · ROAM, then a "DEN FOUND!" dialog. I was in my den in about 4 clicks and 15 seconds.
- The quest strip (CHIEF ✓ MOLE ✓ DIG ✓ BADGER ✓ ALPHA ✓ PROWL) and the "5 SHARD IN GROUND · CALL MOLE" / "1 SHARD · FORGING" banners always told me the next step.
- The kin labels with "DIG ~37M" and the kin card's "DIG SLOW · ~37M" fix the round-1 "no time shown" problem. I always knew roughly how long to wait, even if the number ran long.
- The raid toast names the raider ("FANG2CLAW"), and the "NO KING · CALL" banner gives a one-click recovery. Re-calling the king took under a minute.
- The art is great: the CALL! burst, the coin rain on alpha, the dome den and the call cards.

## 5. One change I'd make first
Make getting raided impossible to miss and easy to understand afterwards. Show a full-width alert during the raid ("FANG2CLAW PROWLS YOUR DEN · DEFEND"). After it, leave a banner that stays until dismissed ("FANG2CLAW SNATCHED 1 ◆ · KING DOWN · CALL"). Then a new player who loses their first shard knows who took it, why their forge stopped, and what to do next.
