import type { $Fetch, FetchOptions, FetchHooks, FetchError } from 'ofetch'
import type { UseFetchOptions as NuxtUseFetchOptions, AsyncData } from 'nuxt/app'
import type { ToastProps } from '@nuxt/ui'
import type { User, UserSession, UserSessionComposable } from '#auth-utils'
import type { SessionConfig } from 'h3'
import type { PartialByKeys } from '@movk/core'

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
 * API 响应配置
 * @description 定义业务状态码判断规则和数据/消息字段的映射关系
 */
export interface ApiResponseConfig {
  /**
   * 表示成功的业务状态码列表
   * @defaultValue [200, 0]
   */
  successCodes: (number | string)[]
  /**
   * 响应中业务状态码的字段名
   * @defaultValue 'code'
   */
  codeKey: string
  /**
   * 响应中消息内容的字段名
   * @defaultValue 'message'
   */
  messageKey: string
  /**
   * 响应中业务数据的字段名
   * @defaultValue 'data'
   */
  dataKey: string
}

/**
 * 401 未授权处理配置
 * @description 定义当接收到 401 响应时的自动处理行为
 */
export interface ApiUnauthorizedConfig {
  /**
   * 是否自动重定向到登录页
   * @defaultValue false
   */
  redirect?: boolean
  /**
   * 登录页路径
   * @defaultValue '/login'
   */
  loginPath?: string
  /**
   * 是否清除用户会话
   * @defaultValue false
   */
  clearSession?: boolean
}

/**
 * API 认证配置
 * @description 定义认证令牌的来源、格式和请求头配置
 */
export interface ApiAuthConfig {
  /**
   * 是否启用认证
   * @defaultValue false
   */
  enabled: boolean
  /**
   * 令牌来源类型
   * - `session`: 从用户会话中获取令牌
   * - `custom`: 通过自定义逻辑提供令牌
   * @defaultValue 'session'
   */
  tokenSource: 'session' | 'custom'
  /**
   * 令牌在会话对象中的路径（支持点号分隔的嵌套路径）
   * @defaultValue 'token'
   * @example 'token' | 'user.accessToken' | 'auth.credentials.token'
   */
  sessionTokenPath: string
  /**
   * 令牌类型前缀
   * @defaultValue 'Bearer'
   */
  tokenType: 'Bearer' | 'Basic' | 'Custom'
  /**
   * 自定义令牌类型前缀（当 tokenType 为 'Custom' 时使用）
   */
  customTokenType?: string
  /**
   * 认证请求头名称
   * @defaultValue 'Authorization'
   */
  headerName: string
  /**
   * 401 未授权处理配置
   */
  unauthorized?: ApiUnauthorizedConfig
}

/**
 * Toast 提示配置
 * @description 定义成功和错误提示的全局样式和行为
 */
export interface ApiToastConfig {
  /**
   * 是否启用 Toast 提示
   * @defaultValue true
   */
  enabled: boolean
  /**
   * 成功提示配置
   */
  success?: {
    /**
     * 是否显示成功提示
     * @defaultValue true
     */
    show: boolean
    /**
     * 提示颜色
     * @defaultValue 'success'
     */
    color: string
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-check'
     */
    icon?: string
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration: number
  }
  /**
   * 错误提示配置
   */
  error?: {
    /**
     * 是否显示错误提示
     * @defaultValue true
     */
    show: boolean
    /**
     * 提示颜色
     * @defaultValue 'error'
     */
    color: string
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-x'
     */
    icon?: string
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration: number
  }
  /** 允许额外的自定义字段 */
  [key: string]: unknown
}

/**
 * API 端点公共配置
 * @description 定义单个 API 端点的配置（可在客户端访问的配置）
 */
export interface ApiEndpointPublicConfig {
  /**
   * 端点的基础 URL
   */
  baseURL: string
  /**
   * 端点别名（用于标识）
   */
  alias?: string
  /**
   * 端点级别的认证配置（覆盖全局配置）
   */
  auth?: Partial<ApiAuthConfig>
  /**
   * 端点级别的 Toast 配置（覆盖全局配置）
   */
  toast?: Partial<ApiToastConfig>
  /**
   * 端点级别的响应配置（覆盖全局配置）
   */
  response?: Partial<ApiResponseConfig>
}

/**
 * Movk API 模块公共配置
 * @description 定义模块的全局配置（可在客户端访问）
 */
export interface MovkApiPublicConfig {
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint: string
  /**
   * 是否启用调试模式（在控制台输出请求和响应日志）
   * @defaultValue false
   */
  debug: boolean
  /**
   * 端点配置映射
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints: Record<string, ApiEndpointPublicConfig>
  /**
   * 全局响应配置
   */
  response?: ApiResponseConfig
  /**
   * 全局认证配置
   */
  auth?: ApiAuthConfig
  /**
   * 全局 Toast 配置
   */
  toast?: ApiToastConfig
}

/**
 * Movk API 模块私有配置
 * @description 定义模块的私有配置（仅服务端可访问，不会暴露给客户端）
 */
export interface MovkApiPrivateConfig {
  /**
   * 各端点的私有配置
   */
  endpoints?: Record<string, {
    /**
     * 自定义请求头（仅服务端使用，不会暴露给客户端）
     */
    headers?: Record<string, string>
  }>
}

/**
 * Movk API 模块完整配置
 * @description 定义模块的完整配置（公共+私有），用于模块初始化时的配置验证
 */
export interface MovkApiFullConfig {
  /**
   * 是否启用 API 模块
   * @defaultValue true
   */
  enabled?: boolean
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint?: string
  /**
   * 是否启用调试模式
   * @defaultValue false
   */
  debug?: boolean
  /**
   * 端点配置映射（包含公共和私有配置）
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints?: Record<string, ApiEndpointPublicConfig & {
    /**
     * 自定义请求头（仅服务端使用）
     */
    headers?: Record<string, string>
  }>
  /**
   * 全局响应配置
   */
  response?: Partial<ApiResponseConfig>
  /**
   * 全局认证配置
   */
  auth?: Partial<ApiAuthConfig>
  /**
   * 全局 Toast 配置
   */
  toast?: Partial<ApiToastConfig>
}

/**
 * API 响应数据结构
 * @description 适配多种常见的后端响应格式
 * @template T - 业务数据类型
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码 */
  code?: number | string
  /** HTTP 状态码或业务状态 */
  status?: number | string
  /** 消息内容（简写） */
  msg?: string
  /** 消息内容 */
  message?: string
  /** 业务数据 */
  data?: T
  /** 业务数据（别名） */
  result?: T
  /** 认证令牌 */
  token?: string
  /** 访问令牌 */
  accessToken?: string
  /** 错误信息 */
  error?: string | null
  /** 支持任意额外字段 */
  [key: string]: unknown
}

/**
 * API 错误对象
 * @description 扩展标准 Error，包含业务响应和状态码信息
 */
export interface ApiError extends Error {
  /** HTTP 或业务状态码 */
  statusCode: number
  /** 原始 API 响应数据 */
  response?: ApiResponse
  /** 是否为业务逻辑错误（非 HTTP 错误） */
  isBusinessError: boolean
}

/**
 * 已解析的端点配置
 * @description 合并全局配置和端点配置后的最终配置，供内部使用
 */
export interface ResolvedEndpointConfig extends ApiEndpointPublicConfig {
  /** 认证配置（已合并全局配置） */
  auth: Partial<ApiAuthConfig>
  /** Toast 配置（已合并全局配置） */
  toast: Partial<ApiToastConfig>
  /** 响应配置（已合并全局配置） */
  response: Partial<ApiResponseConfig>
  /** 自定义请求头（仅服务端配置） */
  headers?: Record<string, string>
  /** 内置请求钩子（内部使用） */
  builtinHooks?: FetchHooks
}

/**
 * 请求级别的 Toast 提示选项
 * @description 用于单个请求的 Toast 配置，可覆盖全局配置
 */
export interface RequestToastOptions {
  /** 成功提示配置，设置为 false 禁用成功提示 */
  success?: Partial<ToastProps> | false
  /** 错误提示配置，设置为 false 禁用错误提示 */
  error?: Partial<ToastProps> | false
  /** 自定义成功消息 */
  successMessage?: string
  /** 自定义错误消息 */
  errorMessage?: string
}

/**
 * useApiFetch 的扩展选项
 * @template ResT - API 响应数据类型
 * @template DataT - 转换后的数据类型
 */
export interface ApiFetchExtras<ResT, DataT = ResT> {
  /** 使用的端点名称（默认使用 defaultEndpoint） */
  endpoint?: string
  /** Toast 提示配置，设置为 false 禁用提示 */
  toast?: RequestToastOptions | false
  /** 是否跳过业务状态码检查 */
  skipBusinessCheck?: boolean
  /** 数据转换函数（应用于提取后的业务数据） */
  transform?: (data: ResT) => DataT
}

/**
 * useApiFetch 选项类型
 * @template ResT - API 响应数据类型
 * @template DataT - 转换后的数据类型
 */
export type UseApiFetchOptions<ResT, DataT = ResT>
  = Omit<NuxtUseFetchOptions<ApiResponse<ResT>, DataT>, 'transform'> & ApiFetchExtras<ResT, DataT>

/**
 * useApiFetch 返回值类型
 * @template DataT - 数据类型
 */
export type UseApiFetchReturn<DataT> = AsyncData<DataT | null, FetchError | ApiError | null>

/**
 * 文件下载选项
 */
export interface DownloadOptions extends Omit<FetchOptions<'json'>, 'responseType'> {
  /** Toast 提示配置，设置为 false 禁用提示 */
  toast?: RequestToastOptions | false
  /** 下载进度回调（0-100） */
  onProgress?: (progress: number) => void
}

/**
 * 文件上传选项
 */
export interface UploadOptions extends Omit<FetchOptions<'json'>, 'responseType' | 'body'> {
  /**
   * FormData 中的文件字段名
   * @defaultValue 'file'
   */
  fieldName?: string
  /** Toast 提示配置，设置为 false 禁用提示 */
  toast?: RequestToastOptions | false
  /** 上传进度回调（0-100） */
  onProgress?: (progress: number) => void
}

/**
 * API 客户端接口
 * @description 提供统一的 API 请求、文件上传下载等功能
 */
export interface ApiClient {
  /** ofetch 实例，用于发起请求 */
  $fetch: $Fetch
  /** 切换到指定端点 */
  use: (endpoint: string) => ApiClient
  /** 下载文件 */
  download: (url: string, filename?: string, options?: DownloadOptions) => Promise<void>
  /**
   * 上传文件
   * @template T - API 响应数据类型
   */
  upload: <T = unknown>(url: string, file: File | File[] | FormData, options?: UploadOptions) => Promise<ApiResponse<T>>
  /** 获取当前端点配置 */
  getConfig: () => ResolvedEndpointConfig
}

/**
 * 登录选项
 * @template LoginRData - 登录接口响应数据类型
 */
export interface LoginOptions<LoginRData = unknown> {
  /** 登录接口路径 */
  loginPath: string
  /** 登录凭证（用户名/密码等） */
  credentials: unknown
  /** 获取用户信息的接口路径（可选，如果登录接口不返回用户信息） */
  userInfoPath?: string
  /**
   * 从登录响应中提取令牌的函数
   * @defaultValue 从 response.token 或 response.data.token 提取
   */
  tokenExtractor?: (response: ApiResponse<LoginRData>) => string | null | undefined
  /**
   * 自定义会话构建函数
   * @defaultValue 使用 { user, token, loggedInAt: new Date().toISOString() } 作为会话数据
   */
  sessionBuilder?: (userInfo: User, token: string, loginData: LoginRData) => PartialByKeys<UserSession, 'id'>
  /**
   * Session 配置（maxAge、cookie 等）
   * @defaultValue { name: 'nuxt-session', password: process.env.NUXT_SESSION_PASSWORD || '', cookie: { sameSite: 'lax' } }
   * @see https://github.com/atinux/nuxt-auth-utils?tab=readme-ov-file#configuration
   */
  sessionConfig?: Partial<SessionConfig>
  /** 使用的端点名称（默认使用 defaultEndpoint） */
  endpoint?: string
}

/**
 * 登录结果
 * @template LoginRData - 登录接口响应数据类型
 */
export interface LoginResult<LoginRData = unknown> {
  /** 用户信息 */
  user: User
  /** 认证令牌 */
  token: string
  /** 登录响应数据（已提取） */
  loginData: LoginRData
}

/**
 * useApiAuth 返回值类型
 * @description 扩展 nuxt-auth-utils 的 UserSessionComposable，添加 login 方法
 */
export interface UseApiAuthReturn extends UserSessionComposable {
  /**
   * 登录方法
   * @template LoginRData - 登录接口响应数据类型
   */
  login: <LoginRData = unknown>(options: LoginOptions<LoginRData>) => Promise<LoginResult<LoginRData>>
}
