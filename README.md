# Furrency

**Be the Alpha.** *DIG · FORGE · POUNCE · HOWL*

A comic-ink skin of Structs, drawn on a 2D canvas: majestic fur beasts with cyber eyes, thick black lines, halftone dots and loud colours. It plays the real Structs network: every chief, den, clan sun, blow and proof is read live from the chain, and every button signs a real transaction. The other players are ordinary Structs players, playing in their own clients.

**Alpha** is the coin. Everything else has its own name and its own sign.

## Play

```bash
pnpm install
pnpm dev        # http://localhost:5193 — the public Structs testnet
```

### A plain static site (the default build)

```bash
pnpm build      # dist/ — host it anywhere (GitHub Pages, S3, nginx, `python3 -m http.server`)
```

The built page talks to every system **directly**: the chain node (LCD + Tendermint websocket), each clan's `guild.json`, GRASS, and the clan's Guild API for signup and sign-in. No relay, no server code. Container: `docker build -t furrency . && docker run --rm -p 8080:8080 furrency` serves the same static `dist/`.

### GitHub Pages, with CI

Push to `main` and `.github/workflows/pages.yml` builds and publishes `dist/` to GitHub Pages. Set it up once under **Settings → Pages → Source: GitHub Actions**. No secrets are needed. The share card, sitemap and 404 page pick up the Pages address automatically. `.github/workflows/ci.yml` runs typecheck, `pnpm test`, a root build and a `/furrency/` project-path build, then `pnpm smoke`, which opens every place in headless Chrome against the live testnet and again with it down. The details are in [docs/CI-AND-DEPLOY.md](docs/CI-AND-DEPLOY.md).

```bash
pnpm typecheck && pnpm test   # what CI checks first
pnpm smoke                    # needs Chrome and the testnet
```

### Dev, through the relay

`pnpm dev` runs the relay inside Vite (`relay/relay.mjs`): clan calls go through it, so the clan session cookie works however the browser treats cross-site cookies. A build can opt in with `VITE_RELAY_URL=/` (and `RELAY=1` on `serve.mjs`, or the container), or `VITE_RELAY_URL=https://relay.example` for a relay elsewhere.

### Links, search and sharing

Set the public address when you build so link previews and search engines get absolute URLs:

```bash
SITE_URL=https://furrency.example pnpm build
```

- `index.html` carries the title, description, Open Graph and Twitter card tags (a 1200×630 `og.png`), icons, a web manifest and a `VideoGame` JSON-LD block. It also holds a visually hidden `<article id="about">` that explains the game in plain text, so crawlers and screen readers get something to read.
- `site.plugin.mjs` fills in `%SITE_URL%`, then writes `robots.txt` (everything allowed) and `sitemap.xml`. Without `SITE_URL`, canonical and `og:url` are left out and the images use relative paths. Most scrapers want absolute image URLs, so set it for any public deploy.
- The share card and icons are drawn with the game's own ink. To redraw them into `public/` while `pnpm dev` is running, use `node scripts/brand/render.mjs http://localhost:5193`.
- Links to [Structs](https://playstructs.com) (the official game) and [structs.ai](https://structs.ai) (technical docs) sit in the rail's **MORE** menu and in the small footer on the title screen.

## The words

| Furrency | Structs |
|---|---|
| α ALPHA | alpha (ualpha) |
| ◆ SHARD | ore (stealable until forged) |
| GLOW | power / energy |
| PULSE | charge (blocks since the last action) |
| HOWL | proof of work |
| DEN | planet |
| PACK | fleet |
| KIN | structs (beasts in STAR / SKY / ROOT / TIDE = space / air / land / water; TOTEMS = planet structs) |
| SUN LION · KING | command ship |
| CALL · WAKE · NAP · HIDE · GUARD · LEAP · RELEASE | build · activate · deactivate · stealth · defend · move · trash |
| DIG · FORGE | mine · refine |
| PROWL · POUNCE · SNATCH | fleet move · attack · raid complete |
| ROAM | explore a new planet |
| CLAN · SUN · FEED · PULL | guild · reactor · infuse · defuse |
| PAW · PAW WORDS | wallet · mnemonic |

## Places

| Place | What |
|---|---|
| GATE | title; live ticker of what the whole network is doing |
| DEN | your island under four zones; tap a kin, tap a ring to CALL |
| HUNT | every den as a galaxy around its clan's sun; pick prey, PEEK, PROWL |
| PROWL | your pack vs theirs in four lanes; odds before every POUNCE; AUTO fights on |
| GLOW | clan suns; FEED alpha for glow |
| KIN | every beast and totem with its chain numbers |
| GLYPHS | every sign, and the game in three comic strips |

## Where the data comes from

| Layer | What it serves | Code |
|---|---|---|
| **Clan (Guild API)** | first choice for reads: a chief's whole pack in one `struct/player/{id}` call plus their pending proofs (`work/player/{id}`); every chief (`player/list/all`) with shards and last move (`grid/attribute-type/{ore,lastAction}/object-type/player`) in a few pages | `src/net/clan.ts`, `src/guild/api.ts` |
| **GRASS** (the clan's NATS-over-websocket feed) | live: grid values patch the chiefs we follow at once (`empire.patchGrid`), any event touching them triggers a re-read of exactly that chief (`empire.poke`), ore/lastAction keep the hunt roster live, the Gate ticker tells the network's story | `src/grass/`, `src/main.ts`, `src/net/roster.ts` |
| **Cache** (IndexedDB) | the hunt roster paints instantly on return, then refreshes (clan, else chain) | `src/cache/idb.ts`, `src/net/roster.ts` |
| **Chain node** (LCD + Tendermint websocket) | the fallback for every read, the authority for planets/fleets, block heartbeat, and where every signed deed goes | `src/chain/` |

Every Guild API data route needs a signed-in clan session (a cookie). The clan link signs in with the paw (`LOGIN_GUILD{guild}ADDRESS{addr}DATETIME{ts}`):

- **Direct** (static build): a credentialed request straight to the clan. The live clans answer with the page's origin and `Allow-Credentials`, but the browser keeps their cookie for this page only if it may travel cross-site (`SameSite=None`) or the page is served on the clan's own site. The link proves the session with a members-only read (`/api/block`) before using it.
- **Relayed** (dev): the relay keeps one cookie jar per browser.

Without a session, or while the clan's indexer trails the chain by more than 4 blocks, reads fall back to the chain node. The top bar shows the links: **GRASS** and **CLAN**. Set `VITE_GUILD_DATA=off` to stay on the chain node alone.

## Under the fur

The network layer (LCD + Tendermint websocket, the HD wallet vault, protobuf signing, the deed queue, the multi-worker/WebGPU proof engine, guild signup, the combat math) comes from Wyrmhold / structs-xyz. Everything you see is new: `src/art/` (ink kit, beasts, totems, effects, stage), `src/scenes/`, `src/screens/`, `src/ui/`, `src/lore.ts`.

## A private devnet

`structs-xyz/scripts/devnet` runs a single-node chain plus a mock guild on localhost. Point Furrency at it with the `furrency-devnet` entry in `.claude/launch.json` (LCD `127.0.0.1:31317`, RPC `ws://127.0.0.1:36657/websocket`, the relay in local mode with `STRUCTS_LCD` + `RELAY_ALLOW_LOCAL=1`, `VITE_DEFAULT_GUILD=0-1`) and open http://127.0.0.1:5194.
