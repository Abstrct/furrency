# Playtest report: pip2 (round 2, phone 390x844)

## 1. Who I am & what I tried
I'm Pip2tail, a phone-only player. I re-checked each round-1 phone bug on the 390x844 viewport: I joined with a new paw (DEVNET CLAN), entered my den, called a Dig Mole and later a Gust Ferret, and opened HUNT. From there I picked chiefs from the prey list and from search, and used PEEK and PROWL on the chief card. I POUNCED Fangraider's king until it fell and SNATCHED 1 shard. Fang2claw then raided me back, so I called a new king and prowled Fang2claw in revenge, felling their Storm Hare. I also went through GLOW (including FEED), KIN, GLYPHS, the chief/paw dialog and a long CALL dialog. I used about 60 actions, and no page errors appeared.

## 2. Scores
- **Fun: 8**. The prowl loop is great: pounce, WHAM!, king falls, SNATCH! +1 shard. Being raided back within minutes made the world feel alive.
- **Clarity: 6**. The symbols read well, but PULSE and HOWL can't be seen on phone. Glow also drops with no action from me, and the "0/NN idle" howl count is hard to read.
- **Beauty: 8**. The comic-ink art, the stickers and the split-colour prowl arena look great. The prowl screen layout still collides on phone.
- **Feel/responsiveness: 8**. Calls, prowls and pounces landed within a second or two, and the PROWL card took me straight into the arena.
- **Stability: 8**. Every deed I made succeeded and there were no page errors. Two taps fell through the chrome onto the wrong thing (findings 4 and 5).

## 3. Findings

**[MAJOR] Prowl arena still overlaps itself on phone (round-1 bug is NOT fixed)**
- Where: `#/prowl/<den>`, kin picker, odds chips, GUARD KING button
- Steps: HUNT, pick FANG2CLAW (it has a pack), PROWL from the card.
- Expected: the four lanes (STAR/SKY/ROOT/TIDE), the kin on them and the controls each have their own space.
- Actual:
  - The kin picker sits on top of the ROOT and TIDE lanes. With long kin names (GUST FERRET / STORM HARE) it wraps into two stacked rows that cover the defender's ROOT kin, including their king.
  - The HIT/DMG/FELL chips cover the TIDE label and the Fang Walrus.
  - The "GUARD KING · GUST FERRET" button covers both chief names, so the header reads "PIP2…" vs "…CLAW".
  - The defender's ROOT lane (Iron Rhino, Sun Lion, Dig Mole) is crammed into one overlapping clump, so the king I'm meant to pounce is tiny and half hidden.
  - Even with a sparse pack (Fangraider, shots 019/020) the picker and chips still sit on the TIDE lane.
- Shots: `qa/playtests/shots/pip2-047.png`, `pip2-048.png`, `pip2-049.png`, `pip2-019.png`

**[MAJOR] PULSE and HOWL meters are still hidden on phone at rest**
- Where: top meter bar, every route
- Steps: open any screen on phone.
- Expected: PULSE (needed for POUNCE, 3 per hit) and HOWL (work in progress) are visible, or there is a clear sign the bar scrolls.
- Actual:
  - Only ALPHA, SHARD and GLOW show. A thin white sliver at the right edge is the only sign more meters exist, and there is no fade, arrow or peek.
  - Clicking the HOWL control (it exists in the DOM) and tapping the sliver did nothing visible.
  - After a call my PULSE dropped to 3 and HOWL ran a job, and I couldn't see either without opening a dialog. CALL and the GLYPHS legend do show PULSE, so players learn it exists but can't find it.
  - Sideways scrolling may work with a real finger swipe, but the lab can't swipe and nothing tells a player to try.
- Shots: `pip2-009.png`, `pip2-012.png`, `pip2-034.png`

**[MAJOR] "PROWLERS! · DEFEND" warning shows under an open dialog and is gone before I can act**
- Where: global toast while a dialog is open (my paw dialog on GLYPHS)
- Steps: open the top-right chief/paw dialog while someone prowls you.
- Expected: the raid warning interrupts me, or stays until I've seen it.
- Actual:
  - The pink "PROWLERS! · FANG2CLAW · DEFEND" toast sat at the bottom behind the dialog dimmer.
  - I closed the dialog and DEFEND was already gone. Within seconds the toasts read "KING DOWN · FANG2CLAW FIGHT" and "−1 SHARD", and my Sun Lion had vanished from KIN.
  - On a phone, where dialogs fill the screen, this is the moment that matters most.
- Shot: `pip2-035.png`

**[MINOR] Top canvas slots and buttons near the bottom nav are covered by chrome, so taps land on the wrong control**
- Where: `#/den` STAR row; `#/glow` clan-sun FEED button
- Steps:
  1. In the den, tap the empty STAR PACK slot (c1). Nothing opens, because the slot sits under the action row and zone strip (CALL/GLOW/HUNT…, CHIEF/MOLE/DIG).
  2. On GLOW, scroll so the clan-sun FEED button sits just above the bottom nav, then click FEED.
- Expected: the slot opens CALL, and FEED shows feed or "NO ALPHA".
- Actual:
  1. The STAR slot can't be reached.
  2. FEED took me to the HUNT map. The tap went through to the HUNT tab in the bottom nav. Retrying with FEED fully visible gave the correct "NO ALPHA · FORGE FIRST" toast.
- Shots: `pip2-040.png`, `pip2-028.png`, `pip2-029.png`

**[MINOR] Bottom nav clips GLYPHS, even when GLYPHS is the active tab**
- Where: bottom nav, all routes
- Expected: all 6 tabs fit, or the active tab scrolls into view.
- Actual: the last tab reads "GLYI" and is cut at the screen edge, including on `#/glyphs` itself.
- Shots: `pip2-031.png`, `pip2-009.png`

**[MINOR] Den chrome clips on the left; the zone strip starts mid-word**
- Where: `#/den` header
- Actual:
  - The zone strip reads "IEF | MOLE | DIG…" (CHIEF is cut).
  - A pink "OM" logo fragment peeks out behind the CALL button.
  - The canvas zone labels (STAR/SKY/ROOT) are cut off by the dome edge on the left.
- Shot: `pip2-009.png`

**[MINOR] Spare glow drains with no action and no explanation**
- Where: GLOW meter
- Steps: watch the GLOW meter while doing nothing that costs glow.
- Expected: glow only changes when I spend it, or the meter shows why it moved.
- Actual:
  - The meter went 4,978 → 4,478 (my mole call, expected) → 4,225 → 3,996 while I only browsed and pounced.
  - The GLOW screen explains "SHARE SPLITS · MORE DENS · LESS EACH" (21 dens now), but the top meter gives no hint, so it feels like a leak.
- Shot: `pip2-026.png`

**[POLISH] Chief card names break mid-word, and the card is a top sheet, not a bottom sheet**
- Where: HUNT chief card
- Actual:
  - Names break mid-word: "SAGEKE/EPER", "FANGRA/IDER", "FANG2C/LAW". Even 9-character names do this.
  - The card opens at the top of the screen. The brief said bottom sheet, but the top works fine.
  - The close × is a small unboxed glyph, while dialogs use a big black boxed ×. It is still on screen with 10-character names, so the round-1 bug is fixed.
- Shots: `pip2-014.png`, `pip2-017.png`, `pip2-045.png`

**[POLISH] Hit stickers collide, and toasts cover the bottom nav and the arena controls**
- Where: prowl arena; global toasts
- Actual:
  - Two pounce stickers overlap into "WHAM!WHAM!" and "POW!AM!".
  - The "+1 SHARD!" sticker covers "FANGRAIDER" in the header.
  - Toasts ("PROWL · FANGRAIDER DEN", "GUST FERRET · UP!") cover AUTO or half the bottom nav for several seconds.
  - After the SNATCH the arena stays up with only HOME. It is a dead end until I leave.
- Shots: `pip2-020.png`, `pip2-024.png`, `pip2-045.png`

**[POLISH] Peeking another den highlights DEN in the nav, and the prowl route label says HUNT**
- Where: `#/den/1-9` (PEEK), `#/prowl/1-7`
- Actual:
  - Peeking Sagekeeper's den highlights my own DEN tab.
  - The "THEIRS!" sticker in the top right is half hidden under the PROWL/MY DEN buttons.
  - On first entry to the prowl route the screen title reads HUNT.
- Shots: `pip2-015.png`, `pip2-018.png`

### Round-1 phone issues, re-verified
| Round-1 issue | Status |
|---|---|
| HUNT had no chief card, so you couldn't PROWL (blocker) | **FIXED.** The card opens from the list, search and the map. PEEK and PROWL both work, and PROWL moves the pack straight into the arena. (014, 017, 018) |
| Top bar overflow (HOWL hidden, PULSE missing) | **PARTLY FIXED.** Nothing overflows the layout any more, but PULSE and HOWL are still off-screen with no scroll hint. (009, 034) |
| Prowl screen overlapped itself | **NOT FIXED.** See finding 1. (047–049) |
| Dialog headers scrolled away | **FIXED.** In the long CALL · SKY dialog the title and × stay pinned while the body scrolls. One small flaw: the body slides under the header with no backing, so "PACK" peeks out under "SKY", and the GLOW/PULSE chips scroll away. (043) |
| Long names pushed the close button off | **FIXED** for chief names up to 10 characters (the × stays). Names wrap mid-word instead (finding 8). I didn't find a 20-character chief to try the extreme case. |

## 4. Delights
- Joining on phone is smooth. The PAW → WORDS → CLAN → DEN stepper fits perfectly, the 24-word grid is readable, and I was in a den in about 15 s. (004, 006)
- The prowl, pounce, fell and SNATCH! loop is quick and loud. The "+1 SHARD!" sticker and the striped SHARD meter felt like a real win. (023)
- Search in HUNT ("fang") filters both the list and the map at once, which helps a lot on a small screen.
- After my king fell, the "NO KING · CALL" banner re-called the Sun Lion with one tap.
- The KIN bestiary and the GLYPHS legend are lovely and readable on phone. (030, 031)

## 5. One change I'd make first
Give the phone prowl arena a real layout. Move the kin picker, the odds chips and GUARD KING into a fixed control tray below the four lanes, never on top of them, and spread a crowded lane horizontally. The arena is the heart of the game and it's where phone players fight.
