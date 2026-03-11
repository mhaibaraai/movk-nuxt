FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY docs/package.json ./docs/
COPY playground/package.json ./playground/
RUN corepack install && pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=6144
COPY . .
RUN pnpm exec nuxt-module-build build --stub \
 && pnpm exec nuxt-module-build prepare \
 && pnpm exec nuxt build docs

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
