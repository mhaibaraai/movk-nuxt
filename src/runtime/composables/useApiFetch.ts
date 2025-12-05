import type { MaybeRefOrGetter } from 'vue'
import type { FetchError } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { ApiResponseBase, UseApiFetchOptions, ApiRequestOptions } from '../types'
import { toValue } from 'vue'
import { useNuxtApp, useAsyncData } from '#imports'

/**
 * 自定义 API Fetch 组合式函数
 * 基于 $api 实例的响应式封装，自动获得认证、Toast、数据解包等功能
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
  const nuxtApp = useNuxtApp()

  // 获取 API 实例
  const getApiInstance = () => {
    const endpoint = options.endpoint
    return endpoint ? nuxtApp.$api.use(endpoint) : nuxtApp.$api
  }

  // 提取选项
  const {
    api: apiOptions,
    endpoint: _endpoint,
    method = 'GET',
    body,
    // AsyncData 选项
    lazy,
    server,
    immediate,
    watch,
    default: defaultValue,
    deep,
    dedupe,
    key,
    // 其他选项忽略
    ...restOptions
  } = options

  // 构建 $api 请求选项
  const requestOptions: ApiRequestOptions<T> = {
    ...apiOptions,
    // 传递 query/params 等 fetch 选项
    query: restOptions.query as Record<string, unknown> | undefined,
    params: restOptions.params as Record<string, unknown> | undefined,
    headers: restOptions.headers as HeadersInit | undefined
  }

  // 获取方法名
  const methodName = (typeof method === 'string' ? method : 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  // 生成唯一 key
  const asyncKey = key || `api-${methodName}-${toValue(url)}`

  // 构建 useAsyncData 选项
  const asyncDataOptions: AsyncDataOptions<T> = {
    lazy,
    server,
    immediate,
    deep,
    dedupe
  }

  // 只在有值时添加 watch 和 default
  if (watch !== undefined && watch !== false) {
    asyncDataOptions.watch = watch as AsyncDataOptions<T>['watch']
  }
  if (defaultValue !== undefined) {
    asyncDataOptions.default = defaultValue as AsyncDataOptions<T>['default']
  }

  // 使用 useAsyncData 包装 $api 调用
  return useAsyncData<T, FetchError<ApiResponseBase<unknown>>>(
    asyncKey,
    async () => {
      const api = getApiInstance()
      const resolvedUrl = toValue(url)

      switch (methodName) {
        case 'POST':
          return api.post<T>(resolvedUrl, body, requestOptions)
        case 'PUT':
          return api.put<T>(resolvedUrl, body, requestOptions)
        case 'PATCH':
          return api.patch<T>(resolvedUrl, body, requestOptions)
        case 'DELETE':
          return api.delete<T>(resolvedUrl, requestOptions)
        default:
          return api.get<T>(resolvedUrl, requestOptions)
      }
    },
    asyncDataOptions
  ) as AsyncData<T | null, FetchError<ApiResponseBase<unknown>> | null>
}

/**
 * Lazy 版本的 useApiFetch
 * 不会在服务端渲染时执行，适合用户交互触发的请求
 *
 * @example
 * ```ts
 * const { data, pending, execute } = useLazyApiFetch('/users')
 *
 * // 手动触发
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
 * 创建类型安全的 API Fetch 工厂
 * 用于定义 API 接口时获得更好的类型推断
 *
 * @example
 * ```ts
 * interface User {
 *   id: number
 *   name: string
 * }
 *
 * // 创建类型化的 fetcher
 * const fetchUser = useTypedApiFetch<User>()
 *
 * // 使用时自动获得类型
 * const { data } = await fetchUser('/user/1')
 * // data 类型为 Ref<User | null>
 * ```
 */
export function useTypedApiFetch<T>() {
  return <R = T>(
    url: MaybeRefOrGetter<string>,
    options: UseApiFetchOptions<R> = {}
  ) => useApiFetch<R>(url, options)
}

export default useApiFetch
