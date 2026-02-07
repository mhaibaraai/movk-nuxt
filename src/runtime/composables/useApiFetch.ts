import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useNuxtApp, useFetch } from '#imports'

/**
 * API Fetch 组合式函数
 *
 * 基于 Nuxt useFetch 的薄封装，自动注入 $api 实例。
 * 所有核心能力（认证、业务检查、数据解包、Toast）由 $api interceptors 统一处理。
 *
 * @typeParam T - 业务数据类型（已由 $api 自动解包）
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
 * // 跳过业务检查（直接返回原始响应）
 * const { data } = await useApiFetch('/external', { skipBusinessCheck: true })
 *
 * // 用户自定义 hooks（通过 useFetch 原生选项透传）
 * const { data } = await useApiFetch('/users', {
 *   onResponse({ response }) {
 *     console.log('自定义处理:', response._data)
 *   }
 * })
 * ```
 */
export function useApiFetch<T = unknown, DataT = T>(
  url: string | (() => string),
  options: UseApiFetchOptions<T, DataT> = {} as UseApiFetchOptions<T, DataT>
): UseApiFetchReturn<DataT> {
  const { $api } = useNuxtApp()

  const {
    endpoint,
    toast,
    skipBusinessCheck,
    ...fetchOptions
  } = options

  const apiInstance = endpoint ? $api.use(endpoint) : $api

  return useFetch(url, {
    ...fetchOptions,
    $fetch: apiInstance as typeof $fetch,
    context: { toast, skipBusinessCheck }
  } as Parameters<typeof useFetch>[1]) as UseApiFetchReturn<DataT>
}
