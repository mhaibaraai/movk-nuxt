import type { ToastProps } from '@nuxt/ui'

declare module 'ofetch' {
  interface FetchOptions {
    context?: ApiFetchContext
  }
}

/**
 * API 请求扩展上下文
 * @description 通过 fetch options 的 context 字段传递的额外配置
 */
export interface ApiFetchContext {
  /** Toast 提示配置，设置为 false 禁用提示 */
  toast?: RequestToastOptions | false
  /** 是否跳过业务状态码检查 */
  skipBusinessCheck?: boolean
}

/**
 * 请求级别的 Toast 提示选项
 * @description 用于单个请求的 Toast 配置，可覆盖全局配置
 */
export interface RequestToastOptions {
  /** 成功提示配置，设置为 false 禁用成功提示 */
  success?: ToastProps | false
  /** 错误提示配置，设置为 false 禁用错误提示 */
  error?: ToastProps | false
  /** 自定义成功消息 */
  successMessage?: string
  /** 自定义错误消息 */
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
 * API 错误对象
 * @description 扩展标准 Error，包含业务响应和状态码信息
 */
export interface ApiError extends Error {
  /** HTTP 或业务状态码 */
  statusCode?: number
  /** 原始 API 响应数据 */
  response?: ApiResponse
  /** 是否为业务逻辑错误（非 HTTP 错误） */
  isBusinessError: boolean
}
