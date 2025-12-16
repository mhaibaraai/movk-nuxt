import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * Lazy 版本的 useApiFetch
 *
 * 设置 `lazy: true`，不阻塞页面渲染
 *
 * @example
 * ```ts
 * const { data, pending } = useLazyApiFetch<User[]>('/users')
 *
 * // 页面渲染时 pending 为 true
 * // 请求完成后 data 自动更新
 * ```
 */
export function useLazyApiFetch<T = unknown>(
  url: string | (() => string),
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  return useApiFetch<T>(url, { ...options, lazy: true })
}
