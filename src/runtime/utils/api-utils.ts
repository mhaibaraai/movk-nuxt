import type { ToastProps } from '@nuxt/ui'
import type {
  ApiResponse,
  ApiError,
  ApiSuccessConfig,
  ApiToastConfig,
  RequestToastOptions
} from '../types/api'
import { useNuxtApp, useToast } from '#imports'

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
    title: message,
    color: type === 'success' ? 'success' : 'error',
    duration: 3000,
    ...(typeConfig && { ...typeConfig, show: undefined }),
    ...requestTypeConfig
  } as ToastProps)
}

// ==================== Transform 工厂 ====================

interface CreateTransformOptions<T> {
  unwrap: boolean
  skipBusinessCheck: boolean
  toast?: RequestToastOptions | false
  userTransform?: (data: ApiResponse<T>) => T
  toastConfig: Partial<ApiToastConfig>
  successConfig: Partial<ApiSuccessConfig>
}

/**
 * 创建 useFetch transform 函数
 *
 * 处理流程:
 * 1. 业务状态码检查 → 失败时抛出 ApiError
 * 2. Toast 提示 (仅客户端)
 * 3. 用户自定义 transform
 * 4. 自动解包数据
 */
export function createTransform<T>(options: CreateTransformOptions<T>) {
  const {
    unwrap,
    skipBusinessCheck,
    toast,
    userTransform,
    toastConfig,
    successConfig
  } = options

  return (response: ApiResponse<T>): T => {
    const isSuccess = skipBusinessCheck || isBusinessSuccess(response, successConfig)
    const message = extractMessage(response, successConfig)

    // 业务失败处理
    if (!isSuccess) {
      if (import.meta.client) {
        showToast('error', message, toast, toastConfig)
      }
      throw createApiError(response, message)
    }

    // 业务成功提示
    if (import.meta.client) {
      const customMessage = toast !== false ? (toast?.successMessage || message) : undefined
      showToast('success', customMessage, toast, toastConfig)
    }

    // 用户自定义 transform
    if (userTransform) {
      return userTransform(response)
    }

    // 自动解包
    return unwrap ? extractData<T>(response, successConfig) : response as unknown as T
  }
}
