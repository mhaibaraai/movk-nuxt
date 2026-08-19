import type { FetchOptions } from 'ofetch'
import type { ApiError } from './response'
import type { MovkApiEndpointName } from './fetch'

/**
 * SSE 事件解析选项
 */
export interface EventStreamOptions<T> {
  /**
   * 把单条 SSE 事件的 data 解析成分片，返回 undefined 则丢弃该条
   * @defaultValue 容错的 `JSON.parse`，解析失败静默丢弃
   */
  parse?: (data: string) => T | undefined
}

/**
 * `$api.stream()` 选项
 *
 * @description 刻意不预设 `Accept` 与 `responseType`：
 *  - 部分网关（如 DRF）按 `Accept` 做内容协商，收到 `text/event-stream` 会直接拒掉整个请求
 *  - 不强制 `responseType: 'stream'` 才能让 JSON 错误信封走完业务码校验；网关把流标成非 SSE 类型时再显式传
 */
export type ApiStreamOptions<T = unknown> = FetchOptions & EventStreamOptions<T>

/**
 * 流式请求状态
 */
export type ApiStreamStatus = 'idle' | 'streaming' | 'success' | 'error' | 'aborted'

/**
 * `useApiStream()` 单次请求选项
 */
export type UseApiStreamOptions<T = unknown> = ApiStreamOptions<T> & {
  /** 使用的端点名称，默认走 defaultEndpoint */
  endpoint?: MovkApiEndpointName
  /** 失败回调；主动中止不触发 */
  onError?: (error: ApiError | Error) => void
}
