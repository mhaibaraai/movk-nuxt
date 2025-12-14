import type { ToastProps } from '@nuxt/ui'
import type {
  ApiResponse,
  ApiError,
  SuccessConfig,
  ToastConfig,
  RequestToastOptions
} from '../types/api'
import { useNuxtApp, useToast } from '#imports'

// ==================== 业务逻辑工具 ====================

/**
 * 检查业务状态码是否成功
 */
export function isBusinessSuccess(
  response: ApiResponse,
  config: Partial<SuccessConfig> = {}
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
  config: Partial<SuccessConfig> = {}
): string | undefined {
  const messageKey = config.messageKey || 'message'
  return (response[messageKey] as string) || response.message || response.msg
}

/**
 * 从响应中提取数据
 */
export function extractData<T>(
  response: ApiResponse<T>,
  config: Partial<SuccessConfig> = {}
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
 * Toast 显示选项
 */
interface ShowToastOptions {
  type: 'success' | 'error'
  response: ApiResponse
  requestOptions?: RequestToastOptions | false
  globalConfig: Partial<ToastConfig>
  successConfig: Partial<SuccessConfig>
}

/**
 * 显示 Toast 提示
 */
export function showToast(options: ShowToastOptions): void {
  const { type, response, requestOptions, globalConfig, successConfig } = options

  // 检查是否禁用
  if (globalConfig.enabled === false) return
  if (requestOptions === false) return

  const toast = getToast()
  if (!toast) return

  // 获取类型配置
  const typeConfig = globalConfig[type]
  if (typeConfig?.show === false) return

  // 检查请求级配置
  if (requestOptions && requestOptions[type] === false) return

  // 获取消息
  const customMessage = type === 'success'
    ? requestOptions?.successMessage
    : requestOptions?.errorMessage
  const autoMessage = extractMessage(response, successConfig)
  const finalMessage = customMessage || autoMessage

  if (!finalMessage) return

  // 构建 Toast 选项
  const toastOptions: Partial<ToastProps> = {
    title: finalMessage,
    color: type === 'success' ? 'success' : 'error',
    duration: 1500,
    ...typeConfig as Partial<ToastProps>,
    ...(typeof requestOptions?.[type] === 'object' ? requestOptions[type] as Partial<ToastProps> : {})
  }

  // 移除内部属性
  delete (toastOptions as Record<string, unknown>).show

  toast.add(toastOptions as ToastProps)
}

// ==================== 响应处理器 ====================

/**
 * 响应处理器配置
 */
interface ResponseHandlerConfig<T = unknown> {
  /** 请求级选项 */
  requestOptions?: {
    toast?: RequestToastOptions | false
    unwrap?: boolean
    transform?: (response: ApiResponse<T>) => T
    skipBusinessCheck?: boolean
  }
  /** Toast 配置 */
  toastConfig: Partial<ToastConfig>
  /** 成功判断配置 */
  successConfig: Partial<SuccessConfig>
}

/**
 * 响应处理器返回
 */
interface ResponseHandlers<T = unknown> {
  /** onResponse 钩子 */
  onResponse: (context: { response: { _data: ApiResponse } }) => void
  /** transform 函数 */
  transform: (data: ApiResponse<T>) => T
}

/**
 * 创建响应处理器
 *
 * 用于 useFetch 的 onResponse 和 transform 钩子
 */
export function createResponseHandlers<T = unknown>(
  config: ResponseHandlerConfig<T>
): ResponseHandlers<T> {
  const { requestOptions = {}, toastConfig, successConfig } = config

  return {
    onResponse({ response }) {
      if (requestOptions.skipBusinessCheck) return

      const isSuccess = isBusinessSuccess(response._data, successConfig)

      showToast({
        type: isSuccess ? 'success' : 'error',
        response: response._data,
        requestOptions: requestOptions.toast,
        globalConfig: toastConfig,
        successConfig
      })
    },

    transform(data) {
      // 业务错误检查
      if (!requestOptions.skipBusinessCheck && !isBusinessSuccess(data, successConfig)) {
        const errorMessage = extractMessage(data, successConfig)
        throw createApiError(data, errorMessage)
      }

      // 自定义转换
      if (requestOptions.transform) {
        return requestOptions.transform(data)
      }

      // 自动解包
      if (requestOptions.unwrap !== false) {
        return extractData(data, successConfig)
      }

      return data as T
    }
  }
}

// ==================== Hook 调用工具 ====================

type FetchHook<T> = ((context: T) => void) | ((context: T) => void)[]

/**
 * 安全调用 Fetch Hook
 */
export function callFetchHook<T>(hook: FetchHook<T> | undefined, context: T): void {
  if (!hook) return

  if (typeof hook === 'function') {
    hook(context)
  }
  else if (Array.isArray(hook)) {
    hook.forEach(fn => fn(context))
  }
}
