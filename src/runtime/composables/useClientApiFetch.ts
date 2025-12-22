import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * 仅客户端执行的 useApiFetch
 *
 * 设置 `server: false, lazy: true`
 * 适合非 SEO 敏感数据，需手动调用 execute() 触发请求
 *
 * @typeParam ResT - API 响应 data 字段的原始类型
 * @typeParam DataT - transform 转换后的最终类型（默认等于 ResT）
 *
 * @example
 * ```ts
 * const { data, execute } = useClientApiFetch<User>('/user/preferences')
 *
 * // 在 onMounted 或用户操作时触发
 * onMounted(() => execute())
 *
 * // 使用 transform 转换数据（接收解包后的数据）
 * const { data } = useClientApiFetch<{ content: User[] }, User[]>('/users', {
 *   transform: ({ content }) => content ?? []
 * })
 * ```
 */
export function useClientApiFetch<ResT = unknown, DataT = ResT>(
  url: string | (() => string),
  options: UseApiFetchOptions<ResT, DataT> = {}
): UseApiFetchReturn<DataT> {
  return useApiFetch<ResT, DataT>(url, {
    ...options,
    lazy: true,
    server: false
  })
}
