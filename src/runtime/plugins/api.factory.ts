import type { $Fetch } from 'ofetch'
import type {
  ApiInstance,
  UploadRequestOptions
} from '../types/api.d'
import type {
  ApiAuthConfig,
  ApiEndpointConfig,
  ApiResponseBase,
  ApiSuccessConfig,
  ApiToastConfig,
  MovkApiModuleOptions
} from '../schemas/api'
import { getPath, triggerDownload } from '@movk/core'
import { defineNuxtPlugin, useRuntimeConfig, navigateTo } from '#app'
import defu from 'defu'

// ==================== 工具函数 ====================

/**
 * 获取 nuxt-auth-utils 的 useUserSession
 */
const getUserSession = () => {
  try {
    // useUserSession 来自 nuxt-auth-utils，可能未安装
    return (globalThis as any).useUserSession?.()
  }
  catch {
    return null
  }
}

/**
 * 从 nuxt-auth-utils session 获取 Token
 */
function getTokenFromSession(authConfig: Partial<ApiAuthConfig>): string | null {
  const userSession = getUserSession()
  if (!userSession?.session?.value) return null

  const sessionData = userSession.session.value
  const tokenPath = authConfig.sessionTokenPath || 'secure.token'

  // 尝试从 session 或 secure 中获取 token
  const token = getPath(sessionData, tokenPath)
    ?? getPath(sessionData, 'token')
    ?? getPath(sessionData, 'secure.token')

  return token as string | null
}

/**
 * 获取认证 Token
 */
async function getAuthToken(authConfig: Partial<ApiAuthConfig>): Promise<string | null> {
  if (!authConfig.enabled) return null

  const tokenSource = authConfig.tokenSource || 'session'

  if (tokenSource === 'session') {
    return getTokenFromSession(authConfig)
  }

  // custom 模式 - 需要用户自行实现
  return null
}

/**
 * 处理 401 未授权错误
 */
async function handleUnauthorized(authConfig: Partial<ApiAuthConfig>, nuxtApp: any) {
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

// ==================== 主插件 ====================

/**
 * 创建 API 工厂插件
 * 提供 $api 实例,支持多端点、nuxt-auth-utils 认证等功能
 *
 * @see https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.movkApi as MovkApiModuleOptions

  if (!config.enabled) {
    return
  }

  // 端点实例缓存
  const endpointInstances = new Map<string, ApiInstance>()

  /**
   * 创建端点的 $fetch 实例
   */
  const createEndpointFetch = (endpointConfig: ApiEndpointConfig): ApiInstance => {
    // 合并配置(端点配置覆盖全局配置)
    const authConfig: Partial<ApiAuthConfig> = defu(endpointConfig.auth, config.auth)
    const toastConfig: Partial<ApiToastConfig> = defu(endpointConfig.toast, config.toast)
    const successConfig: Partial<ApiSuccessConfig> = defu(endpointConfig.success, config.success)

    /**
     * 核心 $fetch 实例
     * 处理认证、Debug、401 等通用逻辑
     */
    const $fetchInstance = $fetch.create({
      baseURL: endpointConfig.baseURL,
      headers: endpointConfig.headers,

      async onRequest({ options }) {
        // 添加认证 Header
        if (authConfig.enabled) {
          const token = await getAuthToken(authConfig)
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
          await handleUnauthorized(authConfig, nuxtApp)
        }

        // Debug 模式
        if (config.debug) {
          console.error('[Movk API] Error:', response.status, response._data)
        }
      }
    }) as $Fetch

    /**
     * 下载文件
     */
    const download = async (
      url: string,
      filename?: string,
      options: Record<string, unknown> = {}
    ): Promise<void> => {
      const blob = await $fetchInstance<Blob>(url, {
        ...options,
        method: 'GET',
        responseType: 'blob' as any
      })

      const finalFilename = filename || url.split('/').pop() || 'download'
      triggerDownload(new Blob([blob]), finalFilename)
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

      return $fetchInstance<ApiResponseBase<T>>(url, {
        ...options,
        method: 'POST',
        body: formData
      })
    }

    // 构建 API 实例
    const apiInstance: ApiInstance = {
      $fetch: $fetchInstance,

      use: (endpoint: string) => getOrCreateEndpoint(endpoint),

      download,

      upload,

      getConfig: () => ({
        ...endpointConfig,
        auth: authConfig,
        toast: toastConfig,
        success: successConfig
      })
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
    const endpoints = config.endpoints || {}
    const endpointConfig = endpoints[endpointName]

    if (!endpointConfig) {
      console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(config.defaultEndpoint || 'default')
    }

    // 创建实例
    const instance = createEndpointFetch(endpointConfig)
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
