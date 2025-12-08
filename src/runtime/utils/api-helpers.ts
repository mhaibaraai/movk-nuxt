import type { ToastProps } from '@nuxt/ui'
import type {
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  RequestToastConfig,
  UseApiFetchOptions,
  ApiEndpointConfig,
  ApiAuthConfig,
  ApiError
} from '../types/api.d'

/**
 * Toast 显示选项
 */
interface ToastShowOptions {
  type: 'success' | 'error'
  response: ApiResponseBase<unknown>
  apiOptions?: { toast?: RequestToastConfig | false }
  globalConfig: Partial<ApiToastConfig>
  endpointConfig: Partial<ApiToastConfig>
  successConfig: Partial<ApiSuccessConfig>
}

/**
 * 响应处理器返回类型
 */
interface ApiResponseHandlers<T = unknown> {
  onResponse?: (context: { response: any }) => void
  transform?: (data: any) => T
}

/**
 * 检查业务状态码是否成功
 *
 * @param response - API 响应对象
 * @param successConfig - 成功配置（包含状态码字段、成功码列表）
 * @returns 是否为成功响应
 *
 * @example
 * ```ts
 * const isSuccess = checkBusinessSuccess(
 *   { code: 200, msg: '操作成功' },
 *   { codeKey: 'code', successCodes: [200, 0] }
 * )
 * // true
 * ```
 */
export function checkBusinessSuccess(
  response: ApiResponseBase<unknown>,
  successConfig: Partial<ApiSuccessConfig> = {}
): boolean {
  const codeKey = successConfig.codeKey || 'code'
  const successCodes = successConfig.successCodes || [200, 0]
  const code = response[codeKey]
  return successCodes.includes(code as number | string)
}

/**
 * 从响应中提取消息
 *
 * @param response - API 响应对象
 * @param successConfig - 成功配置（包含消息字段名）
 * @returns 提取的消息文本，未找到则返回 undefined
 *
 * @example
 * ```ts
 * const message = extractMessage(
 *   { code: 200, msg: '操作成功' },
 *   { messageKey: 'msg' }
 * )
 * // '操作成功'
 * ```
 */
export function extractMessage(
  response: ApiResponseBase<unknown>,
  successConfig: Partial<ApiSuccessConfig> = {}
): string | undefined {
  const messageKey = successConfig.messageKey || 'msg'
  return (response[messageKey] as string) || response.message || response.msg
}

/**
 * 创建 API 业务错误对象
 *
 * @param response - API 响应对象
 * @param message - 错误消息（可选，默认为"请求失败"）
 * @returns 包含业务错误信息的 Error 对象
 *
 * @example
 * ```ts
 * const error = createApiError(
 *   { code: 400, msg: '参数错误' },
 *   '参数错误'
 * )
 * // ApiError { statusCode: 400, isBusinessError: true, ... }
 * ```
 */
export function createApiError(
  response: ApiResponseBase<unknown>,
  message?: string
): ApiError {
  const error = new Error(message || '请求失败') as ApiError
  error.statusCode = Number(response.code || response.status || 500)
  error.response = response
  error.isBusinessError = true
  return error
}

/**
 * 获取 Toast 实例
 */
function getToast() {
  try {
    // useToast 来自 @nuxt/ui,可能不可用
    return (globalThis as any).useToast?.()
  }
  catch {
    return null
  }
}

/**
 * 显示 Toast 提示
 *
 * @param options - Toast 显示选项
 * @param options.type - Toast 类型（success 或 error）
 * @param options.response - API 响应对象
 * @param options.apiOptions - 请求级别的 API 配置
 * @param options.globalConfig - 全局 Toast 配置
 * @param options.endpointConfig - 端点 Toast 配置
 * @param options.successConfig - 成功判断配置
 *
 * @example
 * ```ts
 * showToast({
 *   type: 'success',
 *   response: { code: 200, msg: '操作成功' },
 *   apiOptions: { toast: { successMessage: '创建成功' } },
 *   globalConfig: { enabled: true },
 *   endpointConfig: {},
 *   successConfig: { messageKey: 'msg' }
 * })
 * ```
 */
export function showToast(options: ToastShowOptions): void {
  const { type, response, apiOptions, globalConfig, endpointConfig, successConfig } = options

  // 全局禁用
  if (!globalConfig.enabled) return
  // 端点禁用
  if (endpointConfig.enabled === false) return
  // 请求禁用
  if (apiOptions?.toast === false) return

  const toast = getToast()
  if (!toast) return

  // 获取类型配置
  const globalTypeConfig = globalConfig[type]
  const endpointTypeConfig = endpointConfig[type]
  const requestToast = apiOptions?.toast

  // 检查是否显示
  if (globalTypeConfig?.show === false) return
  if (endpointTypeConfig?.show === false) return

  // 检查请求级别配置
  if (requestToast && typeof requestToast === 'object') {
    if (requestToast[type] === false) return
  }

  // 获取消息
  const customMessage = type === 'success'
    ? (requestToast as RequestToastConfig)?.successMessage
    : (requestToast as RequestToastConfig)?.errorMessage
  const autoMessage = extractMessage(response, successConfig)
  const finalMessage = customMessage || autoMessage

  if (!finalMessage) return

  // 合并 Toast 配置
  const toastOptions: Record<string, unknown> = {
    title: finalMessage,
    color: type === 'success' ? 'success' : 'error',
    duration: type === 'success' ? 3000 : 5000,
    // 合并全局配置
    ...globalTypeConfig,
    // 合并端点配置
    ...endpointTypeConfig,
    // 合并请求配置
    ...(typeof requestToast === 'object' && typeof (requestToast as any)[type] === 'object'
      ? (requestToast as any)[type]
      : {})
  }

  // 移除内部控制属性
  delete toastOptions.show

  toast.add(toastOptions as ToastProps)
}

/**
 * 创建 API 响应处理器
 *
 * 用于 `useFetch` 的 `onResponse` 和 `transform` 钩子，提供：
 * - 自动 Toast 提示（基于业务状态码）
 * - 业务错误检查和抛出
 * - 自动数据解包（提取 `data` 字段）
 * - 自定义数据转换
 *
 * @param apiOptions - 请求级别的 API 配置
 * @param apiOptions.skipBusinessCheck - 是否跳过业务状态码检查
 * @param apiOptions.toast - Toast 配置或禁用
 * @param apiOptions.unwrap - 是否自动解包数据（默认 true）
 * @param apiOptions.transform - 自定义数据转换函数
 * @param endpointConfig - 端点配置（包含合并后的 auth/toast/success 配置）
 * @returns 包含 `onResponse` 和 `transform` 的处理器对象
 *
 * @example
 * ```ts
 * const handlers = createApiResponseHandler<User>(
 *   { unwrap: true, toast: { successMessage: '加载成功' } },
 *   {
 *     baseURL: '/api',
 *     auth: { enabled: true },
 *     toast: { enabled: true },
 *     success: { codeKey: 'code', successCodes: [200] }
 *   }
 * )
 *
 * // 在 useFetch 中使用
 * useFetch('/users', {
 *   onResponse: handlers.onResponse,
 *   transform: handlers.transform
 * })
 * ```
 */
export function createApiResponseHandler<T = unknown>(
  apiOptions: UseApiFetchOptions<T>['api'] = {},
  endpointConfig: ApiEndpointConfig & {
    auth: Partial<ApiAuthConfig>
    toast: Partial<ApiToastConfig>
    success: Partial<ApiSuccessConfig>
  }
): ApiResponseHandlers<T> {
  const { toast: toastConfig, success: successConfig } = endpointConfig

  return {
    /**
     * 响应拦截器：处理 Toast 显示
     */
    onResponse({ response }) {
      // 如果跳过业务检查，不处理 Toast
      if (apiOptions.skipBusinessCheck) return

      // 检查业务状态码
      const isSuccess = checkBusinessSuccess(response._data, successConfig)
      const type = isSuccess ? 'success' : 'error'

      // 显示 Toast
      showToast({
        type,
        response: response._data,
        apiOptions,
        globalConfig: toastConfig,
        endpointConfig: {}, // 端点配置已合并到 globalConfig
        successConfig
      })
    },

    /**
     * 数据转换器：检查业务错误 + 解包数据
     */
    transform(data) {
      // 检查业务状态码
      if (!apiOptions.skipBusinessCheck && !checkBusinessSuccess(data, successConfig)) {
        const errorMessage = extractMessage(data, successConfig)
        throw createApiError(data, errorMessage)
      }

      // 自定义转换（优先级最高）
      if (apiOptions.transform) {
        return apiOptions.transform(data)
      }

      // 解包数据
      if (apiOptions.unwrap !== false) {
        const dataKey = successConfig.dataKey || 'data'
        return (data[dataKey] ?? data.result ?? data) as T
      }

      return data as T
    }
  }
}
