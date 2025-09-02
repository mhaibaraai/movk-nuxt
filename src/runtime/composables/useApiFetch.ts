import type { UseFetchOptions } from '#app'
import type { ApiFetchOptions } from '../types'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'
import { extractFilename, separate, triggerDownload } from '@movk/core'
import { defu } from 'defu'
import { ApiProfileSchema } from '../types'
import { validateApiProfile } from '../utils/api'

const API_PROFILE_KEYS = ApiProfileSchema.keyof().options

/**
 * 基于 API Profile 与自定义拦截器封装的 `useFetch` 组合函数
 *
 * - 自动从 `runtimeConfig.public.apiBase` 注入 `baseURL`
 * - 默认 `lazy: true`、`immediate: false`
 * - 内置 `transform`：若配置了 `profile.response.dataKey`，仅返回该业务数据段
 *
 * @category API
 * @template DataT 业务数据范型，等同于 `transform` 返回值的静态类型
 * @param url 请求路径或返回请求路径的函数
 * @param options 请求选项与 API Profile
 * @returns 与 Nuxt `useFetch` 相同的返回对象（可视为 `UseFetchReturn<DataT>`），`data.value` 类型对应 `DataT`
 *
 * @example 基础 GET 请求（自动推导 DataT）
 * ```ts
 * type User = { id: number; name: string }
 * const { data, pending, execute, error } = useApiFetch<User[]>(
 *   '/api/users',
 *   { method: 'GET', immediate: true }
 * )
 * // data.value: User[] | null
 * ```
 *
 * @example 带 dataKey 与自定义拦截器
 * ```ts
 * type PageResp<T> = { code: number; message: string; data: T }
 * type User = { id: number; name: string }
 *
 * const { data } = useApiFetch<User[]>(
 *   '/api/users',
 *   {
 *     // Profile 片段
 *     response: { dataKey: 'data' },
 *     // 自定义拦截器
 *     onRequest({ options }) {
 *       options.headers = { ...(options.headers as any), Authorization: `Bearer ${token}` }
 *     },
 *     onResponse({ response }) {
 *       if (!response.ok) console.warn('request failed')
 *     },
 *     // 普通 useFetch 选项
 *     immediate: true,
 *   }
 * )
 * // data.value: User[] | null （由 transform 从响应体的 data 字段提取）
 * ```
 */
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

/**
 * 文件下载辅助：在请求成功时将响应体作为 `Blob` 触发浏览器下载
 *
 * - 基于 {@link useApiFetch} 实现，透传其大部分选项
 * - 自动从响应头解析文件名，或使用 `options.download.filename` 覆盖
 * - 非 2xx 响应不触发下载
 *
 * @category API
 * @param url 下载接口路径或其惰性函数
 * @param options 下载与请求选项：
 * - `download.filename` 指定保存文件名，优先于响应头
 * - 其余选项透传至 {@link useApiFetch}
 * @returns `UseFetchReturn<Response>`，可用于手动触发或监听状态
 *
 * @example 自动文件名（从 Content-Disposition 解析）
 * ```ts
 * const { execute, pending } = useApiDownload('/api/report/export', { method: 'GET' })
 * await execute()
 * // 成功后将自动触发下载
 * ```
 *
 * @example 覆盖文件名并附带鉴权/查询
 * ```ts
 * const { execute } = useApiDownload(
 *   () => `/api/report/export?range=${encodeURIComponent('2024-01-01~2024-01-31')}`,
 *   {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${token}` },
 *     download: { filename: 'report-Jan-2024.xlsx' },
 *   }
 * )
 * await execute()
 * ```
 */
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
