# API System

Multi-endpoint fetch built on Nuxt `useFetch` and a per-endpoint `$api` client wrapping ofetch. Adds endpoint switching, auth-token injection, business-code checking, response unwrapping (`dataKey`), error normalization, toast, and 401 handling on top of Nuxt's native fetch. Upload, download and SSE go through the same pipeline.

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
- **Generic `T` is the unwrapped business type**, not the full envelope. If you need the raw envelope, pass `{ unwrap: false }` (or set `<T, DataT>` with a `transform`).
- **Bare-resource endpoints are declared on the endpoint**, not per call: `endpoints.x.response = { businessCheck: false, unwrap: false }` for APIs that return arrays / objects without a `{ code, data }` envelope. Explicit per-call `businessCheck` / `unwrap` still win.
- **One error type**: every failure is an `ApiError` (`NuxtError<ApiErrorData>`). Branch on `error.data.kind` (`business` / `http` / `network` / `timeout` / `aborted`); `error.data.code` holds the business code or HTTP status, `error.data.response` the raw body.
- **Errors are reported once**: the error toast and `movk:api:error` (signature `(context, error)`) fire after ofetch retries finish; aborts are never reported. User `onRequest` / `onResponse` hooks compose with — never replace — the built-in ones.
- **HTTP 401 or business code 401** (also for upload / download progress requests) by default clears the session and redirects to login. Customize via the `movk:api:unauthorized` hook (e.g., to refresh a token).

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
  unwrap: false,            // keep the full envelope { code, message, data }
  businessCheck: false,     // don't throw on non-success business codes
  transform: res => res.items.map(u => ({ label: u.name, value: u.id })),
  immediate: false,         // pair with lazy: true for trigger-on-demand
  lazy: true,
  server: false             // client-only
})
```

`toast` accepts five shapes:

```ts
// Disable all toasts
toast: false

// Disable only the success toast
toast: { success: false }

// Shortcut text
toast: { successMessage: 'Created!', errorMessage: 'Please try again' }

// Common Toast props
toast: {
  success: { title: 'Created', icon: 'i-lucide-check', color: 'primary' },
  error:   { title: 'Failed',  color: 'error', timeout: 5000 }
}

// Re-enable a toast the global config turned off
// precedence: request-level show > request-level successMessage/errorMessage
//           > global success/error.show + methods > global enabled
toast: { success: { show: true } }

// Custom text is the same intent — it shows even when globally disabled
toast: { successMessage: 'Saved' }
```

Notify only on mutating requests via the global or endpoint config (`methods` is
case-insensitive, global-only — a request already has exactly one method, and an
endpoint-level array replaces the global one instead of merging):

```ts
// nuxt.config.ts
movk: {
  api: {
    toast: {
      success: { methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
      error: {} // no methods = notify on every method
    }
  }
}
```

## Error handling

```ts
import type { ApiError } from '@movk/nuxt'

try {
  const user = await $api<User>('/users', { method: 'POST', body })
}
catch (err) {
  const { kind, code, response } = (err as ApiError).data ?? {}
  if (kind === 'business') {
    // HTTP 200 but business code not in successCodes; code is the business code
  }
  else if (kind === 'http' && code === 422) {
    // server-side field validation; response carries per-field errors
  }
  else if (kind === 'http') {
    // HTTP 4xx / 5xx
  }
  else {
    // 'network' | 'timeout' | 'aborted'
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

## SSE streaming

```vue
<script setup lang="ts">
const { status, error, stream, abort } = useApiStream<{ content: string }>()

for await (const chunk of stream('/chat', { method: 'POST', body: { message } })) {
  text.value += chunk.content
}
</script>
```

Two header/parsing defaults were settled the hard way — do not "fix" them without checking the gateway:

- **`Accept` defaults to the wildcard.** ofetch would otherwise add `Accept: application/json`, the wrong claim for a request read as a stream; sending `Accept: text/event-stream` instead gets the request rejected outright by DRF-style content negotiation. An explicit `headers.Accept` always wins.
- **`responseType: 'stream'` by default** — a mislabeled event stream is still read as a stream, while an `application/json` response (e.g. HTTP 200 + `{ code: 500 }` error envelopes) is restored to an object by the interceptor and goes through business-code validation.

Deliberate aborts set `status` to `'aborted'` and leave `error` null; every other failure is stored, passed to `onError` and re-thrown.

To feed `@nuxt/ui` chat components, use `createChatTransport` from `@movk/nuxt/ai` (optional peer `ai` + `@ai-sdk/vue`): it extends the AI SDK `HttpChatTransport`, so you only write a stateless `select(raw) => { id?, delta?, end?, data?, finished? }` mapping and hand the result to `useChat({ transport })`.

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
        admin:   { baseURL: '/admin/api', auth: { tokenType: 'Bearer' } },
        sensor:  { baseURL: 'https://sensor.example.com', response: { businessCheck: false, unwrap: false } }
      },
      response: { successCodes: [200, 0], dataKey: 'data' },
      auth: { enabled: true, sessionTokenPath: 'user.accessToken' }
    }
  }
})
```

Auth integrates with `nuxt-auth-utils`: when `sessionTokenPath` is set, each request reads the token from `useUserSession()` and injects it into the request header. Supports nested paths and Bearer / Basic / custom token formats.
