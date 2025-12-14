import type { MaybeRefOrGetter } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { ApiResponse, UseApiFetchOptions, ApiError } from '../types/api'
import { useNuxtApp, useFetch } from '#imports'
import { createResponseHandlers } from '../utils/api-utils'

type UseApiFetchReturn<T> = AsyncData<T | null, ApiError | null>

/**
 * API Fetch 组合式函数
 *
 * 基于 Nuxt useFetch 封装，提供：
 * - 自动认证（从 session 获取 token）
 * - 业务状态码检查
 * - Toast 提示
 * - 自动数据解包
 *
 * @example
 * ```ts
 * // 基础用法
 * const { data, pending, error } = await useApiFetch('/users')
 *
 * // POST 请求
 * const { data } = await useApiFetch('/users', {
 *   method: 'POST',
 *   body: { name: 'test' }
 * })
 *
 * // 自定义 Toast
 * const { data } = await useApiFetch('/users', {
 *   toast: { successMessage: '创建成功' }
 * })
 *
 * // 禁用自动解包
 * const { data } = await useApiFetch<FullResponse>('/users', { unwrap: false })
 *
 * // 使用其他端点
 * const { data } = await useApiFetch('/users', { endpoint: 'v2' })
 * ```
 */
export function useApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  const { $api } = useNuxtApp()

  // 解构选项
  const {
    endpoint,
    auth,
    toast,
    unwrap,
    transform,
    skipBusinessCheck,
    onRequest: userOnRequest,
    onRequestError: userOnRequestError,
    onResponse: userOnResponse,
    onResponseError: userOnResponseError,
    ...fetchOptions
  } = options

  // 获取 API 实例和配置
  const apiInstance = endpoint ? $api.use(endpoint) : $api
  const endpointConfig = apiInstance.getConfig()

  // 创建响应处理器
  const handlers = createResponseHandlers<T>({
    requestOptions: { toast, unwrap, transform, skipBusinessCheck },
    toastConfig: endpointConfig.toast,
    successConfig: endpointConfig.success
  })

  return useFetch(url, {
    ...fetchOptions,
    $fetch: apiInstance.$fetch as typeof $fetch,
    onRequest(context) {
      if (typeof userOnRequest === 'function') {
        userOnRequest(context)
      }
      else if (Array.isArray(userOnRequest)) {
        userOnRequest.forEach(fn => fn(context))
      }
    },
    onRequestError(context) {
      if (typeof userOnRequestError === 'function') {
        userOnRequestError(context)
      }
      else if (Array.isArray(userOnRequestError)) {
        userOnRequestError.forEach(fn => fn(context))
      }
    },
    onResponse(context) {
      handlers.onResponse(context as { response: { _data: ApiResponse } })
      if (typeof userOnResponse === 'function') {
        userOnResponse(context)
      }
      else if (Array.isArray(userOnResponse)) {
        userOnResponse.forEach(fn => fn(context))
      }
    },
    onResponseError(context) {
      if (typeof userOnResponseError === 'function') {
        userOnResponseError(context)
      }
      else if (Array.isArray(userOnResponseError)) {
        userOnResponseError.forEach(fn => fn(context))
      }
    },
    transform: handlers.transform as any
  }) as UseApiFetchReturn<T>
}

/**
 * Lazy 版本的 useApiFetch
 *
 * 设置 `lazy: true`，不阻塞页面渲染
 *
 * @example
 * ```ts
 * const { data, pending, execute } = useLazyApiFetch('/users')
 * // 手动触发
 * await execute()
 * ```
 */
export function useLazyApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  return useApiFetch<T>(url, { ...options, lazy: true })
}

/**
 * 仅客户端执行的 useApiFetch
 *
 * 设置 `server: false, lazy: true, immediate: false`
 * 适合非 SEO 敏感数据
 *
 * @example
 * ```ts
 * const { data, execute } = useClientApiFetch('/user/preferences')
 *
 * // 在 onMounted 或用户操作时触发
 * onMounted(() => execute())
 * ```
 */
export function useClientApiFetch<T = unknown>(
  url: MaybeRefOrGetter<string>,
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  return useApiFetch<T>(url, {
    ...options,
    server: false,
    lazy: true,
    immediate: false
  })
}

export default useApiFetch
