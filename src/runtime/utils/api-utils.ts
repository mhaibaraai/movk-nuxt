import type { ToastProps } from '@nuxt/ui'
import type { FetchContext, FetchHooks } from 'ofetch'
import type {
  ApiResponse,
  ApiError,
  ApiSuccessConfig,
  ApiToastConfig,
  ApiAuthConfig,
  RequestToastOptions,
  ResolvedEndpointConfig
} from '../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useToast, useUserSession } from '#imports'

// ==================== 业务逻辑工具 ====================

/**
 * 检查业务状态码是否成功
 */
export function isBusinessSuccess(
  response: ApiResponse,
  config: Partial<ApiSuccessConfig> = {}
): boolean {
  const codeKey = config.codeKey || 'code'
  const successCodes = config.successCodes || [200, 0]
  const code = response[codeKey]
  return successCodes.includes(code as number | string)
}

/**
 * 从响应中提取消息
 */
export function extractMessage(
  response: ApiResponse,
  config: Partial<ApiSuccessConfig> = {}
): string | undefined {
  const messageKey = config.messageKey || 'message'
  return (response[messageKey] as string) || response.message || response.msg
}

/**
 * 从响应中提取数据
 */
export function extractData<T>(
  response: ApiResponse<T>,
  config: Partial<ApiSuccessConfig> = {}
): T {
  const dataKey = config.dataKey || 'data'
  return (response[dataKey] ?? response.result ?? response) as T
}

/**
 * 创建 API 业务错误
 */
export function createApiError(response: ApiResponse, message?: string): ApiError {
  const error = new Error(message || '请求失败') as ApiError
  error.statusCode = Number(response.code || response.status || 500)
  error.response = response
  error.isBusinessError = true
  return error
}

// ==================== Toast 工具 ====================

/**
 * 获取 Toast 实例（安全获取）
 */
function getToast(): ReturnType<typeof useToast> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.runWithContext(() => useToast()) as ReturnType<typeof useToast>
  }
  catch {
    return null
  }
}

/**
 * 从请求选项中提取 Toast 消息
 */
export function extractToastMessage(
  toast: RequestToastOptions | false | undefined,
  type: 'success' | 'error',
  fallback: string
): string {
  if (toast === false) return fallback
  return (typeof toast === 'object' ? toast?.[`${type}Message`] : undefined) || fallback
}

/**
 * 显示 Toast 提示
 */
export function showToast(
  type: 'success' | 'error',
  message: string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  globalConfig: Partial<ApiToastConfig>
): void {
  // 全局禁用或请求级禁用
  if (globalConfig.enabled === false || requestOptions === false) return
  if (!message) return

  // 类型配置禁用
  const typeConfig = globalConfig[type]
  if (typeConfig?.show === false) return
  if (requestOptions?.[type] === false) return

  const toast = getToast()
  if (!toast) return

  const requestTypeConfig = typeof requestOptions?.[type] === 'object'
    ? requestOptions[type] as Partial<ToastProps>
    : {}

  toast.add({
    icon: type === 'success' ? 'i-lucide-circle-check' : 'i-lucide-circle-x',
    title: message,
    color: type === 'success' ? 'success' : 'error',
    duration: 3000,
    ...(typeConfig && { ...typeConfig, show: undefined }),
    ...requestTypeConfig
  } as ToastProps)
}

// ==================== Transform 工厂 ====================

interface CreateTransformOptions<ResT, DataT = ResT> {
  skipBusinessCheck: boolean
  userTransform?: (data: ResT) => DataT
  successConfig: Partial<ApiSuccessConfig>
}

/**
 * 创建 useFetch transform 函数
 *
 * 处理流程:
 * 1. 业务状态码检查 → 失败时抛出 ApiError
 * 2. 解包数据（提取 response.data）
 * 3. 用户自定义 transform（接收解包后的数据）
 */
export function createTransform<ResT, DataT = ResT>(
  options: CreateTransformOptions<ResT, DataT>
): (response: ApiResponse<ResT>) => DataT {
  const { skipBusinessCheck, userTransform, successConfig } = options

  return (response: ApiResponse<ResT>): DataT => {
    // 业务状态码检查
    if (!skipBusinessCheck && !isBusinessSuccess(response, successConfig)) {
      throw createApiError(response, extractMessage(response, successConfig))
    }

    // 解包数据
    const unwrappedData = extractData<ResT>(response, successConfig)

    // 用户自定义 transform
    if (userTransform) {
      return userTransform(unwrappedData)
    }

    return unwrappedData as unknown as DataT
  }
}

// ==================== Hooks 合并工具 ====================

type HookFunction = (context: FetchContext) => void | Promise<void>

/**
 * 合并多个 hook 函数，确保所有 hooks 都会执行
 */
export function mergeHooks(...hooks: (HookFunction | undefined)[]): HookFunction {
  const validHooks = hooks.filter((h): h is HookFunction => typeof h === 'function')
  if (validHooks.length === 0) return () => {}
  if (validHooks.length === 1) return validHooks[0]!

  return async (context: FetchContext) => {
    for (const hook of validHooks) {
      await hook(context)
    }
  }
}

/**
 * 合并 FetchHooks 对象，每个 hook 类型单独合并
 */
export function mergeFetchHooks(
  builtinHooks: Partial<FetchHooks>,
  userHooks: Partial<FetchHooks>
): FetchHooks {
  return {
    onRequest: mergeHooks(
      builtinHooks.onRequest as HookFunction | undefined,
      userHooks.onRequest as HookFunction | undefined
    ),
    onRequestError: mergeHooks(
      builtinHooks.onRequestError as HookFunction | undefined,
      userHooks.onRequestError as HookFunction | undefined
    ),
    onResponse: mergeHooks(
      builtinHooks.onResponse as HookFunction | undefined,
      userHooks.onResponse as HookFunction | undefined
    ),
    onResponseError: mergeHooks(
      builtinHooks.onResponseError as HookFunction | undefined,
      userHooks.onResponseError as HookFunction | undefined
    )
  }
}

// ==================== 认证工具 ====================

/**
 * 安全获取 useUserSession
 */
function getUserSession(): ReturnType<typeof useUserSession> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.runWithContext(() => useUserSession()) as ReturnType<typeof useUserSession>
  }
  catch {
    return null
  }
}

/**
 * 从 session 获取 Token
 */
function getTokenFromSession(tokenPath: string): string | null {
  const userSession = getUserSession()
  if (!userSession?.session?.value) return null

  const sessionData = userSession.session.value
  return (getPath(sessionData, tokenPath) as string) || null
}

/**
 * 构建 Authorization Header 值
 */
function buildAuthHeaderValue(token: string, config: Partial<ApiAuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

/**
 * 获取认证 Headers
 *
 * 根据端点配置获取认证相关的 headers（如 Authorization）
 * 用于原生 fetch/XHR 请求（如带进度的上传下载）
 *
 * @example
 * ```ts
 * const config = $api.getConfig()
 * const authHeaders = getAuthHeaders(config)
 * fetch(url, { headers: { ...headers, ...authHeaders } })
 * ```
 */
export function getAuthHeaders(config: ResolvedEndpointConfig): Record<string, string> {
  const headers: Record<string, string> = {}
  const authConfig = config.auth

  if (!authConfig.enabled) return headers

  const tokenPath = authConfig.sessionTokenPath || 'token'
  const token = getTokenFromSession(tokenPath)

  if (token) {
    const headerName = authConfig.headerName || 'Authorization'
    headers[headerName] = buildAuthHeaderValue(token, authConfig)
  }

  return headers
}
