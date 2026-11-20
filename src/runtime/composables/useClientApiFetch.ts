import type { NitroFetchRequest } from 'nitropack/types'
import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * 仅客户端执行的 useApiFetch
 *
 * 设置 `server: false, lazy: true`：SSR 阶段跳过，客户端水合后自动发起且不阻塞导航。
 * 适合非 SEO 敏感数据；需手动触发时传 `immediate: false` 再调用 `execute()`
 *
 * @typeParam T - 业务数据类型（已由 $api 自动解包）
 *
 * @example
 * ```ts
 * const { data, status } = useClientApiFetch<User>('/user/preferences')
 *
 * // 用户操作时才请求
 * const { execute } = useClientApiFetch<User>('/user/export', { immediate: false })
 *
 * // 使用 transform 转换数据（接收已解包的业务数据）
 * const { data } = useClientApiFetch<User[]>('/users', {
 *   transform: (users) => users.filter(u => u.active)
 * })
 * ```
 */
export function useClientApiFetch<T = unknown, DataT = T>(
  url: NitroFetchRequest | (() => NitroFetchRequest),
  options: UseApiFetchOptions<T, DataT> = {} as UseApiFetchOptions<T, DataT>
): UseApiFetchReturn<DataT> {
  return useApiFetch<T, DataT>(url, {
    ...options,
    lazy: true,
    server: false
  })
}
