# Nuxt API integration

Use the Movk client for requests that need its configured endpoints, authentication, response handling, or notifications. The API integration requires Nuxt with `movk.api` enabled.

## Configure endpoints and response shapes

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    api: {
      endpoints: {
        default: { baseURL: '/api' },
        directory: {
          baseURL: '/directory',
          response: { businessCheck: false, unwrap: false }
        }
      }
    }
  }
})
```

The default response settings validate `code` against `[200, 0]` and unwrap `data`. Match the fetch generic to the body returned after this processing. For an endpoint returning bare objects or arrays, disable both `businessCheck` and `unwrap` as above. Request-level options override endpoint settings.

Use `movk.api.auth` or a per-endpoint `auth` config for authentication. Set `enabled: true` and `sessionTokenPath` for session-backed tokens. Keep service credentials server-side and call through a server route when a browser would otherwise need the secret.

## Choose a request API

| Need | API |
| --- | --- |
| Reactive page data with SSR and hydration | `useApiFetch<T>()` |
| Reactive page data without blocking navigation | `useLazyApiFetch<T>()` |
| Reactive data fetched only in the browser | `useClientApiFetch<T>()` |
| An imperative request from a submit or click handler | `$api<T>()` from `useNuxtApp()` |

```ts
interface Profile {
  displayName: string
}

const { $api } = useNuxtApp()
const { data, status, error, refresh } = await useApiFetch<Profile>('/profile')

async function saveProfile(profile: Profile) {
  await $api<Profile>('/profile', { method: 'PUT', body: profile })
  await refresh()
}
```

With the default base URL `/api`, use paths such as `/profile`. To switch clients, use `{ endpoint: 'directory' }` on the fetch composable or `$api.use('directory')` for an imperative request. With `transform`, supply `useApiFetch<Raw, Result>()` and make `Raw` match the body the transform receives.

Render pending and error states for page requests. For normalized API errors, use `error.data?.kind` (`business`, `http`, `network`, `timeout`, or `aborted`) and `error.data?.code` where available. Use `toast: false` when the request is handled inline. Configure shared notifications under `movk.api.toast`, and use `movk:api:unauthorized` when the application needs custom 401 handling.

## Track file transfers

Call the transfer composables in setup and trigger them from an interaction.

- `useUploadWithProgress<T>()` provides `upload(path, fileOrFiles, options)`. Pass a `File` or `File[]`, choose `fieldName`, and pass extra multipart fields through `fields`.
- `useDownloadWithProgress()` provides `download(path, { filename })`. A JSON error response goes through API error handling instead of being saved as a file.
- Both expose `progress`, `status`, and `abort()`. Handle the returned result, including user-triggered cancellation.

## Consume SSE or connect a chat UI

Use `useApiStream<Chunk>()` for client-side reactive stream state. Start the request from a handler by iterating `for await (const chunk of stream(path, options))`. The composable exposes `status`, `error`, and `abort()`. Handle rethrown failures from the iterator. User cancellation sets the status to `aborted`. With the imperative `$api.stream<Chunk>()`, await the returned iterator before consuming it.

For Nuxt UI chat backed by a gateway's custom SSE protocol, install `ai` (v6 or v7) and a compatible `@ai-sdk/vue`. Import `createChatTransport` from `@movk/nuxt/ai` and call it in setup. Pass the resulting transport to the Vue AI SDK chat client that matches the installed SDK version.

```ts
import { createChatTransport } from '@movk/nuxt/ai'

interface GatewayChunk {
  content?: string
  done?: boolean
}

const transport = createChatTransport<GatewayChunk>({
  api: '/chat/completions',
  select: chunk => ({ delta: chunk.content, finished: chunk.done })
})
```

In `select`, use `id` to group text blocks, `delta` for incremental text, `end` to close a block, and `finished` to finish the stream. Return `undefined` to skip a chunk. The default transport fetch uses the selected Movk API endpoint and reuses its request pipeline.

[API overview](https://nuxt.mhaibaraai.cn/docs/api) · [Fetch composables](https://nuxt.mhaibaraai.cn/docs/api/use-api-fetch) · [File transfers](https://nuxt.mhaibaraai.cn/docs/api/upload-download) · [SSE and chat transport](https://nuxt.mhaibaraai.cn/docs/api/stream)
