import type { $Fetch, FetchError } from 'ofetch'
import type { UseFetchOptions as NuxtUseFetchOptions, AsyncData } from 'nuxt/app'
import type { RequestToastOptions, ApiError } from './response'

/**
 * API 实例类型
 * @description $fetch.create() 返回的实例，附加 use() 方法支持多端点切换
 */
export type ApiInstance = $Fetch & {
  /** 切换到指定端点，返回该端点的 $fetch 实例 */
  use: (endpoint: string) => ApiInstance
}

/**
 * useApiFetch 选项类型
 * @template T - 业务数据类型（已解包）
 * @template DataT - transform 转换后的类型（默认等于 T）
 */
export type UseApiFetchOptions<T = unknown, DataT = T>
  = Omit<NuxtUseFetchOptions<T, DataT>, '$fetch' | 'context'> & {
    /** 使用的端点名称（默认使用 defaultEndpoint） */
    endpoint?: string
    /** Toast 提示配置，设置为 false 禁用提示 */
    toast?: RequestToastOptions | false
    /** 是否跳过业务状态码检查 */
    skipBusinessCheck?: boolean
  }

/**
 * useApiFetch 返回值类型
 * @template DataT - 最终数据类型
 */
export type UseApiFetchReturn<DataT> = AsyncData<DataT | null, FetchError | ApiError | null>
