import type { $Fetch } from 'ofetch'
import type {
  ApiInstance,
  ApiResponse,
  ApiFetchContext,
  ResolvedEndpointConfig,
  MovkApiPublicConfig,
  EndpointPrivateConfig
} from '../types/api'
import {
  showToast,
  isBusinessSuccess,
  extractMessage,
  extractData,
  createApiError,
  extractToastMessage,
  getAuthHeaders
} from '../utils/api-utils'
import { defineNuxtPlugin, navigateTo, useNuxtApp, useUserSession, useRuntimeConfig } from '#imports'
import defu from 'defu'

/**
 * 处理 401 未授权响应
 * @internal
 */
async function handleUnauthorized(
  config: ResolvedEndpointConfig['auth'],
  nuxtApp: ReturnType<typeof useNuxtApp>
): Promise<void> {
  const unauthorizedConfig = config.unauthorized
  if (!unauthorizedConfig) return

  if (unauthorizedConfig.clearSession) {
    try {
      const userSession = nuxtApp.vueApp.runWithContext(() => useUserSession())
      if (userSession?.clear) {
        await userSession.clear()
        await userSession.fetch()
      }
    }
    catch { /* session not available */ }
  }

  if (unauthorizedConfig.redirect) {
    const loginPath = unauthorizedConfig.loginPath || '/login'
    await nuxtApp.runWithContext(() => navigateTo(loginPath))
  }
}

/**
 * 从 Fetch 上下文中提取自定义 API 上下文
 * @internal
 */
function getApiFetchContext(options: Record<string, any>): ApiFetchContext {
  return (options as { context?: ApiFetchContext }).context || {}
}

/**
 * 为端点创建 $fetch 实例
 * @internal
 */
function createEndpointFetch(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  nuxtApp: ReturnType<typeof useNuxtApp>
): $Fetch {
  const { auth: authConfig, toast: toastConfig, response: responseConfig } = resolvedConfig

  return $fetch.create({
    baseURL: resolvedConfig.baseURL,
    headers: resolvedConfig.headers,

    async onRequest(context) {
      // 1. 认证 token 注入
      if (authConfig.enabled) {
        const authHeaders = getAuthHeaders({ auth: authConfig })
        const headers = new Headers(context.options.headers as HeadersInit)
        for (const [key, value] of Object.entries(authHeaders)) {
          headers.set(key, value)
        }
        context.options.headers = headers
      }

      // 2. Debug 日志
      if (publicConfig.debug) {
        console.log('[Movk API] Request:', {
          method: context.options.method || 'GET',
          url: `${resolvedConfig.baseURL}${context.request}`,
          body: context.options.body ? '(body present)' : undefined
        })
      }

      // 3. 触发 Nuxt hook
      await nuxtApp.callHook('movk:api:request', context)
    },

    async onResponse(context) {
      const raw = context.response._data as ApiResponse
      const { toast, skipBusinessCheck } = getApiFetchContext(context.options)

      // Debug 日志
      if (publicConfig.debug) {
        console.log('[Movk API] Response:', raw)
      }

      if (skipBusinessCheck || isBusinessSuccess(raw, responseConfig)) {
        // 业务成功：解包数据
        context.response._data = extractData(raw, responseConfig)

        // 触发 Nuxt hook（用户可在此修改/读取解包后的数据）
        await nuxtApp.callHook('movk:api:response', context as any)

        // 成功 Toast
        if (import.meta.client) {
          const message = toast !== false
            ? extractToastMessage(toast, 'success', extractMessage(raw, responseConfig) || '')
            : undefined
          showToast('success', message, toast, toastConfig)
        }
      }
      else {
        // 业务失败：触发 error hook
        await nuxtApp.callHook('movk:api:error', context as any)

        // 错误 Toast（先于 throw）
        if (import.meta.client) {
          const message = extractMessage(raw, responseConfig)
          const errorMessage = toast !== false
            ? extractToastMessage(toast, 'error', message || '请求失败')
            : undefined
          showToast('error', errorMessage, toast, toastConfig)
        }

        // 抛出业务错误 → useFetch 自动设置到 error.value
        throw createApiError(raw, extractMessage(raw, responseConfig))
      }
    },

    async onResponseError(context) {
      const { response } = context
      const { toast } = getApiFetchContext(context.options)

      // 401 专用处理
      if (response.status === 401) {
        const result = { handled: false }
        await nuxtApp.callHook('movk:api:unauthorized', context as any, result)
        if (!result.handled) {
          await handleUnauthorized(authConfig, nuxtApp)
        }
      }

      // 触发通用 error hook
      await nuxtApp.callHook('movk:api:error', context as any)

      // 错误 Toast
      if (import.meta.client) {
        const data = response._data as ApiResponse | undefined
        const message = data ? extractMessage(data, responseConfig) : undefined
        const errorMessage = toast !== false
          ? extractToastMessage(toast, 'error', message || `请求失败 (${response.status})`)
          : undefined
        showToast('error', errorMessage, toast, toastConfig)
      }

      // Debug 日志
      if (publicConfig.debug) {
        console.error('[Movk API] Error:', response.status, response._data)
      }
    }
  }) as $Fetch
}

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public.movkApi as MovkApiPublicConfig
  const privateConfig = import.meta.server
    ? (runtimeConfig.movkApi as { endpoints?: Record<string, EndpointPrivateConfig> } | undefined)
    : undefined

  const endpointCache = new Map<string, ApiInstance>()

  const getOrCreateEndpoint = (endpointName: string): ApiInstance => {
    if (endpointCache.has(endpointName)) {
      return endpointCache.get(endpointName)!
    }

    const endpoints = publicConfig.endpoints || {}
    const endpointConfig = endpoints[endpointName]

    if (!endpointConfig) {
      console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(publicConfig.defaultEndpoint || 'default')
    }

    const privateEndpointConfig = privateConfig?.endpoints?.[endpointName]

    const resolvedConfig: ResolvedEndpointConfig = {
      ...endpointConfig,
      headers: privateEndpointConfig?.headers,
      auth: defu(endpointConfig.auth, publicConfig.auth) as ResolvedEndpointConfig['auth'],
      toast: defu(endpointConfig.toast, publicConfig.toast) as ResolvedEndpointConfig['toast'],
      response: defu(endpointConfig.response, publicConfig.response) as ResolvedEndpointConfig['response']
    }

    const $fetchInstance = createEndpointFetch(resolvedConfig, publicConfig, nuxtApp)

    // 将 $fetch 实例扩展为 ApiInstance（附加 use() 方法）
    const apiInstance = Object.assign($fetchInstance, {
      use: (endpoint: string) => getOrCreateEndpoint(endpoint)
    }) as ApiInstance

    endpointCache.set(endpointName, apiInstance)
    return apiInstance
  }

  const defaultEndpoint = publicConfig.defaultEndpoint || 'default'
  const api = getOrCreateEndpoint(defaultEndpoint)

  return {
    provide: {
      api
    }
  }
})
