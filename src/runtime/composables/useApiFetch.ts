import type { UseFetchOptions } from '#app'
import type { ApiFetchOptions } from '../types'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'
import { extractFilename, separate, triggerDownload } from '@movk/core'
import { defu } from 'defu'
import { ApiProfileSchema } from '../types'
import { validateApiProfile } from '../utils/api'

const API_PROFILE_KEYS = ApiProfileSchema.keyof().options

export function useApiFetch<DataT>(
  url: string | (() => string),
  options: ApiFetchOptions<DataT> = {},
) {
  const { $createApiFetcher } = useNuxtApp()
  const { public: { apiBase } } = useRuntimeConfig()

  const { picked: profileOptions, omitted: restOptions } = separate(options, API_PROFILE_KEYS)
  const { picked: customInterceptors, omitted: fetchOptions } = separate(restOptions, ['onResponse', 'onResponseError', 'onRequest', 'onRequestError'])

  const profile = validateApiProfile(profileOptions)
  const $api = $createApiFetcher(profile, customInterceptors)

  const defaultOptions: UseFetchOptions<DataT> = {
    baseURL: apiBase,
    lazy: true,
    immediate: false,
    transform: (response: any): DataT => {
      const dataKey = profile.response?.dataKey
      return (dataKey && response) ? response[dataKey] : response
    },
  }

  const mergedOptions = defu(fetchOptions, defaultOptions)

  return useFetch(url, {
    ...mergedOptions,
    $fetch: $api,
  })
}

export function useApiDownload(
  url: string | (() => string),
  options: ApiFetchOptions<Response> = {},
) {
  const { download: downloadOptions, ...fetchOptions } = options

  return useApiFetch<Response>(url, {
    ...fetchOptions,
    onResponse({ response }) {
      if (!response.ok)
        return

      const blob = response._data
      const filename = extractFilename(response.headers, downloadOptions?.filename)

      triggerDownload(blob, filename)
    },
  })
}
