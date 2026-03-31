FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY docs/package.json ./docs/
COPY playgrounds/play/package.json ./playgrounds/play/
COPY playgrounds/dashboard/package.json ./playgrounds/dashboard/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack install && pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=8192"
COPY . .
RUN --mount=type=secret,id=NUXT_GITHUB_TOKEN \
    --mount=type=secret,id=AI_GATEWAY_API_KEY \
    --mount=type=secret,id=NUXT_SESSION_PASSWORD \
    for f in /run/secrets/*; do echo "$(basename $f)=$(cat $f)"; done > docs/.env && \
    pnpm dev:prepare && pnpm docs:build && rm -f docs/.env

FROM node:24-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/docs/.output ./
USER app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
