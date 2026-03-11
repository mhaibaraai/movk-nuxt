FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack install && pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm dev:prepare && pnpm docs:build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app/docs/.output ./
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
