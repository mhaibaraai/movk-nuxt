import type { $Fetch, FetchOptions } from 'ofetch'
import type { UseFetchOptions, AsyncData } from 'nuxt/app'
import type { ToastProps } from '@nuxt/ui'
import type { Ref, ComputedRef } from 'vue'

// ==================== 基础响应类型 ====================

/**
 * API 标准响应结构
 * 支持多种常见后端响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code?: number | string
  status?: number | string
  /** 消息 */
  msg?: string
  message?: string
  /** 数据 */
  data?: T
  result?: T
  /** Token（登录响应） */
  token?: string
  accessToken?: string
  /** 错误信息 */
  error?: string | null
  /** 允许额外字段 */
  [key: string]: unknown
}

/**
 * API 业务错误
 */
export interface ApiError extends Error {
  /** HTTP 状态码或业务状态码 */
  statusCode: number
  /** 原始响应数据 */
  response?: ApiResponse
  /** 是否为业务错误（非 HTTP 错误） */
  isBusinessError: boolean
}

// ==================== 配置类型 ====================

/**
 * 成功响应判断配置
 */
export interface SuccessConfig {
  /**
   * 成功状态码列表
   * @defaultValue [200, 0]
   */
  successCodes: (number | string)[]
  /**
   * 状态码字段名
   * @defaultValue 'code'
   */
  codeKey: string
  /**
   * 消息字段名
   * @defaultValue 'message'
   */
  messageKey: string
  /**
   * 数据字段名
   * @defaultValue 'data'
   */
  dataKey: string
}

/**
 * 认证配置
 */
export interface AuthConfig {
  /**
   * 是否启用认证
   * @defaultValue false
   */
  enabled: boolean
  /**
   * Token 来源
   * @defaultValue 'session'
   */
  tokenSource: 'session' | 'custom'
  /**
   * Session 中 token 路径
   * @defaultValue 'token'
   */
  sessionTokenPath: string
  /**
   * Token 类型
   * @defaultValue 'Bearer'
   */
  tokenType: 'Bearer' | 'Basic' | 'Custom'
  /** 自定义 Token 类型（tokenType='Custom' 时使用） */
  customTokenType?: string
  /**
   * Header 名称
   * @defaultValue 'Authorization'
   */
  headerName: string
  /**
   * 401 时跳转登录页
   * @defaultValue true
   */
  redirectOnUnauthorized: boolean
  /**
   * 登录页路径
   * @defaultValue '/login'
   */
  loginPath: string
  /**
   * 401 时清除 session
   * @defaultValue true
   */
  clearSessionOnUnauthorized: boolean
}

/**
 * Toast 类型配置
 */
export interface ToastTypeConfig {
  /**
   * 是否显示
   * @defaultValue true
   */
  show: boolean
  /** 颜色 */
  color: string
  /** 图标 */
  icon?: string
  /** 持续时间 (ms) */
  duration: number
}

/**
 * Toast 配置
 */
export interface ToastConfig {
  /**
   * 是否启用
   * @defaultValue true
   */
  enabled: boolean
  /** 成功提示配置 */
  success?: Partial<ToastTypeConfig>
  /** 错误提示配置 */
  error?: Partial<ToastTypeConfig>
}

/**
 * 单个端点配置
 */
export interface EndpointConfig {
  /** 基础 URL */
  baseURL: string
  /** 端点别名 */
  alias?: string
  /** 认证配置（覆盖全局） */
  auth?: Partial<AuthConfig>
  /** Toast 配置（覆盖全局） */
  toast?: Partial<ToastConfig>
  /** 成功判断配置（覆盖全局） */
  success?: Partial<SuccessConfig>
  /** 默认请求头 */
  headers?: Record<string, string>
}

/**
 * 模块配置
 */
export interface ApiModuleConfig {
  /**
   * 是否启用
   * @defaultValue true
   */
  enabled: boolean
  /**
   * 默认端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint: string
  /** 端点配置 */
  endpoints?: Record<string, EndpointConfig>
  /** 全局认证配置 */
  auth?: Partial<AuthConfig>
  /** 全局 Toast 配置 */
  toast?: Partial<ToastConfig>
  /** 全局成功判断配置 */
  success?: Partial<SuccessConfig>
  /**
   * 调试模式
   * @defaultValue false
   */
  debug: boolean
}

/**
 * 合并后的端点配置（运行时使用）
 */
export interface ResolvedEndpointConfig extends EndpointConfig {
  auth: Partial<AuthConfig>
  toast: Partial<ToastConfig>
  success: Partial<SuccessConfig>
}

// ==================== 请求选项类型 ====================

/**
 * 请求级 Toast 配置
 */
export interface RequestToastOptions {
  /** 成功提示配置，false 禁用 */
  success?: Partial<ToastProps> | false
  /** 错误提示配置，false 禁用 */
  error?: Partial<ToastProps> | false
  /** 自定义成功消息 */
  successMessage?: string
  /** 自定义错误消息 */
  errorMessage?: string
}

/**
 * API 请求核心选项
 */
export interface ApiRequestConfig<T = unknown> {
  /** 是否携带认证 */
  auth?: boolean
  /** Toast 配置，false 禁用所有提示 */
  toast?: RequestToastOptions | false
  /**
   * 是否解包数据
   * @defaultValue true
   */
  unwrap?: boolean
  /** 自定义数据转换 */
  transform?: (response: ApiResponse<T>) => T
  /**
   * 跳过业务状态码检查
   * @defaultValue false
   */
  skipBusinessCheck?: boolean
}

/**
 * useApiFetch 选项
 */
export interface UseApiFetchOptions<T = unknown> extends Omit<UseFetchOptions<ApiResponse<T>>, 'transform'> {
  /** 端点名称 */
  endpoint?: string
  /** 是否携带认证 */
  auth?: boolean
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /**
   * 是否解包数据
   * @defaultValue true
   */
  unwrap?: boolean
  /** 自定义数据转换 */
  transform?: (response: ApiResponse<T>) => T
  /** 跳过业务状态码检查 */
  skipBusinessCheck?: boolean
}

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
 * API 实例
 */
export interface ApiClient {
  /** $fetch 实例 */
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

// ==================== useApiFetch 返回类型 ====================

/**
 * useApiFetch 返回类型
 */
export type UseApiFetchReturn<T> = AsyncData<T | null, ApiError | null>

// ==================== useApiAuth 类型 ====================

/**
 * Session 数据结构
 */
export interface SessionData {
  /** 用户信息 */
  user: Record<string, unknown>
  /** 认证 Token（客户端可访问） */
  token?: string
  /** 登录时间 */
  loggedInAt?: Date | string
  /** 允许额外字段 */
  [key: string]: unknown
}

/**
 * 登录选项
 */
export interface LoginOptions<TCredentials = unknown, TUser = unknown> {
  /** 登录接口路径 */
  loginPath: string
  /** 登录凭证 */
  credentials: TCredentials
  /** 用户信息接口路径（可选） */
  userInfoPath?: string
  /** 从登录响应提取 token */
  tokenExtractor?: (response: ApiResponse) => string | null | undefined
  /** 构建 session 数据 */
  sessionBuilder?: (userInfo: TUser, token: string) => SessionData
  /** 端点名称 */
  endpoint?: string
}

/**
 * 登录结果
 */
export interface LoginResult<TUser = unknown> {
  user: TUser
  token: string
}

/**
 * useApiAuth 返回类型
 */
export interface UseApiAuthReturn {
  /** 执行登录 */
  login: <TCredentials = unknown, TUser = unknown>(options: LoginOptions<TCredentials, TUser>) => Promise<LoginResult<TUser>>
  /** 登出 */
  logout: () => Promise<void>
  /** 刷新用户信息 */
  refreshUser: <TUser = unknown>(userInfoPath: string, endpoint?: string) => Promise<TUser>
  /** 刷新 session */
  refreshSession: () => Promise<void>
  /** 当前 session */
  session: Ref<SessionData | null>
  /** 是否已登录 */
  loggedIn: ComputedRef<boolean>
  /** 当前用户 */
  user: ComputedRef<Record<string, unknown> | null>
}

// ==================== 默认配置 ====================

/**
 * 默认成功配置
 */
export const DEFAULT_SUCCESS_CONFIG: SuccessConfig = {
  successCodes: [200, 0],
  codeKey: 'code',
  messageKey: 'msg',
  dataKey: 'data'
}

/**
 * 默认认证配置
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  enabled: false,
  tokenSource: 'session',
  sessionTokenPath: 'token',
  tokenType: 'Bearer',
  headerName: 'Authorization',
  redirectOnUnauthorized: true,
  loginPath: '/login',
  clearSessionOnUnauthorized: true
}

/**
 * 默认 Toast 配置
 */
export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  enabled: true,
  success: { show: true, color: 'success', duration: 3000 },
  error: { show: true, color: 'error', duration: 5000 }
}
