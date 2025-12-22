import type { UseApiFetchOptions, UseApiFetchReturn, ApiFetchContext } from '../types/api'
import { useNuxtApp, useFetch } from '#imports'
import { createTransform, mergeFetchHooks } from '../utils/api-utils'

/**
 * API Fetch 组合式函数
 *
 * 基于 Nuxt useFetch 封装，提供：
 * - 自动认证（从 session 获取 token）
 * - 业务状态码检查
 * - Toast 提示（通过内置 hooks 统一处理）
 * - 自动数据解包
 * - 支持用户自定义 hooks（与内置 hooks 合并执行）
 *
 * @typeParam ResT - API 响应 data 字段的原始类型
 * @typeParam DataT - transform 转换后的最终类型（默认等于 ResT）
 *
 * @example
 * ```ts
 * // 基础用法（自动解包 data 字段）
 * const { data, pending, error } = await useApiFetch<User[]>('/users')
 *
 * // POST 请求
 * const { data } = await useApiFetch('/users', {
 *   method: 'POST',
 *   body: { name: 'test' }
 * })
 *
 * // 自定义 transform（双泛型，接收解包后的数据）
 * const { data } = await useApiFetch<{ content: User[] }, User[]>('/users', {
 *   transform: ({ content }) => content ?? []
 * })
 *
 * // 使用其他端点
 * const { data } = await useApiFetch('/users', { endpoint: 'v2' })
 *
 * // 自定义 hooks（与内置 hooks 合并执行）
 * const { data } = await useApiFetch('/users', {
 *   onResponse({ response }) {
 *     console.log('用户自定义处理:', response._data)
 *   }
 * })
 * ```
 */
export function useApiFetch<ResT = unknown, DataT = ResT>(
  url: string | (() => string),
  options: UseApiFetchOptions<ResT, DataT> = {}
): UseApiFetchReturn<DataT> {
  const { $api } = useNuxtApp()

  const {
    endpoint,
    toast,
    skipBusinessCheck = false,
    transform: userTransform,
    onRequest: userOnRequest,
    onRequestError: userOnRequestError,
    onResponse: userOnResponse,
    onResponseError: userOnResponseError,
    ...fetchOptions
  } = options

  const apiInstance = endpoint ? $api.use(endpoint) : $api
  const endpointConfig = apiInstance.getConfig()
  const builtinHooks = endpointConfig.builtinHooks || {}

  // 创建 transform
  const transformFn = createTransform<ResT, DataT>({
    skipBusinessCheck,
    userTransform,
    successConfig: endpointConfig.success
  })

  // 合并内置 hooks 与用户 hooks
  const mergedHooks = mergeFetchHooks(builtinHooks, {
    onRequest: userOnRequest as any,
    onRequestError: userOnRequestError as any,
    onResponse: userOnResponse as any,
    onResponseError: userOnResponseError as any
  })

  // 通过 context 传递请求级配置给内置 hooks
  const context: ApiFetchContext = { toast, skipBusinessCheck }

  // 注：useFetch 泛型类型复杂度较高，需要类型断言避免 TS2589 错误
  return useFetch(url, {
    ...fetchOptions,
    $fetch: apiInstance.$fetch,
    transform: transformFn,
    // 合并后的 hooks
    onRequest: mergedHooks.onRequest,
    onRequestError: mergedHooks.onRequestError,
    onResponse: mergedHooks.onResponse,
    onResponseError: mergedHooks.onResponseError,
    // 传递请求级配置给内置 hooks
    context
  } as Parameters<typeof useFetch>[1]) as UseApiFetchReturn<DataT>
}
