import type { NitroFetchRequest } from 'nitropack/types'
import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { computed, toValue } from 'vue'
import { useNuxtApp, useFetch } from '#app'
import { buildApiFetchKey } from '../domains/api/fetch-key'
import { deepToValue } from '../domains/api/deep-to-value'
import { composeHook, getInterceptors } from '../domains/api/interceptors/compose'

/**
 * API Fetch 组合式函数
 *
 * 基于 Nuxt useFetch 的薄封装，自动注入 $api 实例。
 * 所有核心能力（认证、业务检查、数据解包、Toast）由 $api interceptors 统一处理。
 *
 * @typeParam T - 业务数据类型（默认已由 $api 自动解包；skipUnwrap 时为原始响应类型）
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
 * // 自定义 transform（接收已解包的业务数据）
 * const { data } = await useApiFetch<User[]>('/users', {
 *   transform: (users) => users.filter(u => u.active)
 * })
 *
 * // 使用其他端点
 * const { data } = await useApiFetch('/users', { endpoint: 'v2' })
 *
 * // 自定义 Toast
 * const { data } = await useApiFetch('/users', {
 *   toast: { successMessage: '加载成功' }
 * })
 *
 * // 跳过业务状态码校验（仍按 dataKey 解包，适合 code 字段缺失的场景）
 * const { data } = await useApiFetch('/legacy', { skipBusinessCheck: true })
 *
 * // 跳过解包，拿原始响应（与 skipBusinessCheck 正交）
 * const { data } = await useApiFetch<ApiResponse>('/external', { skipUnwrap: true })
 *
 * // 用户自定义 hooks：与内置拦截器组合（内置先执行），不会覆盖认证/业务校验/解包/Toast
 * const { data } = await useApiFetch('/users', {
 *   onResponse({ response }) {
 *     // response._data 已是解包后的业务数据（除非传入 skipUnwrap: true）
 *     // 仅业务成功时触发；返回值被 ofetch 忽略，副作用专用
 *     console.log('自定义处理:', response._data)
 *   }
 * })
 *
 * // 变形输出请用 transform 或直接消费自动解包后的 data，而非在 onResponse 中 return
 * ```
 */
export function useApiFetch<T = unknown, DataT = T>(
  url: NitroFetchRequest | (() => NitroFetchRequest),
  options: UseApiFetchOptions<T, DataT> = {} as UseApiFetchOptions<T, DataT>
): UseApiFetchReturn<DataT> {
  const { $api } = useNuxtApp()

  const {
    endpoint,
    toast,
    skipBusinessCheck,
    skipUnwrap,
    ...fetchOptions
  } = options

  const apiInstance = endpoint ? $api.use(endpoint) : $api

  // 用户钩子与内置拦截器组合为数组（内置先执行）；仅覆写用户实际传入的钩子，避免顶掉实例 default
  const movk = getInterceptors(apiInstance)
  const composedHooks = movk
    ? {
        onRequest: composeHook(movk.onRequest, fetchOptions.onRequest),
        onResponse: composeHook(movk.onResponse, fetchOptions.onResponse),
        onResponseError: composeHook(movk.onResponseError, fetchOptions.onResponseError)
      }
    : {}
  const definedHooks = Object.fromEntries(
    Object.entries(composedHooks).filter(([, value]) => value !== undefined)
  )

  const fetchKey = computed<string>(() => {
    const userKey = toValue(fetchOptions.key)
    if (userKey) return userKey
    return buildApiFetchKey({
      endpoint,
      skipUnwrap,
      skipBusinessCheck,
      toast,
      method: toValue(fetchOptions.method),
      url: typeof url === 'function' ? url() : url,
      query: deepToValue(fetchOptions.query),
      body: deepToValue(fetchOptions.body)
    })
  })

  return useFetch(url, {
    ...fetchOptions,
    ...definedHooks,
    key: fetchKey,
    $fetch: apiInstance as typeof $fetch,
    context: { toast, skipBusinessCheck, skipUnwrap }
  } as Parameters<typeof useFetch>[1]) as UseApiFetchReturn<DataT>
}
