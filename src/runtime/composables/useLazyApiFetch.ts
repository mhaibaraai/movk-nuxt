import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * 懒加载版 useApiFetch
 *
 * 等价于 `useApiFetch(url, { lazy: true, ...options })`
 * 不阻塞客户端导航，页面立即显示，数据在后台加载
 *
 * @typeParam T - 业务数据类型（已由 $api 自动解包）
 *
 * @example
 * ```ts
 * const { data, status } = useLazyApiFetch<Post[]>('/posts')
 *
 * // 需要手动处理 loading 状态
 * // <div v-if="status === 'pending'">Loading...</div>
 * ```
 */
export function useLazyApiFetch<T = unknown, DataT = T>(
  url: string | (() => string),
  options: UseApiFetchOptions<T, DataT> = {} as UseApiFetchOptions<T, DataT>
): UseApiFetchReturn<DataT> {
  return useApiFetch<T, DataT>(url, { ...options, lazy: true })
}
