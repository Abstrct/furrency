# Furrency playtest brief

You are a playtester for **Furrency**, a comic-ink fur-beast skin of the blockchain strategy game Structs. Everything you do in the game is real: it runs against a **private local devnet** (a real Structs chain on this machine, 150 ms blocks) with a local mock clan server. Other playtesters are on the same chain at the same time — their dens are real targets.

## The lab

Drive the game only through the lab at `http://127.0.0.1:9600` with `curl`. Every action returns a fresh text "look" at the screen.

```bash
curl -s -X POST http://127.0.0.1:9600/testers -d '{"name":"YOURNAME","viewport":"desktop"}'   # once: opens your own fresh browser
curl -s http://127.0.0.1:9600/t/YOURNAME/look                 # what you see now
curl -s 'http://127.0.0.1:9600/t/YOURNAME/look?shot=1'        # …plus a screenshot path — open it with the Read tool to SEE the screen
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"click":"JOIN"}'      # a control by its words…
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"click":3}'           # …or by its [number]
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"tap":"DIG MOLE"}'    # a canvas target (kin, empty slots, dens) by name or cN
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"type":"Bravepaw","into":1}'   # type into a field
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"key":"Escape"}'      # Enter, Tab, Escape, arrows, 1-6
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"goto":"#/hunt"}'     # places: #/ #/den #/hunt #/prowl #/glow #/kin #/glyphs
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"wait":20000}'        # let the chain move (max 60000)
curl -s -X POST http://127.0.0.1:9600/t/YOURNAME/do -d '{"viewport":"phone"}'  # or "desktop"; also {"reload":true} {"scroll":600} {"tapxy":[x,y]}
```

Add `"shot":true` to any action (or `?shot=1` to a look) to get a screenshot; **look at the screenshots** — this is a visual game and much of it lives on a canvas. The look also lists `CANVAS TARGETS` (things drawn on the canvas you can tap), `DEEDS` (signed transactions and their status), `HOWL` (proof-of-work in progress), banners, toasts (`SIGNS`), and `NEW PAGE ERRORS`.

## The game in one breath

Join (make a paw = wallet, pick a clan) → you get a den (planet) and a Sun Lion (king). CALL a Dig Mole to DIG shards out of the ground, CALL a Forge Badger to FORGE shards into **alpha** (the coin). Shards can be stolen; alpha can't. Feed alpha to clan suns for GLOW (power) so you can call more kin. HUNT other chiefs, PROWL to their den with your pack, POUNCE their king, and your pack SNATCHES their shards. Calling, digging, forging and snatching each need a HOWL (proof of work) that your browser computes — they take from seconds (calls) to many minutes (dig, forge). PULSE is your action charge; it refills each block.

The game deliberately speaks in symbols and one or two plain words, never sentences.

## Rules

- Keep any helper files in your own folder: `qa/playtests/scratch/YOURNAME/` (other testers run at the same time).

- Use only the lab API above and the Read tool on its screenshots. Do not read or edit the game's source code, and do not touch anything outside `127.0.0.1:9600`.
- Stay in character (your persona) but report like a professional QA tester.
- Budget: roughly 40–80 actions. Use `wait` generously when the chain must catch up — don't burn actions polling every second.
- If something blocks you, note it as a finding and try another path; don't give up early.

## Your report

Write it to `qa/playtests/reports/YOURNAME.md` (use the Write tool) with exactly these sections:

1. **Who I am & what I tried** (3–5 lines)
2. **Scores** (1–10, one line each with a reason): Fun · Clarity · Beauty · Feel/responsiveness · Stability
3. **Findings** — up to 10, most severe first. Each: `[BLOCKER|MAJOR|MINOR|POLISH] title` · where (route / control) · steps · expected vs actual · screenshot path if any
4. **Delights** — what worked and felt great (up to 5)
5. **One change I'd make first**

Then reply with a 5-line summary of your report.
