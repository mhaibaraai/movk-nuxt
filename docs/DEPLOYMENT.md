# Deploy the docs to Cloudflare Workers

The docs run on the `movk-nuxt` Worker with Workers Static Assets and a D1 database. Nitro generates the Wrangler configuration in `docs/.output/server/wrangler.json` during the production build.

## Local verification

Run these commands from the repository root.

```sh
pnpm install --frozen-lockfile
pnpm dev:prepare
pnpm docs:build
pnpm --filter @movk/nuxt-docs-site run deploy --dry-run
pnpm --filter @movk/nuxt-docs-site run preview
```

The preview uses a local D1 database. For the login demo, set `NUXT_APP_SECRET` in `docs/.dev.vars` and pass `--env-file .dev.vars` to the `preview` command. Generate a local value with `openssl rand -base64 32`.

## Workers Builds

Create a D1 database named `movk-nuxt-content` and connect the `movk-nuxt` Worker to this repository with the following settings.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `pnpm dev:prepare && pnpm docs:build` |
| Deploy command | `pnpm --filter @movk/nuxt-docs-site run deploy` |
| Build variable `CLOUDFLARE_D1_DATABASE_ID` | UUID of `movk-nuxt-content`. The generated configuration binds it as `DB`. |
| Build secret `NUXT_GITHUB_TOKEN` | Read-only GitHub token for fetching releases during prerendering |

Keep preview builds disabled unless a separate preview D1 database is configured. Verify the Worker on its `workers.dev` URL before assigning `nuxt.mhaibaraai.cn` as its custom domain.

Set the following values under the Worker's runtime **Variables and Secrets**.

| Name | Type | Value |
| --- | --- | --- |
| `AI_BASE_URL` | Variable | `https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/v1` |
| `AI_API_KEY` | Secret | Cloudflare API token with Workers AI inference access to that account |
| `NUXT_APP_SECRET` | Secret | A stable value generated with `openssl rand -base64 32` for the login demo |

Before switching the custom domain, check that AI Chat streams a response and can query the docs through its MCP tools. [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) · [Workers AI API](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)
