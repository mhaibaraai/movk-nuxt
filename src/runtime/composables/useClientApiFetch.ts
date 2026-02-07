import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * 仅客户端执行的 useApiFetch
 *
 * 设置 `server: false, lazy: true`
 * 适合非 SEO 敏感数据，需手动调用 execute() 触发请求
 *
 * @typeParam T - 业务数据类型（已由 $api 自动解包）
 *
 * @example
 * ```ts
 * const { data, execute } = useClientApiFetch<User>('/user/preferences')
 *
 * // 在 onMounted 或用户操作时触发
 * onMounted(() => execute())
 *
 * // 使用 transform 转换数据（接收已解包的业务数据）
 * const { data } = useClientApiFetch<User[]>('/users', {
 *   transform: (users) => users.filter(u => u.active)
 * })
 * ```
 */
export function useClientApiFetch<T = unknown, DataT = T>(
  url: string | (() => string),
  options: UseApiFetchOptions<T, DataT> = {} as UseApiFetchOptions<T, DataT>
): UseApiFetchReturn<DataT> {
  return useApiFetch<T, DataT>(url, {
    ...options,
    lazy: true,
    server: false
  })
}
