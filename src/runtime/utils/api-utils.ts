import type { ToastProps } from '@nuxt/ui'
import type {
  ApiResponse,
  ApiError,
  ApiResponseConfig,
  ApiToastConfig,
  ApiAuthConfig,
  RequestToastOptions,
  ResolvedEndpointConfig,
  MovkApiPublicConfig
} from '../types/api'
import { getPath } from '@movk/core'
import defu from 'defu'
import { useNuxtApp, useToast, useUserSession } from '#imports'

/**
 * 判断 API 响应是否业务成功
 * @param response - API 响应对象
 * @param config - 响应配置（包含 codeKey 和 successCodes）
 * @returns 是否业务成功
 */
export function isBusinessSuccess(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): boolean {
  const codeKey = config.codeKey || 'code'
  const successCodes = config.successCodes || [200, 0]
  const code = response[codeKey]
  return successCodes.includes(code as number | string)
}

/**
 * 从 API 响应中提取消息内容
 * @param response - API 响应对象
 * @param config - 响应配置（包含 messageKey）
 * @returns 消息字符串或 undefined
 */
export function extractMessage(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): string | undefined {
  const messageKey = config.messageKey || 'message'
  return (response[messageKey] as string | undefined)
    || (response.message as string | undefined)
    || (response.msg as string | undefined)
}

/**
 * 从 API 响应中提取业务数据
 * @param response - API 响应对象
 * @param config - 响应配置（包含 dataKey）
 * @returns 业务数据
 */
export function extractData(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): unknown {
  const dataKey = config.dataKey || 'data'
  return response[dataKey] ?? response
}

/**
 * 创建业务错误对象
 * @param response - API 响应对象
 * @param message - 错误消息（可选）
 * @returns 业务错误对象
 */
export function createApiError(response: ApiResponse, message?: string): ApiError {
  const error = new Error(message || '请求失败') as ApiError
  error.statusCode = Number(response.code || response.status || 500)
  error.response = response
  error.isBusinessError = true
  return error
}

/**
 * 获取 Toast 实例
 * @returns Toast 实例或 null
 * @internal
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
 * 提取 Toast 消息内容
 * @param toast - Toast 配置选项
 * @param type - 消息类型
 * @param fallback - 默认消息
 * @returns 最终显示的消息内容
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
 * @param type - 提示类型
 * @param message - 提示消息
 * @param requestOptions - 请求级别的 Toast 配置
 * @param globalConfig - 全局 Toast 配置
 */
export function showToast(
  type: 'success' | 'error',
  message: string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  globalConfig: Partial<ApiToastConfig>
): void {
  if (globalConfig.enabled === false || requestOptions === false) return
  if (!message) return

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

/**
 * 获取用户会话实例
 * @returns 用户会话对象或 null
 * @internal
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
 * 从用户会话中提取认证令牌
 * @param tokenPath - 令牌在会话对象中的路径（支持点号分隔的嵌套路径）
 * @returns 令牌字符串或 null
 * @internal
 */
function getTokenFromSession(tokenPath: string): string | null {
  const userSession = getUserSession()
  if (!userSession?.session?.value) return null

  const sessionData = userSession.session.value
  return (getPath(sessionData, tokenPath) as string) || null
}

/**
 * 构建认证请求头的值
 * @param token - 认证令牌
 * @param config - 认证配置
 * @returns 格式化的认证头值（如: "Bearer token123"）
 * @internal
 */
function buildAuthHeaderValue(token: string, config: Partial<ApiAuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

/**
 * 获取认证请求头
 * @param config - 已解析的端点配置（或至少包含 auth 字段）
 * @returns 认证请求头对象
 */
export function getAuthHeaders(config: Pick<ResolvedEndpointConfig, 'auth'>): Record<string, string> {
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

/**
 * 从 publicConfig 解析端点配置（合并全局默认值）
 * @param publicConfig - 模块公共配置
 * @param endpoint - 端点名称（可选，默认使用 defaultEndpoint）
 * @returns 已解析的端点配置（含 baseURL、auth、toast、response）
 */
export function resolveEndpointConfig(
  publicConfig: MovkApiPublicConfig,
  endpoint?: string
): Pick<ResolvedEndpointConfig, 'baseURL' | 'auth' | 'toast' | 'response'> {
  const endpointName = endpoint || publicConfig.defaultEndpoint || 'default'
  const endpointConfig = publicConfig.endpoints[endpointName]
  if (!endpointConfig) {
    console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
    return resolveEndpointConfig(publicConfig, publicConfig.defaultEndpoint || 'default')
  }

  return {
    baseURL: endpointConfig.baseURL || '',
    auth: defu(endpointConfig.auth, publicConfig.auth) as ResolvedEndpointConfig['auth'],
    toast: defu(endpointConfig.toast, publicConfig.toast) as ResolvedEndpointConfig['toast'],
    response: defu(endpointConfig.response, publicConfig.response) as ResolvedEndpointConfig['response']
  }
}
