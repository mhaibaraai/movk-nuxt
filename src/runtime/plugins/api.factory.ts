import type { $Fetch, FetchOptions } from 'ofetch'
import type {
  ApiClient,
  ApiModuleConfig,
  ApiResponse,
  AuthConfig,
  EndpointConfig,
  ResolvedEndpointConfig,
  SuccessConfig,
  ToastConfig,
  UploadOptions
} from '../types/api'
import { getPath, triggerDownload } from '@movk/core'
import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useNuxtApp, useUserSession } from '#imports'
import defu from 'defu'

// ==================== Session 工具 ====================

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
 *
 * 从 session 公开数据中获取 token，客户端和服务端都可访问
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
function buildAuthHeader(token: string, config: Partial<AuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

/**
 * 处理 401 未授权
 */
async function handleUnauthorized(config: Partial<AuthConfig>, nuxtApp: ReturnType<typeof useNuxtApp>): Promise<void> {
  const userSession = getUserSession()

  // 清除 session
  if (config.clearSessionOnUnauthorized && userSession?.clear) {
    await userSession.clear()
  }

  // 跳转登录页
  if (config.redirectOnUnauthorized) {
    const loginPath = config.loginPath || '/login'
    await nuxtApp.runWithContext(() => navigateTo(loginPath))
  }
}

// ==================== API Client 工厂 ====================

/**
 * 创建 API Client
 */
function createApiClient(
  endpointConfig: EndpointConfig,
  resolvedConfig: ResolvedEndpointConfig,
  moduleConfig: ApiModuleConfig,
  nuxtApp: ReturnType<typeof useNuxtApp>,
  getOrCreateEndpoint: (name: string) => ApiClient
): ApiClient {
  const { auth: authConfig } = resolvedConfig

  // 创建 $fetch 实例
  const $fetchInstance = $fetch.create({
    baseURL: endpointConfig.baseURL,
    headers: endpointConfig.headers,

    onRequest({ options }) {
      // 添加认证 Header
      if (authConfig.enabled) {
        const tokenPath = authConfig.sessionTokenPath || 'token'
        const token = getTokenFromSession(tokenPath)

        if (token) {
          const headerName = authConfig.headerName || 'Authorization'
          const headerValue = buildAuthHeader(token, authConfig)

          options.headers = options.headers || new Headers()
          if (options.headers instanceof Headers) {
            options.headers.set(headerName, headerValue)
          }
          else {
            (options.headers as Record<string, string>)[headerName] = headerValue
          }
        }
      }

      // Debug
      if (moduleConfig.debug) {
        console.log(`[Movk API] Request: ${options.method || 'GET'} ${endpointConfig.baseURL}${String(options.baseURL || '')}`)
      }
    },

    async onResponse({ response }) {
      if (moduleConfig.debug) {
        console.log('[Movk API] Response:', response._data)
      }
    },

    async onResponseError({ response }) {
      // 401 处理
      if (response.status === 401) {
        await handleUnauthorized(authConfig, nuxtApp)
      }

      if (moduleConfig.debug) {
        console.error('[Movk API] Error:', response.status, response._data)
      }
    }
  }) as $Fetch

  // 下载方法
  const download = async (
    url: string,
    filename?: string,
    options?: FetchOptions
  ): Promise<void> => {
    const blob = await $fetchInstance<Blob>(url, {
      ...options,
      method: 'GET',
      responseType: 'blob' as 'json'
    })

    const finalFilename = filename || url.split('/').pop() || 'download'
    triggerDownload(new Blob([blob]), finalFilename)
  }

  // 上传方法
  const upload = async <T>(
    url: string,
    file: File | FormData,
    options: UploadOptions = {}
  ): Promise<ApiResponse<T>> => {
    const formData = file instanceof FormData
      ? file
      : (() => {
          const fd = new FormData()
          fd.append(options.fieldName || 'file', file)
          return fd
        })()

    return $fetchInstance<ApiResponse<T>>(url, {
      ...options,
      method: 'POST',
      body: formData
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

// ==================== 插件入口 ====================

export default defineNuxtPlugin((nuxtApp) => {
  const moduleConfig = useRuntimeConfig().public.movkApi as ApiModuleConfig

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
      auth: defu(endpointConfig.auth, moduleConfig.auth) as Partial<AuthConfig>,
      toast: defu(endpointConfig.toast, moduleConfig.toast) as Partial<ToastConfig>,
      success: defu(endpointConfig.success, moduleConfig.success) as Partial<SuccessConfig>
    }

    // 创建实例
    const client = createApiClient(
      endpointConfig,
      resolvedConfig,
      moduleConfig,
      nuxtApp as any,
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
