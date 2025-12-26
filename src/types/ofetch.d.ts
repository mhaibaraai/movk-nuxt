import type { ApiFetchContext } from '#movk/types'

declare module 'ofetch' {
  interface FetchOptions {
    context?: ApiFetchContext
  }
}

export {}
