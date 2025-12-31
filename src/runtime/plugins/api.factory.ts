import type { $Fetch, FetchHooks, FetchResponse, FetchContext } from 'ofetch'
import type {
  ApiClient,
  MovkApiModuleOptions,
  ApiResponse,
  ApiAuthConfig,
  ResolvedEndpointConfig,
  UploadOptions,
  DownloadOptions,
  ApiFetchContext
} from '../types/api'
import { getPath, triggerDownload, extractFilename } from '@movk/core'
import {
  showToast,
  isBusinessSuccess,
  extractMessage,
  extractToastMessage
} from '../utils/api-utils'
import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useNuxtApp, useUserSession } from '#imports'
import defu from 'defu'

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
function buildAuthHeader(token: string, config: Partial<ApiAuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

/**
 * 处理 401 未授权
 */
async function handleUnauthorized(config: Partial<ApiAuthConfig>): Promise<void> {
  const userSession = getUserSession()

  // 清除 session
  if (config.clearSessionOnUnauthorized && userSession?.clear) {
    await userSession.clear()
  }

  // 跳转登录页
  if (config.redirectOnUnauthorized) {
    const loginPath = config.loginPath || '/login'
    const nuxtApp = useNuxtApp()
    await nuxtApp.runWithContext(() => navigateTo(loginPath))
  }
}

/**
 * 从请求上下文中获取 ApiFetchContext
 */
function getApiFetchContext(context: FetchContext): ApiFetchContext {
  return (context.options as { context?: ApiFetchContext }).context || {}
}

/**
 * 创建内置钩子集合
 *
 * 处理：
 * - 认证 Token 注入
 * - 401 未授权处理
 * - Toast 提示（业务成功/失败、网络错误）
 * - 调试日志
 */
function createBuiltinHooks(
  resolvedConfig: ResolvedEndpointConfig,
  moduleConfig: MovkApiModuleOptions
): FetchHooks {
  const { auth: authConfig, toast: toastConfig, success: successConfig } = resolvedConfig

  return {
    onRequest(context) {
      // 认证 Token 注入
      if (authConfig.enabled) {
        const tokenPath = authConfig.sessionTokenPath || 'token'
        const token = getTokenFromSession(tokenPath)

        if (token) {
          const headerName = authConfig.headerName || 'Authorization'
          const headerValue = buildAuthHeader(token, authConfig)

          context.options.headers = context.options.headers || new Headers()
          if (context.options.headers instanceof Headers) {
            context.options.headers.set(headerName, headerValue)
          }
          else {
            (context.options.headers as Record<string, string>)[headerName] = headerValue
          }
        }
      }

      if (moduleConfig.debug) {
        console.log(`[Movk API] Request: ${context.options.method || 'GET'} ${resolvedConfig.baseURL}${context.request}`)
      }
    },

    async onRequestError({ error }) {
      if (moduleConfig.debug) {
        console.error('[Movk API] Request Error:', error)
      }
    },

    async onResponse(context) {
      const response = context.response
      const data = response._data as ApiResponse

      if (moduleConfig.debug) {
        console.log('[Movk API] Response:', data)
      }

      // 客户端显示 Toast
      if (!import.meta.client) return

      const { toast, skipBusinessCheck } = getApiFetchContext(context)
      const isSuccess = skipBusinessCheck || isBusinessSuccess(data, successConfig)
      const message = extractMessage(data, successConfig)

      if (isSuccess) {
        const successMessage = toast !== false ? (toast?.successMessage || message) : undefined
        showToast('success', successMessage, toast, toastConfig)
      }
    },

    async onResponseError(context) {
      const { response } = context

      // 401 未授权处理
      if (response.status === 401) {
        await handleUnauthorized(authConfig)
      }

      if (moduleConfig.debug) {
        console.error('[Movk API] Error:', response.status, response._data)
      }

      // 客户端显示网络错误 Toast
      if (!import.meta.client) return

      const { toast } = getApiFetchContext(context)
      const data = response._data as ApiResponse | undefined
      const message = data ? extractMessage(data, successConfig) : undefined
      const errorMessage = toast !== false
        ? (toast?.errorMessage || message || `请求失败 (${response.status})`)
        : undefined

      showToast('error', errorMessage, toast, toastConfig)
    }
  } as FetchHooks
}

/**
 * 创建 API Client
 */
function createApiClient(
  resolvedConfig: ResolvedEndpointConfig,
  moduleConfig: MovkApiModuleOptions,
  getOrCreateEndpoint: (name: string) => ApiClient
): ApiClient {
  const builtinHooks = createBuiltinHooks(resolvedConfig, moduleConfig)
  resolvedConfig.builtinHooks = builtinHooks

  const $fetchInstance = $fetch.create({
    baseURL: resolvedConfig.baseURL,
    headers: resolvedConfig.headers,
    onRequest: builtinHooks.onRequest,
    onRequestError: builtinHooks.onRequestError,
    onResponse: builtinHooks.onResponse,
    onResponseError: builtinHooks.onResponseError
  }) as $Fetch

  // 下载方法（blob 响应，需单独处理 Toast）
  const download = async (
    url: string,
    filename?: string,
    options: DownloadOptions = {}
  ): Promise<void> => {
    const { toast, ...fetchOptions } = options

    // 通过 context 传递 toast 配置，让 onResponseError 处理网络错误
    const response = await $fetchInstance.raw<Blob>(url, {
      ...fetchOptions,
      method: 'GET',
      responseType: 'blob' as any,
      context: { toast }
    }) as FetchResponse<Blob>

    if (!response._data) {
      throw new Error('下载失败: 未接收到数据')
    }

    const finalFilename = filename || extractFilename(response.headers, url.split('/').pop() || 'download')
    triggerDownload(response._data, finalFilename)

    // 下载成功提示（blob 响应无业务状态码，需手动提示）
    if (import.meta.client && toast !== false) {
      const message = extractToastMessage(toast, 'success', `下载成功: ${finalFilename}`)
      showToast('success', message, toast, resolvedConfig.toast)
    }
  }

  // 上传方法（通过 context 传递 toast，内置 hooks 处理提示）
  const upload = async <T>(
    url: string,
    file: File | File[] | FormData,
    options: UploadOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { toast, fieldName = 'file', ...fetchOptions } = options

    // 构建 FormData
    const formData = file instanceof FormData
      ? file
      : (() => {
          const fd = new FormData()
          const files = Array.isArray(file) ? file : [file]
          files.forEach(f => fd.append(fieldName, f))
          return fd
        })()

    // 通过 context 传递配置，内置 hooks 处理业务状态码和 Toast

    return $fetchInstance<ApiResponse<T>>(url, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      context: { toast }
    })
  }

  return {
    $fetch: $fetchInstance,
    use: (endpoint: string) => getOrCreateEndpoint(endpoint),
    download,
    upload,
    getConfig: () => resolvedConfig
  }
}

export default defineNuxtPlugin(() => {
  const moduleConfig = useRuntimeConfig().public.movkApi as MovkApiModuleOptions

  if (!moduleConfig.enabled) {
    return
  }

  // 端点实例缓存
  const endpointCache = new Map<string, ApiClient>()

  /**
   * 获取或创建端点实例
   */
  const getOrCreateEndpoint = (endpointName: string): ApiClient => {
    // 缓存命中
    if (endpointCache.has(endpointName)) {
      return endpointCache.get(endpointName)!
    }

    // 获取端点配置
    const endpoints = moduleConfig.endpoints || {}
    const endpointConfig = endpoints[endpointName]

    if (!endpointConfig) {
      console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(moduleConfig.defaultEndpoint || 'default')
    }

    // 合并配置
    const resolvedConfig: ResolvedEndpointConfig = {
      ...endpointConfig,
      auth: defu(endpointConfig.auth, moduleConfig.auth) as ResolvedEndpointConfig['auth'],
      toast: defu(endpointConfig.toast, moduleConfig.toast) as ResolvedEndpointConfig['toast'],
      success: defu(endpointConfig.success, moduleConfig.success) as ResolvedEndpointConfig['success']
    }

    // 创建实例
    const client = createApiClient(
      resolvedConfig,
      moduleConfig,
      getOrCreateEndpoint
    )

    endpointCache.set(endpointName, client)
    return client
  }

  // 创建默认端点
  const defaultEndpoint = moduleConfig.defaultEndpoint || 'default'
  const api = getOrCreateEndpoint(defaultEndpoint)

  return {
    provide: { api }
  }
})
