import type { FetchOptions } from 'ofetch'
import type { UseFetchOptions } from 'nuxt/app'
import type { ToastProps } from '@nuxt/ui'
import type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions
} from '../schemas/api'

export type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions
}

/** 多端点配置 */
export type ApiEndpointsConfig = Record<string, ApiEndpointConfig>

/**
 * 单次请求 Toast 配置
 */
export interface RequestToastConfig {
  /** 是否显示提示 */
  show?: boolean
  /** 成功提示配置，false 时禁用 */
  success?: Partial<ToastProps> | false
  /** 错误提示配置，false 时禁用 */
  error?: Partial<ToastProps> | false
  /** 自定义成功消息 (简写) */
  successMessage?: string
  /** 自定义错误消息 (简写) */
  errorMessage?: string
}

/** API 请求核心选项 (共用于 $api 和 useApiFetch) */
export interface ApiCoreOptions<T = unknown> {
  /** 是否携带认证信息，覆盖全局配置 */
  auth?: boolean
  /** Toast 配置 */
  toast?: RequestToastConfig | false
  /**
   * 是否解包响应数据
   * @defaultValue true
   */
  unwrap?: boolean
  /** 自定义响应转换函数 */
  transform?: (response: ApiResponseBase<T>) => T
}

/**
 * $api 请求选项
 * 继承 ofetch 的 FetchOptions，添加 API 特定配置
 */
export interface ApiRequestOptions<T = unknown> extends Omit<FetchOptions<'json'>, 'responseType'>, ApiCoreOptions<T> {}

/** 上传请求配置 */
export interface UploadRequestOptions<T = unknown> extends ApiRequestOptions<T> {
  /**
   * 文件字段名
   * @defaultValue 'file'
   */
  fieldName?: string
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
}

/** API 实例方法 */
export interface ApiExtendedMethods {
  download: (url: string, options?: Omit<ApiRequestOptions, 'transform'>, filename?: string) => Promise<void>
  upload: <T = unknown>(url: string, file: File | FormData, options?: UploadRequestOptions<T>) => Promise<ApiResponseBase<T>>
  get: <T = unknown>(url: string, options?: ApiRequestOptions<T>) => Promise<T>
  post: <T = unknown>(url: string, body?: unknown, options?: ApiRequestOptions<T>) => Promise<T>
  put: <T = unknown>(url: string, body?: unknown, options?: ApiRequestOptions<T>) => Promise<T>
  patch: <T = unknown>(url: string, body?: unknown, options?: ApiRequestOptions<T>) => Promise<T>
  delete: <T = unknown>(url: string, options?: ApiRequestOptions<T>) => Promise<T>
  use: (endpoint: string) => ApiInstance
  getConfig: () => ApiEndpointConfig
}

/** API 实例类型 */
export interface ApiInstance extends ApiExtendedMethods {
  /** 原始 $fetch 实例 */
  raw: <T = unknown>(url: string, options?: Record<string, unknown>) => Promise<T>
}

/** useApiFetch 选项，继承 Nuxt UseFetchOptions */
export interface UseApiFetchOptions<T = unknown> extends Omit<UseFetchOptions<ApiResponseBase<T>>, 'transform'> {
  /** API 相关配置 */
  api?: ApiCoreOptions<T>
  /** 端点名称 */
  endpoint?: string
}

/** API 错误类型 */
export interface ApiError extends Error {
  statusCode: number
  response?: ApiResponseBase<unknown>
  /** 是否为业务错误 (API 返回的错误) */
  isBusinessError: boolean
}
