import type { MaybeRefOrGetter } from 'vue'
import type { FetchError } from 'ofetch'
import type { AsyncData } from 'nuxt/app'
import type { ApiResponseBase, UseApiFetchOptions } from '../types'
import { useNuxtApp, useFetch } from '#imports'
import { createApiResponseHandler } from '../utils/api-helpers'

/**
 * 自定义 API Fetch 组合式函数
 *
 * 基于 Nuxt 的 `useFetch` 封装，提供认证、Toast 提示、数据解包等功能。
 * 遵循 [Nuxt Custom useFetch Recipe](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)。
 *
 * @typeParam T - 响应数据类型
 * @param url - 请求 URL（支持响应式）
 * @param options - 请求配置选项
 * @param options.endpoint - 使用的端点名称（默认为配置的 defaultEndpoint）
 * @param options.api - API 特定配置
 * @param options.api.auth - 是否携带认证（默认 true）
 * @param options.api.toast - Toast 配置或禁用
 * @param options.api.unwrap - 是否自动解包数据（默认 true）
 * @param options.api.transform - 自定义数据转换函数
 * @param options.api.skipBusinessCheck - 跳过业务状态码检查
 * @returns AsyncData 对象，包含 data、pending、error、refresh 等属性
 *
 * @example
 * ```ts
 * // 基础 GET 请求
 * const { data, pending, error, refresh } = await useApiFetch('/users')
 *
 * // POST 请求
 * const { data } = await useApiFetch('/users', {
 *   method: 'POST',
 *   body: { name: 'test' }
 * })
 *
 * // 自定义配置
 * const { data } = await useApiFetch('/users', {
 *   api: {
 *     toast: { successMessage: '创建成功' },
 *     unwrap: false // 不自动解包
 *   }
 * })
 *
 * // 使用不同端点
 * const { data } = await useApiFetch('/users', {
 *   endpoint: 'v2'
 * })
 * ```
 */
export function useApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): AsyncData<T | null, FetchError<ApiResponseBase<unknown>> | null> {
  const { $api } = useNuxtApp()

  // 提取选项
  const { api: apiOptions, endpoint, ...useFetchOptions } = options

  // 获取 API 实例和配置
  const apiInstance = endpoint ? $api.use(endpoint) : $api
  const endpointConfig = apiInstance.getConfig()

  // 创建响应处理器
  const handlers = createApiResponseHandler<T>(apiOptions, endpointConfig)

  return useFetch(url, {
    ...useFetchOptions,
    $fetch: apiInstance.$fetch as any,
    onResponse: handlers.onResponse,
    transform: handlers.transform as any
  }) as AsyncData<T | null, FetchError<ApiResponseBase<unknown>> | null>
}

/**
 * Lazy 版本的 useApiFetch
 *
 * 不会在服务端渲染时执行，适合用户交互触发的请求。
 * 等同于 `useApiFetch` 但设置了 `lazy: true`。
 *
 * @typeParam T - 响应数据类型
 * @param url - 请求 URL（支持响应式）
 * @param options - 请求配置选项（同 useApiFetch）
 * @returns AsyncData 对象，初始 data 为 null，需要调用 execute() 手动触发
 *
 * @example
 * ```ts
 * const { data, pending, execute } = useLazyApiFetch('/users')
 *
 * // 手动触发请求
 * await execute()
 * ```
 */
export function useLazyApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): AsyncData<T | null, FetchError<ApiResponseBase<unknown>> | null> {
  return useApiFetch<T>(url, {
    ...options,
    lazy: true
  })
}

/**
 * 仅客户端版本的 useApiFetch
 *
 * 仅在客户端执行请求，不会在服务端渲染时运行。
 * 设置了 `server: false` 和 `lazy: true`，适合非 SEO 敏感数据。
 *
 * @typeParam T - 响应数据类型
 * @param url - 请求 URL（支持响应式）
 * @param options - 请求配置选项（同 useApiFetch）
 * @returns AsyncData 对象，初始 data 为 null，仅在客户端执行
 *
 * @example
 * ```ts
 * // 仅在客户端加载用户偏好设置
 * const { data: preferences } = useClientApiFetch('/user/preferences')
 *
 * // 适合非 SEO 数据，如用户通知
 * const { data: notifications, pending } = useClientApiFetch('/notifications')
 * ```
 *
 * @see https://nuxt.com/docs/4.x/getting-started/data-fetching
 */
export function useClientApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): AsyncData<T | null, FetchError<ApiResponseBase<unknown>> | null> {
  return useApiFetch<T>(url, {
    ...options,
    lazy: true,
    server: false
  })
}

export default useApiFetch
