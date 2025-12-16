import type { $Fetch, FetchOptions, FetchHooks, FetchError } from 'ofetch'
import type { UseFetchOptions as NuxtUseFetchOptions, AsyncData } from 'nuxt/app'
import type { ToastProps } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type {
  apiSessionConfigSchema,
  apiEndpointConfigSchema,
  movkApiModuleOptionsSchema
} from '../schemas/api'
import {
  apiSuccessConfigSchema,
  apiAuthConfigSchema,
  apiToastConfigSchema
} from '../schemas/api'
import type { User, UserSession, UserSessionComposable } from '#auth-utils'

// ==================== 从 Schema 推导的基础类型 ====================

/** 成功响应判断配置 */
export type ApiSuccessConfig = z.infer<typeof apiSuccessConfigSchema>

/** Session 管理配置 */
export type ApiSessionConfig = z.infer<typeof apiSessionConfigSchema>

/** 认证配置 */
export type ApiAuthConfig = z.infer<typeof apiAuthConfigSchema>

/** Toast 配置 */
export type ApiToastConfig = z.infer<typeof apiToastConfigSchema>

/** 单个端点配置 */
export type ApiEndpointConfig = z.infer<typeof apiEndpointConfigSchema>

/** 模块配置 */
export type MovkApiModuleOptions = z.infer<typeof movkApiModuleOptionsSchema>

// ==================== API 响应与错误类型 ====================

/**
 * API 标准响应结构
 * 支持多种常见后端响应格式
 */
export interface ApiResponse<T = unknown> {
  code?: number | string
  status?: number | string
  msg?: string
  message?: string
  data?: T
  result?: T
  token?: string
  accessToken?: string
  error?: string | null
  [key: string]: unknown
}

/**
 * API 业务错误
 */
export interface ApiError extends Error {
  statusCode: number
  response?: ApiResponse
  isBusinessError: boolean
}

// ==================== 端点配置类型 ====================

/**
 * 合并后的端点配置（运行时使用）
 */
export interface ResolvedEndpointConfig extends ApiEndpointConfig {
  auth: Partial<ApiAuthConfig>
  toast: Partial<ApiToastConfig>
  success: Partial<ApiSuccessConfig>
  builtinHooks?: FetchHooks
}

// ==================== 请求选项类型 ====================

/**
 * 请求级 Toast 配置
 */
export interface RequestToastOptions {
  success?: Partial<ToastProps> | false
  error?: Partial<ToastProps> | false
  successMessage?: string
  errorMessage?: string
}

/**
 * useApiFetch 扩展选项
 */
export interface ApiFetchExtras<T> {
  /** 端点名称 */
  endpoint?: string
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /**
   * 是否解包数据（从 response.data 提取）
   * @defaultValue true
   */
  unwrap?: boolean
  /**
   * 跳过业务状态码检查
   * @defaultValue false
   */
  skipBusinessCheck?: boolean
  /**
   * 自定义数据转换函数
   * 在业务检查通过后执行，替代默认的解包行为
   */
  transform?: (data: ApiResponse<T>) => T
}

/**
 * useApiFetch 选项类型
 *
 * 基于 Nuxt UseFetchOptions，使用 Omit 移除冲突的 transform
 * 然后在 ApiFetchExtras 中重新定义更精确的 transform 类型
 */
export type UseApiFetchOptions<T> = Omit<NuxtUseFetchOptions<ApiResponse<T>, T>, 'transform'> & ApiFetchExtras<T>

/**
 * useApiFetch 返回类型
 */
export type UseApiFetchReturn<T> = AsyncData<T | null, FetchError | ApiError | null>

/**
 * 上传选项
 */
export interface UploadOptions extends Omit<FetchOptions<'json'>, 'responseType' | 'body'> {
  /**
   * 文件字段名
   * @defaultValue 'file'
   */
  fieldName?: string
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
}

// ==================== API 实例类型 ====================

/**
 * API 客户端实例
 */
export interface ApiClient {
  $fetch: $Fetch

  /**
   * 切换端点
   * @example $api.use('v2').$fetch('/users')
   */
  use: (endpoint: string) => ApiClient

  /**
   * 下载文件
   * @example await $api.download('/export', 'data.csv')
   */
  download: (url: string, filename?: string, options?: FetchOptions) => Promise<void>

  /**
   * 上传文件
   * @example await $api.upload('/upload', file, { fieldName: 'avatar' })
   */
  upload: <T = unknown>(url: string, file: File | FormData, options?: UploadOptions) => Promise<ApiResponse<T>>

  /**
   * 获取端点配置（内部使用）
   * @internal
   */
  getConfig: () => ResolvedEndpointConfig
}

// ==================== useApiAuth 类型 ====================

/** 登录选项 */
export interface LoginOptions<LoginRData = unknown> {
  loginPath: string
  credentials: unknown
  userInfoPath?: string
  tokenExtractor?: (response: ApiResponse<LoginRData>) => string | null | undefined
  sessionBuilder?: (userInfo: User, token: string) => UserSession
  endpoint?: string
}

export interface LoginResult {
  user: User
  token: string
}

export interface UseApiAuthReturn extends UserSessionComposable {
  login: <LoginRData = unknown>(options: LoginOptions<LoginRData>) => Promise<LoginResult>
}

// ==================== 默认配置 ====================

export const DEFAULT_SUCCESS_CONFIG: ApiSuccessConfig = apiSuccessConfigSchema.parse({})
export const DEFAULT_AUTH_CONFIG: ApiAuthConfig = apiAuthConfigSchema.parse({})
export const DEFAULT_TOAST_CONFIG: ApiToastConfig = apiToastConfigSchema.parse({})
