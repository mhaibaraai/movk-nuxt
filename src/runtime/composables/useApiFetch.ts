import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useNuxtApp, useFetch } from '#imports'
import { createTransform } from '../utils/api-utils'

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
 * // 基础用法（自动解包 data 字段）
 * const { data, pending, error } = await useApiFetch<User[]>('/users')
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
 * // 禁用自动解包，获取完整响应
 * const { data } = await useApiFetch<FullResponse>('/users', { unwrap: false })
 *
 * // 使用其他端点
 * const { data } = await useApiFetch('/users', { endpoint: 'v2' })
 * ```
 */
export function useApiFetch<T = unknown>(
  url: string | (() => string),
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  const { $api } = useNuxtApp()

  const {
    endpoint,
    toast,
    unwrap = true,
    skipBusinessCheck = false,
    transform: userTransform,
    ...fetchOptions
  } = options

  const apiInstance = endpoint ? $api.use(endpoint) : $api
  const endpointConfig = apiInstance.getConfig()

  // 创建 transform 函数处理业务逻辑
  const transformFn = createTransform<T>({
    unwrap,
    skipBusinessCheck,
    toast,
    userTransform,
    toastConfig: endpointConfig.toast,
    successConfig: endpointConfig.success
  })

  return useFetch(url, {
    ...fetchOptions,
    $fetch: apiInstance.$fetch as typeof globalThis.$fetch,
    transform: transformFn as (data: unknown) => T
  }) as UseApiFetchReturn<T>
}
