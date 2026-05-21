import type { $Fetch } from 'nitropack/types'
import type { ApiInstance, MovkApiPublicConfig } from '../types/api'
import type { EndpointPrivateConfig, ResolvedEndpointConfig } from '../types/api/module'
import { resolveEndpointConfig } from '../domains/api/endpoint-config'
import { createOnRequest } from '../domains/api/interceptors/request'
import { createOnResponse } from '../domains/api/interceptors/response'
import { createOnResponseError } from '../domains/api/interceptors/error'
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#imports'

type NuxtApp = ReturnType<typeof useNuxtApp>

/**
 * 为指定端点构建 $fetch 实例
 *
 * @description 三段拦截器各自由独立工厂构造，本函数仅做组装：依赖单一职责、便于单测
 */
function createEndpointFetch(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  nuxtApp: NuxtApp
): $Fetch {
  return $fetch.create({
    baseURL: resolvedConfig.baseURL,
    headers: resolvedConfig.headers,
    onRequest: createOnRequest(resolvedConfig, publicConfig, nuxtApp),
    onResponse: createOnResponse(resolvedConfig, publicConfig, nuxtApp),
    onResponseError: createOnResponseError(resolvedConfig, publicConfig, nuxtApp)
  })
}

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()

  const publicConfig = runtimeConfig.public.movkApi
  const privateEndpoints = import.meta.server
    ? (runtimeConfig.movkApi as { endpoints?: Record<string, EndpointPrivateConfig> } | undefined)?.endpoints
    : undefined

  const endpointCache = new Map<string, ApiInstance>()

  const defaultEndpoint = publicConfig.defaultEndpoint || 'default'

  const getOrCreateEndpoint = (endpointName: string): ApiInstance => {
    const cached = endpointCache.get(endpointName)
    if (cached) return cached

    // 端点不存在时回落到 default：复用 default 的缓存实例而非以错误名缓存
    if (!publicConfig.endpoints?.[endpointName] && endpointName !== defaultEndpoint) {
      console.warn(`[@movk/nuxt] Endpoint "${endpointName}" not found, using default`)
      return getOrCreateEndpoint(defaultEndpoint)
    }

    const resolved = resolveEndpointConfig(publicConfig, endpointName, privateEndpoints)
    const $fetchInstance = createEndpointFetch(resolved, publicConfig, nuxtApp)

    const apiInstance = Object.assign($fetchInstance, {
      use: (endpoint: string) => getOrCreateEndpoint(endpoint)
    }) as ApiInstance

    endpointCache.set(endpointName, apiInstance)
    return apiInstance
  }

  const api = getOrCreateEndpoint(defaultEndpoint)

  return {
    provide: {
      api
    }
  }
})
