# Playtest report: muse (art director, desktop 1280x800)

## 1. Who I am & what I tried

I'm the art director. The target I judged against was: comic book, bright colours, thick black ink, halftone dots, and majestic anthropomorphic fur beasts with cyber eyes, so it should feel magical and mystifying. I went through the title, KIN, GLYPHS, the full JOIN flow, the DEN in four states (fresh, calling, pack away, king lost/snatched, then 3 kin), two CALL dialogs (one enabled, one fully disabled), the HUNT map at default, zoomed in and zoomed out, the prey card, two PROWL clashes (a snatch on Fenclaw, then a POUNCE on Rook with a WHAM blow), the GLOW page, and the kin detail sheet. I read 30 screenshots (muse-002 … muse-035).

## 2. Scores

- **Fun 6/10**: the WHAM! / SNATCHED! / CALL! bursts and the split-panel clash are a real thrill. Between those beats, the screens feel like a dashboard.
- **Clarity 6/10**: the one-word signage mostly works. But a name breaks mid-word, "PACK AWAY" appears twice, the α glyph reads as "u", and my king died with no visible cause.
- **Beauty 7/10**: the title, the GLOW hero and the PROWL clash are on-brief comic art. The KIN cards, the hunt map and the stat cards fall back to flat dark-UI-kit style.
- **Feel/responsiveness 5/10**: the bursts and the ghost-silhouette summon read well. The CALL! burst sits on top of the hero, clouds drift through the dome, and the screenshot/action round trips took 20s–4m40s.
- **Stability 5/10**: no page errors. But ENTER DEN with a screenshot hung for more than 2 minutes, a look request timed out at 110s, and the PULSE label is clipped on every in-game screen.

## 3. Findings

1. **[MAJOR] The beasts are one bust template with a palette swap, so they don't read as majestic or as their species**
   - Where: #/kin, den canvas, prowl canvas
   - Steps: open KIN and scroll all three pages (muse-004/005/006).
   - Expected: each beast has a distinct silhouette and pose (rhino bulk, boar tusks and snout, mink length, bat wingspan), shows dynamic three-quarter angles, and the Sun Lion has a mane that bursts out of the frame.
   - Actual: every kin is the same front-facing shoulder bust with the same visor glasses and the same collar line. *Boulder Boar* reads as a jackal/doberman (no tusks, no snout disc). *Iron Rhino* and *Gust Ferret* have round mouse/koala ears. *Deep Mink* has a unicorn horn. Rook's king on the prowl screen is a pixel-identical copy of my lion (muse-025). The "cyber eyes" are just glasses.
   - Fix: redraw at least the silhouettes per species, add glowing cyber irises and circuit lines in the fur, and give kings a unique mane colour per chief.
   - Screens: muse-005.png, muse-006.png, muse-025.png

2. **[MAJOR] Losing your king has no story**
   - Where: #/den after a prowl
   - Steps: PROWL Rook → POUNCE → DEN → HOME PACK, then check the den.
   - Expected: a dramatic KO panel (broken crown, X-eyes, "FELLED BY ROOK", ink splash) where the lion stood.
   - Actual: the lion simply vanishes. A "SNATCHED!" burst floats over the clouds, a small "NO KING · CALL" chip appears, and nothing says who did it or how. The meter showed SHARD 0 while the state said shards 1 for a moment.
   - Screen: muse-031.png

3. **[MAJOR] The HUNT map is an empty starfield of yellow dots**
   - Where: #/hunt and the zoom controls
   - Steps: open HUNT, zoom in ×2, then zoom out ×4.
   - Expected: dens drawn as tiny floating islands with the chief's beast face or crest, halftone nebula clouds, ink-outlined orbits, and a map that fills the canvas.
   - Actual: identical 10px yellow dots, with labels only on the two dens that hold shards. The cluster fills about a third of the canvas, with large dead purple space on the right. Zoom-out bottoms out almost at the default. The "DEVNET GUILD" label sits on top of dots and the YOU ring, and the prowl tether line crosses it. The `- / +` zoom buttons are tiny glyphs.
   - Screens: muse-019.png, muse-020.png, muse-021.png, muse-022.png

4. **[MAJOR] Comic bursts cover the characters they announce**
   - Where: den CALL!/UP!, prowl WHAM!
   - Steps: call any kin, or POUNCE.
   - Expected: the burst sits behind or beside the beast and the beast reacts (flash, squash, recoil).
   - Actual: "CALL!" sits on the lion's crown (muse-018, muse-034). "UP!" covers the mole's face. "WHAM! −2" fully hides the struck Dig Mole, so you never see the blow land (muse-026). The prowl "SNATCH!!" burst is rendered semi-transparent olive-grey behind the SKY zone label, which looks muddy (muse-024).

5. **[MINOR] Layering and overlaps on the den canvas**
   - Where: #/den
   - Clouds drift inside and in front of the hex dome and over empty slots (muse-029, muse-034).
   - The zone label "ROOT" is clipped by the island edge and hidden behind kin.
   - The top progress strip (CHIEF…PROWL) runs under the "TAP A KIN · TAP +" hint box, and the hint box and kin sheet cover the moon.
   - A stray burst fragment ("…IE!") is cut off behind the PACK panel and header at top left (muse-014).
   - "PACK AWAY" shows twice: once as the top chip and once as the big pink banner in the dome (muse-029).

6. **[MINOR] Prey card breaks the chief name mid-word**
   - Where: #/hunt prey card
   - Steps: click FENCLAW.
   - Actual: the name renders as "FENCLA / W".
   - Expected: auto-shrink the type or ellipsize; never break a word.
   - Screen: muse-022.png

7. **[MINOR] The comic display font has no α glyph**
   - Where: #/glow stat cards
   - Actual: "0 α" and "110 α" fall back to a glyph that reads as "u".
   - Fix: use the custom α coin glyph from the header.
   - Screen: muse-028.png

8. **[MINOR] A disabled CALL catalogue goes grey and lifeless**
   - Where: CALL dialog while the pack is away
   - Actual: every card drops to about 50% grey and each one repeats a "PACK AWAY" tag. Separately, with a single option (muse-017) the modal is mostly empty cream with one card in the top-left corner.
   - Expected: keep the art in full colour with a single "PACK AWAY → HOME" ribbon across the top, and size the modal to its content.
   - Screens: muse-030.png, muse-017.png

9. **[MINOR] Top bar PULSE meter label is clipped**
   - Where: header on every in-game route
   - Actual: the label is cut to "PULS" / "PU" (muse-014 onward).
   - The GLOW meter's micro-bar and the GLOW page's "USE 575 · HAVE 6,000" bar both show a tiny fill when you are mostly full of spare glow, so they read as "empty".

10. **[POLISH] Off-style UI-kit elements**
    - The NAME search field is a grey filled default input (muse-019).
    - The KEPT checkbox is a plain dark-grey square (muse-009).
    - The clan row in CHIEF shows an empty checkbox and a check mark at the same time (muse-011).
    - "DEN FOUND!" is yellow on cream with no ink outline, which is nearly unreadable at the big payoff moment (muse-013).
    - The glyph icons are uniform thin-stroke UI icons rather than brush-inked, and WAKE and SUN reuse the same sun (muse-007).
    - KIN portrait frames are flat navy with no halftone or rays. The dark beasts (Shade Bat, Deep Mink) vanish into them, and the Void Owl and Shade Bat wings are hard-cropped by the frame (muse-004/005).

## 4. Delights

- The title screen is on target: speed-line rays, magenta halftone, the giant ink-outlined FURRENCY with pink offset, sticker verbs, and drifting kin with floating α coins (muse-002).
- The PROWL clash: the cyan vs pink halftone panels with a torn seam, the hazard-tape tether, flying shards, and a WHAM! −2 burst with star debris are pure comic book (muse-024/026).
- The GLOW hero banner, with the α coin in a starburst over pink/orange rays (muse-027).
- Small, witty touches: the Dig Mole's headlamp beam, glowing eyes in the island cave, tilted sticker action cards, the cyan ghost silhouette for a kin being called, and the AWOOO howl text.
- Speaking in signs works: one icon plus one word holds up across the nav, the chips and the glyphs page.

## 5. One change I'd make first

Redraw the kin as distinct, heroic characters, not one recoloured bust. Give each species its own silhouette and a three-quarter pose, real glowing cyber eyes (not glasses), ink-and-halftone shading, and an over-the-frame mane and crown for kings. Then let the KIN card, den and clash portraits use them at a larger size on a halftone/ray backdrop. The beasts are the brand and are what should feel majestic. The chrome is already mostly there.
