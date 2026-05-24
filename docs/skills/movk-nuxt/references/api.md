# API System

Multi-endpoint fetch built on Nuxt `useFetch` and a `$fetch.create()` `$api` instance. Adds endpoint switching, auth-token injection, business-code checking, response unwrapping (`dataKey`), toast, and 401 handling on top of Nuxt's native fetch.

## Basic pattern

```vue
<script setup lang="ts">
interface User { id: string, name: string, email: string }

// Generic `T` is the business-data type — interceptors already unwrap `dataKey`
const { data, status, error, refresh } = await useApiFetch<User>('/profile')
</script>
```

The raw response `{ code: 200, message: 'OK', data: { id: 1, name: 'Alice' } }` is unwrapped automatically; `data.value` is `{ id: 1, name: 'Alice' }`.

## Key rules

- **Never call `$fetch` directly** — use `useApiFetch` / `useLazyApiFetch` / `useClientApiFetch` for composable fetches, and `const { $api } = useNuxtApp()` for imperative calls. Bare `$fetch` skips the interceptor chain.
- **Generic `T` is the unwrapped business type**, not the full envelope. If you need the raw envelope, pass `{ skipUnwrap: true }` (or set `<T, DataT>` with a `transform`).
- **Two error types**: `ApiError` for business-code failures (`isBusinessError === true`, HTTP 200 but `code` not in `successCodes`); everything else is an ofetch `FetchError`. Branch on `isBusinessError` and `statusCode`.
- **HTTP 401** by default clears the session and redirects to login. Customize via the `movk:api:unauthorized` hook (e.g., to refresh a token).

## Fetch mode selection

| Composable | When |
| --- | --- |
| `useApiFetch` | SEO-critical / first-paint data — runs on SSR, hydrates to the client |
| `useLazyApiFetch` | Non-blocking secondary data — page renders first, fetch runs in background |
| `useClientApiFetch` | Client-only data (personal, non-SEO) — skips SSR entirely |

```ts
// SSR + hydrate
const { data: article } = await useApiFetch<Article>(`/articles/${id}`)

// non-blocking
const { data: related, status } = useLazyApiFetch<Article[]>(`/articles/${id}/related`)

// client-only
const { data: stats } = useClientApiFetch<Stats>('/me/stats')
```

All three share the same signature and options.

## Imperative `$api`

```ts
const { $api } = useNuxtApp()

// data is already unwrapped
const users = await $api<User[]>('/users')

const created = await $api<User>('/users', {
  method: 'POST',
  body: { name: 'Alice', email: 'alice@example.com' }
})

// switch endpoints (instances are cached internally)
const adminApi = $api.use('admin')
const config = await adminApi<Config>('/config')

// one-shot endpoint switch
const v2Users = await $api.use('v2')<User[]>('/users')
```

## Per-call options

```ts
const { data } = await useApiFetch<User[]>('/users', {
  endpoint: 'v2',           // pick a different endpoint
  toast: false,             // disable toast for this call
  skipUnwrap: true,         // keep the full envelope { code, message, data }
  skipBusinessCheck: true,  // don't throw on non-success business codes
  transform: res => res.items.map(u => ({ label: u.name, value: u.id })),
  immediate: false,         // pair with lazy: true for trigger-on-demand
  lazy: true,
  server: false             // client-only
})
```

`toast` accepts four shapes:

```ts
// Disable all toasts
toast: false

// Disable only the success toast
toast: { success: false }

// Shortcut text
toast: { successMessage: 'Created!', errorMessage: 'Please try again' }

// Full Toast props
toast: {
  success: { title: 'Created', icon: 'i-lucide-check', color: 'primary' },
  error:   { title: 'Failed',  color: 'error', timeout: 5000 }
}
```

## Error handling

```ts
import type { ApiError } from '@movk/nuxt'
import type { FetchError } from 'ofetch'

try {
  const user = await $api<User>('/users', { method: 'POST', body })
}
catch (err) {
  if ((err as ApiError).isBusinessError) {
    // HTTP 200 but business code not in successCodes
    // err.statusCode is the business code; err.response is the full envelope
  }
  else if ((err as FetchError).statusCode === 422) {
    // server-side field validation; err.data.fields carries per-field errors
  }
  else if ((err as FetchError).statusCode) {
    // HTTP 4xx / 5xx
  }
  else {
    // network failure — no statusCode
  }
}
```

For composables, the same shape is reachable via `error.value`.

## Upload with progress

`useUploadWithProgress` uses native `XMLHttpRequest`, reuses the endpoint / auth / business-code / toast pipeline, and exposes `progress` (0-100), `status`, and `abort()`.

```vue
<script setup lang="ts">
interface UploadResult { files: Array<{ name: string, url: string }> }

const { progress, status, upload, abort } = useUploadWithProgress<UploadResult>()

async function onUpload(files: File[]) {
  const { data, error: err, aborted } = await upload('/api/upload', files, {
    fieldName: 'files',
    fields: { userId: '123' },          // extra form fields
    onSuccess: d => console.log(d.files)
  })
  if (aborted) return
  if (err) console.error(err)
}
</script>

<template>
  <input type="file" multiple @change="e => onUpload(Array.from((e.target as HTMLInputElement).files ?? []))">
  <UProgress v-if="status === 'pending'" :model-value="progress" :max="100" />
  <UButton v-if="status === 'pending'" label="Cancel" @click="abort" />
</template>
```

Single file: pass `File` directly; multi-file: pass `File[]` with the same `fieldName`.

## Download with progress

```vue
<script setup lang="ts">
const { progress, status, download, abort } = useDownloadWithProgress()

async function onDownload() {
  await download('/api/export', { filename: 'report.xlsx' })
}
</script>
```

If the server returns `application/json` (typically an error envelope), the JSON is routed through the normal error path instead of being written to disk.

## Auth & multi-endpoint config

Module-wide behavior lives in `nuxt.config.ts` under `movk.api.*`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    api: {
      endpoints: {
        default: { baseURL: '/api' },
        v2:      { baseURL: '/api/v2' },
        admin:   { baseURL: '/admin/api', auth: { tokenType: 'Bearer' } }
      },
      successCodes: [200, 0],
      dataKey: 'data',
      sessionTokenPath: 'user.accessToken'
    }
  }
})
```

Auth integrates with `nuxt-auth-utils`: when `sessionTokenPath` is set, each request reads the token from `useUserSession()` and injects it into the request header. Supports nested paths and Bearer / Basic / custom token formats.
