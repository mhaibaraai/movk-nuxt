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

// ==================== ofetch 类型扩展 ====================

/**
 * 扩展 ofetch FetchOptions，添加 context 字段
 *
 * ofetch 运行时支持 context 字段用于在 hooks 间传递自定义数据，
 * 但其 TypeScript 类型定义未包含此字段，这里进行补充
 */
declare module 'ofetch' {
  interface FetchOptions {
    /** 请求上下文，用于在 hooks 间传递自定义数据 */
    context?: ApiFetchContext
  }
}

/**
 * API 请求上下文
 *
 * 用于在 hooks 中传递请求级配置（如 Toast、业务检查等）
 */
export interface ApiFetchContext {
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /** 跳过业务状态码检查 */
  skipBusinessCheck?: boolean
}

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
 *
 * @typeParam ResT - API 响应 data 字段的原始类型
 * @typeParam DataT - transform 转换后的最终类型（默认等于 ResT）
 */
export interface ApiFetchExtras<ResT, DataT = ResT> {
  /** 端点名称 */
  endpoint?: string
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /**
   * 跳过业务状态码检查
   * @defaultValue false
   */
  skipBusinessCheck?: boolean
  /**
   * 自定义数据转换函数
   * 接收解包后的数据（response.data），与 Nuxt 官方 useFetch 行为一致
   *
   * @example
   * ```ts
   * // 从分页响应中提取列表
   * const { data } = useApiFetch<{ content: User[] }, User[]>('/users', {
   *   transform: ({ content }) => content ?? []
   * })
   * ```
   */
  transform?: (data: ResT) => DataT
}

/**
 * useApiFetch 选项类型
 *
 * 基于 Nuxt UseFetchOptions，使用 Omit 移除冲突的 transform
 * 支持双泛型：ResT 为原始响应类型，DataT 为转换后类型
 *
 * @typeParam ResT - API 响应 data 字段的原始类型
 * @typeParam DataT - transform 转换后的最终类型（默认等于 ResT）
 */
export type UseApiFetchOptions<ResT, DataT = ResT>
  = Omit<NuxtUseFetchOptions<ApiResponse<ResT>, DataT>, 'transform'> & ApiFetchExtras<ResT, DataT>

/**
 * useApiFetch 返回类型
 */
export type UseApiFetchReturn<DataT> = AsyncData<DataT | null, FetchError | ApiError | null>

/**
 * 下载选项
 */
export interface DownloadOptions extends Omit<FetchOptions<'json'>, 'responseType'> {
  /**
   * Toast 配置
   * - false: 禁用所有提示
   * - RequestToastOptions: 自定义成功/失败提示
   */
  toast?: RequestToastOptions | false
  /**
   * 下载进度回调
   * @param progress - 下载进度百分比 (0-100)
   */
  onProgress?: (progress: number) => void
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
  /**
   * Toast 配置
   * - false: 禁用所有提示
   * - RequestToastOptions: 自定义成功/失败提示
   */
  toast?: RequestToastOptions | false
  /**
   * 上传进度回调
   * @param progress - 上传进度百分比 (0-100)
   */
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
   * @param url - 下载 URL
   * @param filename - 可选的文件名,如果不提供会从 Content-Disposition 响应头中提取
   * @param options - 下载选项
   * @example await $api.download('/export', 'data.csv')
   * @example await $api.download('/export') // 自动从响应头提取文件名
   */
  download: (url: string, filename?: string, options?: DownloadOptions) => Promise<void>

  /**
   * 上传单个或多个文件
   * @param url - 上传 URL
   * @param file - 单个文件、文件数组或 FormData
   * @param options - 上传选项
   * @example await $api.upload('/upload', file, { fieldName: 'avatar' })
   * @example await $api.upload('/upload', [file1, file2]) // 多文件上传
   */
  upload: <T = unknown>(url: string, file: File | File[] | FormData, options?: UploadOptions) => Promise<ApiResponse<T>>

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
