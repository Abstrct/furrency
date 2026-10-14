# CI and deploy: GitHub Actions → GitHub Pages

How Furrency is checked and shipped. There are two workflows in `.github/workflows/`, no secrets,
and no server of our own. The site is static files on GitHub Pages. The page talks to the chain,
GRASS and each clan directly, with no relay.

| Workflow | File | Runs on | Does |
|---|---|---|---|
| **CI** | `ci.yml` | every PR, push to `main`, manual | Typecheck, tests, two builds, then the smoke test |
| **Deploy to GitHub Pages** | `pages.yml` | push to `main`, manual | Typecheck, tests, build with the Pages address, publish `dist/` |

The two run on their own: **the deploy doesn't wait for CI**. It repeats typecheck and tests, so a
red unit test still blocks the release. A failing smoke job does **not**, because smoke depends on
the public testnet being up.

```
push to main ──┬─► CI ── check ──► smoke   (every place in headless Chrome vs. live testnet, and with it down)
               │
               └─► Pages ── build (typecheck, test, vite build) ──► deploy-pages
```

---

## 1. Toolchain (the same in every job)

```yaml
- uses: actions/checkout@v7
- uses: pnpm/action-setup@v6        # pnpm version comes from package.json "packageManager" (pnpm@9.15.9)
- uses: actions/setup-node@v7
  with: { node-version: 24, cache: pnpm }
- run: pnpm install --frozen-lockfile
```

- Node 24, pnpm pinned through `packageManager`, and a lockfile-exact install.
- Runtime dependencies are only the noble/scure crypto libraries. The game is a 2D canvas with no
  engine.
- Everything runs on `ubuntu-latest`. There's no Docker in CI.

## 2. What `pnpm build` is

```
tsc --noEmit  &&  vite build
```

- **One page, hash routes.** Every place in the game (`#/den`, `#/hunt`, `#/prowl`…) is the same
  `index.html`, so there's nothing to prerender.
- **Relative build.** `vite.config.ts` sets `base: './'`, so the same `dist/` works at a domain's root
  and under a project path (`/furrency/`). The manifest, icons and worker URLs are relative too.
- **`site.plugin.mjs`** fills in `%SITE_URL%` in `index.html`: canonical, Open Graph, Twitter card
  and JSON-LD. It also writes:
  - `robots.txt`: everything allowed, plus the sitemap.
  - `sitemap.xml`
  - `404.html`: a small LOST page that sends any stray path home. Pages serves it for paths it
    doesn't have.
- **`SITE_URL` (or `VITE_SITE_URL`) must be the whole public address**, path included
  (`https://<owner>.github.io/furrency`). Social scrapers need absolute image URLs. Without it, the
  build still works, but it drops canonical and `og:url` and leaves image paths relative.

### Build-time settings

These are baked into the bundle. They can't be changed at runtime without a rebuild. An unset or
empty value means the default.

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` / `VITE_SITE_URL` | none (relative tags); on Pages, the Pages address | Canonical, OG/Twitter, sitemap, 404 home |
| `VITE_LCD_URL` | `https://public.testnet.structs.network` | Chain REST |
| `VITE_RPC_WS_URL` | `wss://public.testnet.structs.network:26657/websocket` | Live blocks |
| `VITE_GRASS_URL` | `wss://beta.playstructs.com:1443` | Clan event stream (`off` disables it) |
| `VITE_DEFAULT_GUILD` | `0-5` | The clan whose infrastructure backs the client by default |
| `VITE_GUILD_DATA` | on | `off` stops reading the clan Guild API (chain only) |
| `VITE_RELAY_URL` | unset (direct) | Opt-in relay. Not used on Pages, which can't run one. |

---

## 3. CI workflow (`ci.yml`)

```yaml
on: { push: { branches: [main] }, pull_request: {}, workflow_dispatch: {} }
permissions: { contents: read }
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }   # a new push cancels the old run
```

### `check` (15 min): the gate smoke waits for

| Step | What |
|---|---|
| `pnpm typecheck` | `tsc` for the app, then for the app plus `tests/` (`tsconfig.tests.json`) |
| `pnpm test` | Four `tsx` suites, plain Node with no framework (below) |
| `pnpm build` | Root build. Asserts `404.html`, `robots.txt` and `og.png` are in `dist/` |
| Build under a project path | `SITE_URL=https://example.github.io/furrency pnpm build`, then asserts absolute `og:image` and sitemap URLs and no leftover `%SITE_URL%` |

| Suite | Checks |
|---|---|
| `tests/pow.test.ts` | The howl hasher's midstate SHA-256 against `@noble/hashes` for one- and two-block tails, exact nonce editing, structsd's difficulty curve |
| `tests/wallet.test.ts` | Re-encodes real signed testnet transactions (`tests/fixtures/signed-txs.json`) byte for byte, verifies their signatures over our SignDoc, derives addresses, checks the clan sign-in message. Nothing is broadcast. |
| `tests/words.test.ts` | Every struct type has its own fur name, chain refusals become short signs (never sentences), "guild" never shows, time and pace words |
| `tests/site.test.ts` | The site plugin with and without `SITE_URL` (root and project path): share tags, robots, sitemap, 404, and the links to playstructs.com and structs.ai |

### `smoke` (30 min, after `check`): end-to-end against the live testnet

```yaml
env: { CI: true }
- run: sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0   # let Chrome's sandbox start on Ubuntu 24.04
- run: pnpm smoke                       # SMOKE_SHOTS=smoke-shots
- run: pnpm smoke                       # SMOKE_QUICK=1, SITE_URL=https://example.github.io/furrency
- uses: actions/upload-artifact@v7      # if: always() → smoke-shots, 7 days
```

`scripts/smoke.mjs` builds into its own temp directory and serves it the way a static host would.
Then it opens every place (`#/`, hunt, den, prowl, glow, kin, glyphs) in headless Chrome, driven
through the lab's own CDP driver (`qa/lib/cdp.mjs`):

- at desktop size and at phone size, against the live testnet,
- at desktop size with the testnet unresolvable.

A check fails on:

- an uncaught exception, a `console.error` or a resource error from the site itself,
- a place that never mounts, or a boot screen that never lifts,
- anything running past the right edge,
- a blank stage canvas,
- online: no LIVE sign, or no chain data (the beat, the den count),
- offline: claiming LIVE anyway.

Some errors belong to someone else and don't fail a check:

- the testnet's own errors (that outage is what's under test),
- a clan host refusing this origin its `guild.json` (CORS),
- the font CDN.

Each clan's `guild.json` is blocked during the run so a rate-limited host isn't hammered.

The second run serves the site under `/furrency/`, and **any request outside that path 404s and fails
the check**. That catches root-absolute URLs.

It depends on the public testnet, so it can go red when the testnet is down. That's why it doesn't
block the deploy. Without Chrome or Node 22+ it skips, and with `CI` set a skip counts as a failure.
Screenshots of every check are kept under **Artifacts → smoke-shots**.

---

## 4. Deploy workflow (`pages.yml`)

```yaml
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }   # id-token: OIDC for deploy-pages
concurrency: { group: pages, cancel-in-progress: false }         # queue, never cancel a publish mid-way
```

**`build` job:**

1. Install the toolchain.
2. `actions/configure-pages@v6` reads the Pages address: the custom domain, or
   `https://<owner>.github.io/<repo>`.
3. `pnpm typecheck && pnpm test`.
4. `pnpm build`, with:

   ```yaml
   SITE_URL: ${{ vars.VITE_SITE_URL || steps.pages.outputs.base_url }}
   VITE_LCD_URL / VITE_RPC_WS_URL / VITE_GRASS_URL / VITE_DEFAULT_GUILD / VITE_GUILD_DATA: ${{ vars.* }}
   ```

   Unset variables become empty strings, and the code falls back to the public-testnet defaults.
5. `actions/upload-pages-artifact@v5` with `path: dist`.

**`deploy` job:** `actions/deploy-pages@v5` into the `github-pages` environment. The run page links
to the live URL.

### One-time repository setup

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Not "Deploy from a branch".
2. Optional custom domain: **Settings → Pages → Custom domain**. Add DNS for it (`CNAME` to
   `<owner>.github.io`, or the apex A/AAAA records) and enable **Enforce HTTPS**. With Actions
   deploys the domain lives in the Pages settings, and no `CNAME` file is needed.
3. Optional variables: **Settings → Secrets and variables → Actions → Variables**, for any of the
   settings above. Use them to point a fork at a devnet or another clan, or to force `VITE_SITE_URL`.
4. No secrets are needed. The deploy authenticates with the workflow's OIDC token.

A fork with no custom domain deploys to `https://<owner>.github.io/<repo>/`. The share card, sitemap
and 404 follow the address automatically, and CI has already proven that layout works.

### Joining a clan from Pages

Pages has no relay, so clan sign-up and sign-in go **straight from the browser** to each clan's Guild
API.

- That works when the clan answers this origin with CORS and lets its session cookie travel
  cross-site.
- A clan that doesn't still shows up in the game from the chain and GRASS, but its private Guild API
  reads (roster, sign-in) stay closed.
- To route those reads through a relay, host the container instead (§5) with `VITE_RELAY_URL=/` and
  `RELAY=1`.

---

## 5. The other way to ship: the container

```bash
docker build -t furrency --build-arg VITE_SITE_URL=https://play.example.org .
docker run --rm -p 8080:8080 furrency
```

- A two-stage `Dockerfile`: `node:24-slim` runs `pnpm build`, then `node:24-alpine` runs `serve.mjs`
  as user `node`.
- Every setting above is a `--build-arg`, because they're baked in at build time.
- `serve.mjs` serves `dist/`. With `-e RELAY=1` it also mounts the relay at `/__relay/` (pair it with
  `--build-arg VITE_RELAY_URL=/`).
- Locally: `pnpm build && pnpm start`, which listens on `http://localhost:8080`.

CI doesn't build or push the image.

---

## 6. What isn't in CI

| Thing | Where it runs | Why |
|---|---|---|
| Share card and icons (`public/og.png`, `icon-*.png`, `favicon-32.png`) | Locally: `node scripts/brand/render.mjs http://localhost:5193` with `pnpm dev` running; results are committed | Drawn by the game's own ink in a real browser |
| Playtest lab and the ten playtesters (`qa/lab.mjs`, `qa/PLAYTEST.md`) | Locally, against a private devnet | Needs a `structsd` binary, and it signs real transactions |
| Devnet end-to-end (join, call, dig, forge, prowl) | Locally | Needs a private chain |

## 7. Reproducing CI on your machine

```bash
pnpm install --frozen-lockfile
pnpm typecheck && pnpm test && pnpm build
SITE_URL=https://example.github.io/furrency pnpm build          # project-page build
pnpm smoke                                                      # needs Chrome and the testnet
SMOKE_QUICK=1 SITE_URL=https://example.github.io/furrency pnpm smoke
```

Smoke builds for you, so run it on its own, not against the dev server.
