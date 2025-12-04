import type { FetchError } from 'ofetch'
import type { UseFetchOptions } from 'nuxt/app'
import type { Ref } from 'vue'
import type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions,
  RequestToastOptions
} from '../schemas/api'

// 重新导出 schema 中的类型
export type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions,
  RequestToastOptions
}

// ==================== 多端点配置类型 ====================

/**
 * 多端点配置
 * key 为端点名称，如 'default', 'mock', 'v2' 等
 */
export type ApiEndpointsConfig = Record<string, ApiEndpointConfig>

// ==================== 扩展请求配置类型 ====================

/**
 * 基础请求配置 (所有字段可选)
 */
export interface RequestOptions {
  /** 是否携带认证信息，覆盖全局配置 */
  auth?: boolean
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /** 是否解包响应数据，直接返回 data 字段，默认 true */
  unwrap?: boolean
  /** 请求超时时间 (ms) */
  timeout?: number
  /** 重试次数 */
  retry?: number | false
  /** 重试延迟 (ms) */
  retryDelay?: number
}

/**
 * 带泛型的请求配置 (用于运行时)
 */
export interface RequestOptionsWithTransform<T = unknown> extends RequestOptions {
  /** 自定义响应转换函数 */
  transform?: (response: ApiResponseBase<T>) => T
}

/**
 * 上传请求配置
 */
export interface UploadRequestOptions<T = unknown> extends RequestOptionsWithTransform<T> {
  /** 文件字段名，默认 'file' */
  fieldName?: string
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
}

// ==================== API 实例类型 ====================

/**
 * 扩展的 API 实例方法
 */
export interface ApiExtendedMethods {
  /**
   * 下载文件
   * @param url 请求地址
   * @param options 请求选项
   * @param filename 文件名
   */
  download: (url: string, options?: RequestOptions, filename?: string) => Promise<void>

  /**
   * 上传文件
   * @param url 请求地址
   * @param file 文件或 FormData
   * @param options 请求选项
   */
  upload: <T = unknown>(
    url: string,
    file: File | FormData,
    options?: UploadRequestOptions<T>
  ) => Promise<ApiResponseBase<T>>

  /**
   * GET 请求
   */
  get: <T = unknown>(url: string, options?: RequestOptionsWithTransform<T>) => Promise<T>

  /**
   * POST 请求
   */
  post: <T = unknown>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) => Promise<T>

  /**
   * PUT 请求
   */
  put: <T = unknown>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) => Promise<T>

  /**
   * PATCH 请求
   */
  patch: <T = unknown>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) => Promise<T>

  /**
   * DELETE 请求
   */
  delete: <T = unknown>(url: string, options?: RequestOptionsWithTransform<T>) => Promise<T>

  /**
   * 切换到指定端点
   */
  use: (endpoint: string) => ApiInstance

  /**
   * 获取当前端点配置
   */
  getConfig: () => ApiEndpointConfig
}

/**
 * API 实例类型
 */
export interface ApiInstance extends ApiExtendedMethods {
  /** 原始 $fetch 实例 (用于自定义请求) */
  raw: <T = unknown>(url: string, options?: Record<string, unknown>) => Promise<T>
}

// ==================== useApiFetch 类型 ====================

/**
 * useApiFetch 返回类型
 */
export interface UseApiFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<FetchError<ApiResponseBase<unknown>> | null>
  pending: Ref<boolean>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  clear: () => void
}

/**
 * useApiFetch 选项
 */
export interface UseApiFetchOptions<T = unknown> extends Omit<UseFetchOptions<ApiResponseBase<T>>, 'transform'> {
  /** API 相关配置 */
  api?: RequestOptionsWithTransform<T>
  /** 使用的端点名称 */
  endpoint?: string
}

/**
 * useLazyApiFetch 选项
 */
export interface UseLazyApiFetchOptions<T = unknown> extends UseApiFetchOptions<T> {
  lazy?: true
}

// ==================== 错误类型 ====================

/**
 * API 错误类型
 */
export interface ApiError extends Error {
  /** 状态码 */
  statusCode: number
  /** 原始响应 */
  response?: ApiResponseBase<unknown>
  /** 是否为业务错误 (API 返回的错误) */
  isBusinessError: boolean
  /** 是否为网络错误 */
  isNetworkError: boolean
  /** 是否为认证错误 */
  isAuthError: boolean
}

// ==================== nuxt-auth-utils 扩展类型 ====================

/**
 * 扩展 UserSession 类型
 * 用于存储 token 等认证信息
 */
export interface MovkSecureSessionData {
  /** API Token */
  token?: string
  /** Token 类型 */
  tokenType?: string
  /** Token 过期时间 */
  tokenExpiresAt?: number
  /** 刷新 Token */
  refreshToken?: string
}

// ==================== 模块增强 ====================

declare module '#app' {
  interface NuxtApp {
    $api: ApiInstance
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiInstance
  }
}

// 扩展 nuxt-auth-utils 类型
declare module '#auth-utils' {
  interface SecureSessionData extends MovkSecureSessionData {}
}

export {}
