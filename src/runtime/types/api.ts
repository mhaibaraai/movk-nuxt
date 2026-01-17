import type { $Fetch, FetchOptions, FetchHooks, FetchError } from 'ofetch'
import type { UseFetchOptions as NuxtUseFetchOptions, AsyncData } from 'nuxt/app'
import type { ToastProps } from '@nuxt/ui'
import type { z } from 'zod/v4'
import type {
  apiEndpointPublicConfigSchema,
  movkApiPublicConfigSchema,
  movkApiPrivateConfigSchema,
  movkApiFullConfigSchema,
  apiUnauthorizedConfigSchema,
  apiResponseConfigSchema,
  apiAuthConfigSchema,
  apiToastConfigSchema
} from '../schemas/api'
import type { User, UserSession, UserSessionComposable } from '#auth-utils'

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

/** API 响应配置（包含业务状态码、数据/消息字段映射） */
export type ApiResponseConfig = z.infer<typeof apiResponseConfigSchema>
/** API 认证配置（包含令牌来源、认证头配置） */
export type ApiAuthConfig = z.infer<typeof apiAuthConfigSchema>
/** 401 未授权处理配置（包含重定向和会话清理选项） */
export type ApiUnauthorizedConfig = z.infer<typeof apiUnauthorizedConfigSchema>
/** Toast 提示配置（包含成功/错误提示的样式和行为） */
export type ApiToastConfig = z.infer<typeof apiToastConfigSchema>
/** API 端点公共配置（用于模块配置的公共部分） */
export type ApiEndpointPublicConfig = z.infer<typeof apiEndpointPublicConfigSchema>
/** Movk API 模块公共配置 */
export type MovkApiPublicConfig = z.infer<typeof movkApiPublicConfigSchema>
/** Movk API 模块私有配置（仅服务端可访问） */
export type MovkApiPrivateConfig = z.infer<typeof movkApiPrivateConfigSchema>
/** Movk API 模块完整配置（公共+私有） */
export type MovkApiFullConfig = z.input<typeof movkApiFullConfigSchema>

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
   * @defaultValue 使用 { user, token } 作为会话数据
   */
  sessionBuilder?: (userInfo: User, token: string) => UserSession
  /** 使用的端点名称（默认使用 defaultEndpoint） */
  endpoint?: string
}

/**
 * 登录结果
 */
export interface LoginResult {
  /** 用户信息 */
  user: User
  /** 认证令牌 */
  token: string
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
  login: <LoginRData = unknown>(options: LoginOptions<LoginRData>) => Promise<LoginResult>
}
