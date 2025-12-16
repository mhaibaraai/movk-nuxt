import type { UseApiFetchOptions, UseApiFetchReturn } from '../types/api'
import { useApiFetch } from './useApiFetch'

/**
 * 仅客户端执行的 useApiFetch
 *
 * 设置 `server: false, lazy: true, immediate: false`
 * 适合非 SEO 敏感数据，需手动调用 execute() 触发请求
 *
 * @example
 * ```ts
 * const { data, execute } = useClientApiFetch<User>('/user/preferences')
 *
 * // 在 onMounted 或用户操作时触发
 * onMounted(() => execute())
 * ```
 */
export function useClientApiFetch<T = unknown>(
  url: string | (() => string),
  options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
  return useApiFetch<T>(url, {
    ...options,
    server: false,
    lazy: true,
    immediate: false
  })
}
