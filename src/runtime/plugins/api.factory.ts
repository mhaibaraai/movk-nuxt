import type { $Fetch, FetchContext } from 'ofetch'
import type {
  ApiInstance,
  ApiResponse,
  ApiAuthConfig,
  ApiResponseConfig,
  ApiToastConfig,
  ApiFetchContext,
  ResolvedEndpointConfig,
  MovkApiPublicConfig,
  EndpointPrivateConfig
} from '../types/api'
import {
  getAuthHeaders
} from '../domains/api/auth'
import {
  extractData,
  extractMessage,
  isBusinessSuccess
} from '../domains/api/response'
import { createApiError } from '../domains/api/errors'
import { extractToastMessage, showToast } from '../domains/api/toast'
import { defineNuxtPlugin, navigateTo, useNuxtApp, useUserSession, useRuntimeConfig } from '#imports'
import defu from 'defu'

/**
 * 处理 401 未授权响应
 * @internal
 */
async function handleUnauthorized(
  config: ApiAuthConfig,
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
function getApiFetchContext(options: FetchContext['options']): ApiFetchContext {
  return options.context || {}
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
      if (authConfig.enabled) {
        const authHeaders = getAuthHeaders(authConfig)
        const headers = new Headers(context.options.headers as HeadersInit)
        for (const [key, value] of Object.entries(authHeaders)) {
          headers.set(key, value)
        }
        context.options.headers = headers
      }

      if (publicConfig.debug) {
        const h = context.options.headers
        const headersLog = h instanceof Headers
          ? Object.fromEntries(h.entries())
          : h
        console.info('[@movk/nuxt] Request:', {
          method: context.options.method || 'GET',
          url: `${resolvedConfig.baseURL}${context.request}`,
          headers: headersLog,
          body: context.options.body ? '(body present)' : undefined
        })
      }

      await nuxtApp.callHook('movk:api:request', context)
    },

    async onResponse(context) {
      const raw = context.response._data as ApiResponse
      const { toast, skipBusinessCheck } = getApiFetchContext(context.options)

      if (publicConfig.debug) {
        console.info('[@movk/nuxt] Response:', raw)
      }

      if (skipBusinessCheck || isBusinessSuccess(raw, responseConfig)) {
        context.response._data = extractData(raw, responseConfig)

        await nuxtApp.callHook('movk:api:response', context as FetchContext)

        if (import.meta.client) {
          const message = toast !== false
            ? extractToastMessage(toast, 'success', extractMessage(raw, responseConfig) || '')
            : undefined
          showToast('success', message, toast, toastConfig)
        }
      }
      else {
        await nuxtApp.callHook('movk:api:error', context as FetchContext)

        if (import.meta.client) {
          const message = extractMessage(raw, responseConfig)
          const errorMessage = toast !== false
            ? extractToastMessage(toast, 'error', message || '请求失败')
            : undefined
          showToast('error', errorMessage, toast, toastConfig)
        }

        throw createApiError(raw, extractMessage(raw, responseConfig))
      }
    },

    async onResponseError(context) {
      const { response } = context
      const { toast } = getApiFetchContext(context.options)

      if (response.status === 401) {
        const result = { handled: false }
        await nuxtApp.callHook('movk:api:unauthorized', context as FetchContext, result)
        if (!result.handled) {
          await handleUnauthorized(authConfig, nuxtApp)
        }
      }

      await nuxtApp.callHook('movk:api:error', context as FetchContext)

      if (import.meta.client) {
        const data = response._data as ApiResponse | undefined
        const message = data ? extractMessage(data, responseConfig) : undefined
        const errorMessage = toast !== false
          ? extractToastMessage(toast, 'error', message || `请求失败 (${response.status})`)
          : undefined
        showToast('error', errorMessage, toast, toastConfig)
      }

      if (publicConfig.debug) {
        console.error('[@movk/nuxt] Error:', response.status, response._data)
      }
    }
  }) as $Fetch
}

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()

  const publicConfig = runtimeConfig.public.movkApi
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
      console.warn(`[@movk/nuxt] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(publicConfig.defaultEndpoint || 'default')
    }

    const privateEndpointConfig = privateConfig?.endpoints?.[endpointName]

    const resolvedConfig: ResolvedEndpointConfig = {
      ...endpointConfig,
      headers: privateEndpointConfig?.headers,
      auth: defu(endpointConfig.auth, publicConfig.auth) as ApiAuthConfig,
      toast: defu(endpointConfig.toast, publicConfig.toast) as ApiToastConfig,
      response: defu(endpointConfig.response, publicConfig.response) as ApiResponseConfig
    }

    const $fetchInstance = createEndpointFetch(resolvedConfig, publicConfig, nuxtApp)

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
