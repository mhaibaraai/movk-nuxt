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
  /**
   * 是否跳过业务状态码检查
   * @defaultValue false
   */
  skipBusinessCheck?: boolean
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

/**
 * API 实例类型
 */
export interface ApiInstance {
  /**
   * 核心 $fetch 实例
   * 用于 useFetch 的 $fetch 选项
   *
   * @example
   * ```ts
   * // 直接使用
   * const { $api } = useNuxtApp()
   * const data = await $api.$fetch('/users')
   *
   * // 配合 useFetch
   * const { data } = await useFetch('/users', {
   *   $fetch: $api.$fetch
   * })
   * ```
   */
  $fetch: $Fetch

  /**
   * 切换到其他端点
   *
   * @param endpoint 端点名称
   * @returns 新的 API 实例
   *
   * @example
   * ```ts
   * const { $api } = useNuxtApp()
   * const v2Api = $api.use('v2')
   * const data = await v2Api.$fetch('/users')
   * ```
   */
  use: (endpoint: string) => ApiInstance

  /**
   * 下载文件
   *
   * @param url 下载 URL
   * @param filename 保存文件名
   * @param options 请求选项
   *
   * @example
   * ```ts
   * const { $api } = useNuxtApp()
   * await $api.download('/export', 'data.csv')
   * ```
   */
  download: (url: string, filename?: string, options?: Omit<ApiRequestOptions, 'transform'>) => Promise<void>

  /**
   * 上传文件
   *
   * @param url 上传 URL
   * @param file 文件或 FormData
   * @param options 上传选项
   *
   * @example
   * ```ts
   * const { $api } = useNuxtApp()
   * const file = new File(['content'], 'test.txt')
   * const result = await $api.upload('/upload', file)
   * ```
   */
  upload: <T = unknown>(url: string, file: File | FormData, options?: UploadRequestOptions<T>) => Promise<ApiResponseBase<T>>

  /**
   * 获取端点配置（内部使用）
   * @internal
   */
  getConfig: () => ApiEndpointConfig & {
    auth: Partial<ApiAuthConfig>
    toast: Partial<ApiToastConfig>
    success: Partial<ApiSuccessConfig>
  }
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
