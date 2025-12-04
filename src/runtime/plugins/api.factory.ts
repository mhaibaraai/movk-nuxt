import type { $Fetch } from 'ofetch'
import type {
  ApiEndpointsConfig,
  ApiInstance,
  RequestOptionsWithTransform,
  UploadRequestOptions
} from '../types/api.d'
import type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions,
  RequestToastOptions
} from '../schemas/api'
import { defineNuxtPlugin, useRuntimeConfig, navigateTo } from '#app'

/**
 * 从对象路径获取值
 * @example getValueByPath({ a: { b: 'value' } }, 'a.b') => 'value'
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

/**
 * 创建 API 工厂插件
 * 提供 $api 实例，支持多端点、nuxt-auth-utils 认证、Toast 等功能
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.movkApi as MovkApiModuleOptions

  if (!config.enabled) {
    return
  }

  // 端点实例缓存
  const endpointInstances = new Map<string, ApiInstance>()

  /**
   * 获取 Toast 实例
   */
  const getToast = () => {
    try {
      // @ts-expect-error - useToast 来自 @nuxt/ui
      return useToast?.()
    }
    catch {
      return null
    }
  }

  /**
   * 获取 nuxt-auth-utils 的 useUserSession
   */
  const getUserSession = () => {
    try {
      // @ts-expect-error - useUserSession 来自 nuxt-auth-utils
      return useUserSession?.()
    }
    catch {
      return null
    }
  }

  /**
   * 判断响应是否成功
   */
  const isSuccessResponse = (
    response: ApiResponseBase<unknown>,
    successConfig: Partial<ApiSuccessConfig> = {}
  ): boolean => {
    const merged = {
      successCodes: [200, 0],
      codeKey: 'code',
      ...config.success,
      ...successConfig
    }

    const code = response[merged.codeKey]
    return merged.successCodes.includes(code as number | string)
  }

  /**
   * 从响应中提取消息
   */
  const extractMessage = (
    response: ApiResponseBase<unknown>,
    toastConfig: Partial<ApiToastConfig> = {}
  ): string | undefined => {
    const messageKey = config.success?.messageKey || toastConfig.success?.color || 'msg'
    return (response[messageKey] as string)
      || response.message
      || response.msg
  }

  /**
   * 显示 Toast 提示
   */
  const showToast = (
    type: 'success' | 'error',
    message: string | undefined,
    requestToast: RequestToastOptions | false | undefined,
    endpointToast: Partial<ApiToastConfig> = {}
  ) => {
    // 全局禁用
    if (!config.toast?.enabled) return
    // 端点禁用
    if (endpointToast.enabled === false) return
    // 请求禁用
    if (requestToast === false) return

    const toast = getToast()
    if (!toast) return

    const globalTypeConfig = config.toast?.[type]
    const endpointTypeConfig = endpointToast[type]
    const requestTypeConfig = requestToast?.[type]

    // 检查是否显示
    if (globalTypeConfig?.show === false) return
    if (endpointTypeConfig?.show === false) return
    if (requestTypeConfig === false) return

    // 获取自定义消息
    const customMessage = type === 'success'
      ? requestToast?.successMessage
      : requestToast?.errorMessage

    const finalMessage = customMessage || message
    if (!finalMessage) return

    // 合并 Toast 配置
    const toastProps = {
      color: type === 'success' ? 'success' as const : 'error' as const,
      title: finalMessage,
      duration: type === 'success' ? 3000 : 5000,
      ...globalTypeConfig,
      ...endpointTypeConfig,
      ...(typeof requestTypeConfig === 'object' ? requestTypeConfig : {})
    }

    toast.add(toastProps)
  }

  /**
   * 创建端点的 $fetch 实例
   */
  const createEndpointFetch = (
    endpointName: string,
    endpointConfig: ApiEndpointConfig
  ): ApiInstance => {
    const authConfig: Partial<ApiAuthConfig> = {
      ...config.auth,
      ...endpointConfig.auth
    }

    const toastConfig: Partial<ApiToastConfig> = {
      ...config.toast,
      ...endpointConfig.toast
    }

    const successConfig: Partial<ApiSuccessConfig> = {
      ...config.success,
      ...endpointConfig.success
    }

    /**
     * 从 nuxt-auth-utils session 获取 Token
     */
    const getTokenFromSession = (): string | null => {
      const userSession = getUserSession()
      if (!userSession?.session?.value) return null

      const sessionData = userSession.session.value
      const tokenPath = authConfig.sessionTokenPath || 'secure.token'

      // 尝试从 session 或 secure 中获取 token
      const token = getValueByPath(sessionData as Record<string, unknown>, tokenPath)
        || getValueByPath(sessionData as Record<string, unknown>, 'token')
        || (sessionData as { secure?: { token?: string } }).secure?.token

      return token as string | null
    }

    /**
     * 获取认证 Token
     */
    const getAuthToken = async (skipAuth?: boolean): Promise<string | null> => {
      if (!authConfig.enabled || skipAuth) return null

      const tokenSource = authConfig.tokenSource || 'session'

      if (tokenSource === 'session') {
        return getTokenFromSession()
      }

      // custom 模式 - 需要用户自行实现
      return null
    }

    /**
     * 处理 401 未授权错误
     */
    const handleUnauthorized = async () => {
      const userSession = getUserSession()

      // 清除 session
      if (authConfig.clearSessionOnUnauthorized && userSession?.clear) {
        await userSession.clear()
      }

      // 跳转登录页
      if (authConfig.redirectOnUnauthorized) {
        const loginPath = authConfig.loginPath || '/login'
        await nuxtApp.runWithContext(() => navigateTo(loginPath))
      }
    }

    /**
     * 核心 $fetch 实例
     */
    const baseFetch = $fetch.create({
      baseURL: endpointConfig.baseURL,
      timeout: endpointConfig.timeout,
      headers: endpointConfig.headers,

      async onRequest({ options }) {
        // 检查是否跳过认证 (通过 meta 传递)
        const skipAuth = (options as { _skipAuth?: boolean })._skipAuth

        // 添加认证 Header
        if (authConfig.enabled && !skipAuth) {
          const token = await getAuthToken(skipAuth)
          if (token) {
            const headerName = authConfig.headerName || 'Authorization'
            const tokenType = authConfig.tokenType === 'Custom'
              ? (authConfig.customTokenType || '')
              : (authConfig.tokenType || 'Bearer')

            options.headers = options.headers || new Headers()
            if (options.headers instanceof Headers) {
              options.headers.set(headerName, tokenType ? `${tokenType} ${token}` : token)
            }
            else {
              (options.headers as Record<string, string>)[headerName] = tokenType ? `${tokenType} ${token}` : token
            }
          }
        }

        // Debug 模式
        if (config.debug) {
          console.log(`[Movk API] Request: ${options.method || 'GET'} ${endpointConfig.baseURL}${String(options.baseURL || '')}`)
        }
      },

      async onResponse({ response }) {
        // Debug 模式
        if (config.debug) {
          console.log('[Movk API] Response:', response._data)
        }
      },

      async onResponseError({ response }) {
        // 401 认证错误处理
        if (response.status === 401) {
          await handleUnauthorized()
        }

        // Debug 模式
        if (config.debug) {
          console.error('[Movk API] Error:', response.status, response._data)
        }
      }
    }) as $Fetch

    /**
     * 创建 API 错误
     */
    const createApiError = (response: ApiResponseBase<unknown>, message?: string) => {
      const error = new Error(message || '请求失败') as Error & {
        statusCode: number
        response: ApiResponseBase<unknown>
        isBusinessError: boolean
        isNetworkError: boolean
        isAuthError: boolean
      }
      error.statusCode = Number(response.code || response.status || 500)
      error.response = response
      error.isBusinessError = true
      error.isNetworkError = false
      error.isAuthError = error.statusCode === 401
      return error
    }

    /**
     * 包装请求方法，添加 Toast 和数据解包
     */
    const wrapRequest = async <T>(
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      url: string,
      body?: unknown,
      requestOptions: RequestOptionsWithTransform<T> = {}
    ): Promise<T> => {
      const fetchOptions: Record<string, unknown> = {
        method,
        body,
        timeout: requestOptions.timeout,
        retry: requestOptions.retry,
        // 传递 skipAuth 标志
        _skipAuth: requestOptions.auth === false
      }

      try {
        const response = await baseFetch<ApiResponseBase<T>>(url, fetchOptions)

        // 检查业务状态码
        if (!isSuccessResponse(response, successConfig)) {
          const errorMessage = extractMessage(response, toastConfig)
          showToast('error', errorMessage, requestOptions.toast, toastConfig)
          throw createApiError(response, errorMessage)
        }

        // 显示成功提示
        const successMessage = extractMessage(response, toastConfig)
        showToast('success', successMessage, requestOptions.toast, toastConfig)

        // 数据转换
        if (requestOptions.transform) {
          return requestOptions.transform(response)
        }

        // 解包数据
        if (requestOptions.unwrap !== false) {
          const dataKey = successConfig.dataKey || 'data'
          return (response[dataKey] ?? response.result ?? response) as T
        }

        return response as unknown as T
      }
      catch (error: unknown) {
        // 已处理的 API 错误
        if (error && typeof error === 'object' && 'isBusinessError' in error) {
          throw error
        }

        const fetchError = error as { data?: ApiResponseBase<unknown>, statusCode?: number, message?: string }
        const errorMessage = fetchError.data
          ? extractMessage(fetchError.data, toastConfig)
          : fetchError.message || '网络请求失败'

        showToast('error', errorMessage, requestOptions.toast, toastConfig)
        throw error
      }
    }

    /**
     * 下载文件
     */
    const download = async (
      url: string,
      options: RequestOptionsWithTransform = {},
      filename?: string
    ): Promise<void> => {
      const response = await baseFetch(url, {
        method: 'GET',
        responseType: 'blob',
        timeout: options.timeout,
        _skipAuth: options.auth === false
      } as Record<string, unknown>) as Blob

      // 创建下载链接
      const blob = new Blob([response])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || getFilenameFromUrl(url)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      // 显示成功提示
      showToast('success', '下载成功', options.toast, toastConfig)
    }

    /**
     * 从 URL 获取文件名
     */
    const getFilenameFromUrl = (url: string): string => {
      const parts = url.split('/')
      return parts[parts.length - 1] || 'download'
    }

    /**
     * 上传文件
     */
    const upload = async <T>(
      url: string,
      file: File | FormData,
      options: UploadRequestOptions<T> = {}
    ): Promise<ApiResponseBase<T>> => {
      let formData: FormData

      if (file instanceof FormData) {
        formData = file
      }
      else {
        formData = new FormData()
        formData.append(options.fieldName || 'file', file)
      }

      const response = await baseFetch<ApiResponseBase<T>>(url, {
        method: 'POST',
        body: formData,
        timeout: options.timeout,
        _skipAuth: options.auth === false
      } as Record<string, unknown>)

      // 检查业务状态码
      if (!isSuccessResponse(response, successConfig)) {
        const errorMessage = extractMessage(response, toastConfig)
        showToast('error', errorMessage, options.toast, toastConfig)
        throw createApiError(response, errorMessage)
      }

      // 显示成功提示
      const successMessage = extractMessage(response, toastConfig)
      showToast('success', successMessage, options.toast, toastConfig)

      return response
    }

    // 构建 API 实例
    const apiInstance: ApiInstance = {
      raw: baseFetch,

      get: <T>(url: string, options?: RequestOptionsWithTransform<T>) =>
        wrapRequest<T>('GET', url, undefined, options),

      post: <T>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) =>
        wrapRequest<T>('POST', url, body, options),

      put: <T>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) =>
        wrapRequest<T>('PUT', url, body, options),

      patch: <T>(url: string, body?: unknown, options?: RequestOptionsWithTransform<T>) =>
        wrapRequest<T>('PATCH', url, body, options),

      delete: <T>(url: string, options?: RequestOptionsWithTransform<T>) =>
        wrapRequest<T>('DELETE', url, undefined, options),

      download,
      upload,

      use: (endpoint: string) => getOrCreateEndpoint(endpoint),

      getConfig: () => endpointConfig
    }

    return apiInstance
  }

  /**
   * 获取或创建端点实例
   */
  const getOrCreateEndpoint = (endpointName: string): ApiInstance => {
    // 检查缓存
    if (endpointInstances.has(endpointName)) {
      return endpointInstances.get(endpointName)!
    }

    // 获取端点配置
    const endpoints = config.endpoints as ApiEndpointsConfig || {}
    const endpointConfig = endpoints[endpointName]

    if (!endpointConfig) {
      console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(config.defaultEndpoint || 'default')
    }

    // 创建实例
    const instance = createEndpointFetch(endpointName, endpointConfig)
    endpointInstances.set(endpointName, instance)

    return instance
  }

  // 创建默认端点实例
  const defaultEndpoint = config.defaultEndpoint || 'default'
  const api = getOrCreateEndpoint(defaultEndpoint)

  return {
    provide: {
      api
    }
  }
})
