import type { NuxtError } from 'nuxt/app'
import type { ApiToast } from './config'

declare module 'ofetch' {
  interface FetchOptions {
    toast?: ApiRequestOptions['toast']
    businessCheck?: ApiRequestOptions['businessCheck']
    unwrap?: ApiRequestOptions['unwrap']
  }
}

/**
 * 请求级选项
 * @description `$api`、`useApiFetch`、上传下载与流式请求共用；未传的字段继承端点 / 全局 `response` 配置
 */
export interface ApiRequestOptions {
  /** Toast 提示配置，设置为 false 禁用提示 */
  toast?: RequestToastOptions | false
  /**
   * 是否按 successCodes 校验业务状态码
   * @description 未传时继承端点 / 全局 `response.businessCheck`；显式值可覆盖端点配置
   */
  businessCheck?: boolean
  /**
   * 是否按 dataKey 解包业务数据
   * @description 未传时继承端点 / 全局 `response.unwrap`；为 false 时拿到原始响应体
   */
  unwrap?: boolean
}

/**
 * 请求级别的 Toast 提示选项
 * @description 用于单个请求的 Toast 配置，可覆盖全局配置
 */
export interface RequestToastOptions {
  /** 成功提示配置，设置为 false 禁用成功提示；`show: true` 可覆盖全局关闭 */
  success?: ApiToast | false
  /** 错误提示配置，设置为 false 禁用错误提示；`show: true` 可覆盖全局关闭 */
  error?: ApiToast | false
  /** 自定义成功消息；传入即视为本次开启成功提示，可覆盖全局关闭 */
  successMessage?: string
  /** 自定义错误消息；传入即视为本次开启错误提示，可覆盖全局关闭 */
  errorMessage?: string
}

/**
 * API 响应数据结构
 * @description 字段名通过 ApiResponseConfig 的 codeKey/messageKey/dataKey 配置化读取
 */
export interface ApiResponse {
  code?: number | string
  message?: string
  msg?: string
  data?: unknown
  status?: number
  [key: string]: unknown
}

/**
 * 错误分类
 * @description business：业务码校验失败；http：HTTP 4xx/5xx；network：请求未拿到响应；timeout：超时；aborted：主动中止
 */
export type ApiErrorKind = 'business' | 'http' | 'network' | 'timeout' | 'aborted'

/**
 * API 错误附带数据，挂在 `error.data` 上
 */
export interface ApiErrorData {
  /** 错误分类 */
  kind: ApiErrorKind
  /** 发起请求的端点名称 */
  endpoint: string
  /** 业务码（business）或 HTTP 状态码（http） */
  code?: number | string
  /** 原始响应体 */
  response?: unknown
}

/**
 * API 错误
 * @description 所有失败统一为 NuxtError，经 useAsyncData 时原样保留；按 `error.data.kind` 区分场景
 */
export type ApiError = NuxtError<ApiErrorData>
