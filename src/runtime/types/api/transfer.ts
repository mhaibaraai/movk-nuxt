import type { MovkApiEndpointName } from './fetch'
import type { ApiError, RequestToastOptions } from './response'

/**
 * 传输状态
 * @description idle 初始；pending 进行中；success 成功；error 失败；aborted 已中止
 */
export type TransferStatus = 'idle' | 'pending' | 'success' | 'error' | 'aborted'

/**
 * 传输结果（命令式调用返回值）
 * @description data/error 二选一；aborted 标记是否被 abort 取消
 */
export interface TransferResult<T = unknown> {
  /** 业务数据（已按 dataKey 解包）；失败或中止时为 null */
  data: T | null
  /** 错误对象；成功或中止时为 null */
  error: ApiError | Error | null
  /** 是否因调用方主动 abort 而结束 */
  aborted: boolean
}

/**
 * 传输请求公共选项
 */
export interface TransferRequestOptions {
  /** 端点名称，未指定时使用 defaultEndpoint */
  endpoint?: MovkApiEndpointName
  /** 额外的请求头（覆盖同名 auth 头） */
  headers?: Record<string, string>
  /** Toast 配置，设置为 false 整体禁用 */
  toast?: RequestToastOptions | false
  /** 跳过业务码校验（仍按 dataKey 解包），与 useApiFetch.skipBusinessCheck 同义 */
  skipBusinessCheck?: boolean
}
