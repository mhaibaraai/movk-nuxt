import type { UseFetchOptions } from '#app'
import type { ApiFetchOptions } from '../types'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'
// import { extractFilename, separateMany, triggerDownload } from '@movk/core'
import { defu } from 'defu'

export function useApiFetch<DataT>(
  url: string | (() => string),
  options: ApiFetchOptions<DataT> = {},
) {
  const { $createApiFetcher } = useNuxtApp()
  const { public: { apiBase } } = useRuntimeConfig()

  const { $api, apiProfile, fetchOptions } = $createApiFetcher<DataT>(options)

  const defaultOptions: UseFetchOptions<DataT> = {
    baseURL: apiBase,
    lazy: true,
    immediate: false,
    transform: (response: any): DataT => {
      const dataKey = apiProfile.response.dataKey
      return (dataKey && response) ? response[dataKey] : response
    },
    onResponse() {
      console.log('111')
    },
  }

  const mergedOptions = defu(fetchOptions, defaultOptions)

  return useFetch(url, {
    ...mergedOptions,
    $fetch: $api,
  })
}

// export function useApiDownload<DataT>(
//   url: string | (() => string),
//   options: ApiFetchOptions<DataT> = {},
// ) {
//   const { download: downloadOptions, ...fetchOptions } = options

//   return useApiFetch<DataT>(url, {
//     ...fetchOptions,
//     onResponse({ response }) {
//       if (!response.ok)
//         return

//       const blob = response._data
//       const filename = extractFilename(response.headers, downloadOptions?.filename)

//       triggerDownload(blob, filename)
//     },
//   })
// }
