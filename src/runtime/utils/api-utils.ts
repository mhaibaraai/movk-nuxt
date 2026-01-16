import type { ToastProps } from '@nuxt/ui'
import type { FetchContext, FetchHooks } from 'ofetch'
import type {
  ApiResponse,
  ApiError,
  ApiResponseConfig,
  ApiToastConfig,
  ApiAuthConfig,
  RequestToastOptions,
  ResolvedEndpointConfig
} from '../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useToast, useUserSession } from '#imports'

/**
 * 判断API响应是否业务成功
 * @param response - API响应对象
 * @param config - 响应配置（包含codeKey和successCodes）
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
 * 从API响应中提取消息内容
 * @param response - API响应对象
 * @param config - 响应配置（包含messageKey）
 * @returns 消息字符串或undefined
 */
export function extractMessage(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): string | undefined {
  const messageKey = config.messageKey || 'message'
  return (response[messageKey] as string) || response.message || response.msg
}

/**
 * 从API响应中提取业务数据
 * @param response - API响应对象
 * @param config - 响应配置（包含dataKey）
 * @returns 业务数据
 */
export function extractData<T>(
  response: ApiResponse<T>,
  config: Partial<ApiResponseConfig> = {}
): T {
  const dataKey = config.dataKey || 'data'
  return (response[dataKey] ?? response.result ?? response) as T
}

/**
 * 创建业务错误对象
 * @param response - API响应对象
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
 * 获取Toast实例
 * @returns Toast实例或null（如果在不支持的上下文中调用）
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
 * 提取Toast消息内容
 * @param toast - Toast配置选项
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
 * 显示Toast提示
 * @param type - 提示类型
 * @param message - 提示消息
 * @param requestOptions - 请求级别的Toast配置
 * @param globalConfig - 全局Toast配置
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

interface CreateTransformOptions<ResT, DataT = ResT> {
  skipBusinessCheck: boolean
  userTransform?: (data: ResT) => DataT
  successConfig: Partial<ApiResponseConfig>
}

/**
 * 创建响应转换函数
 * @description 用于 useFetch 的 transform 选项，处理业务状态码检查和数据提取
 * @param options - 转换选项（包含skipBusinessCheck、userTransform、successConfig）
 * @returns 响应转换函数
 */
export function createTransform<ResT, DataT = ResT>(
  options: CreateTransformOptions<ResT, DataT>
): (response: ApiResponse<ResT>) => DataT {
  const { skipBusinessCheck, userTransform, successConfig } = options

  return (response: ApiResponse<ResT>): DataT => {
    if (!skipBusinessCheck && !isBusinessSuccess(response, successConfig)) {
      throw createApiError(response, extractMessage(response, successConfig))
    }

    const unwrappedData = extractData<ResT>(response, successConfig)

    if (userTransform) {
      return userTransform(unwrappedData)
    }

    return unwrappedData as unknown as DataT
  }
}

type HookFunction = (context: FetchContext) => void | Promise<void>

/**
 * 合并多个钩子函数为一个
 * @param hooks - 钩子函数数组
 * @returns 合并后的钩子函数
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
 * 合并内置钩子和用户钩子
 * @param builtinHooks - 内置钩子集合
 * @param userHooks - 用户自定义钩子集合
 * @returns 合并后的完整钩子集合
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

/**
 * 获取用户会话实例
 * @returns 用户会话对象或null（如果在不支持的上下文中调用）
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
 * @returns 令牌字符串或null
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
 * @param config - 已解析的端点配置
 * @returns 认证请求头对象
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
