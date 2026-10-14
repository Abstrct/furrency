# syntax=docker/dockerfile:1
#
# Furrency in one container: the built site, served by serve.mjs (no dependencies).
#
#   docker build -t furrency .
#   docker run --rm -p 8080:8080 furrency            # http://localhost:8080
#
# The page's address and network are baked in when it is built (--build-arg VITE_SITE_URL=…, VITE_LCD_URL, VITE_RPC_WS_URL,
# VITE_DEFAULT_GUILD, VITE_GRASS_URL, VITE_RELAY_URL). It talks to every system directly unless
# VITE_RELAY_URL names a relay. dist/ is a plain static site: any static host serves it as well.

FROM node:24-slim AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
# By default the page talks to the chain, GRASS and each clan directly (a plain static site).
# To route clan reads through the relay in this container instead: --build-arg VITE_RELAY_URL=/ and
# run with -e RELAY=1.
ARG VITE_SITE_URL VITE_LCD_URL VITE_RPC_WS_URL VITE_DEFAULT_GUILD VITE_GRASS_URL VITE_RELAY_URL VITE_GUILD_DATA
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY serve.mjs ./
COPY relay ./relay
COPY --from=build /app/node_modules/undici ./node_modules/undici
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null "http://127.0.0.1:${PORT}/" || exit 1
CMD ["node", "serve.mjs"]
