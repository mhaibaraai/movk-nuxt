import type { ApiInstance, ApiStreamOptions } from '../types/api'
import type { EndpointPrivateConfig } from '../types/api/module'
import { resolveEndpointConfig } from '../domains/api/endpoint-config'
import { createApiClient } from '../domains/api/client'
import { openEventStream } from '../domains/api/stream'
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#imports'

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

    const config = resolveEndpointConfig(publicConfig, endpointName, privateEndpoints)
    const client = createApiClient({ endpoint: endpointName, config, publicConfig, nuxtApp })

    const apiInstance = Object.assign(client, {
      use: (endpoint: string) => getOrCreateEndpoint(endpoint),
      stream: <T>(url: string, options?: ApiStreamOptions<T>) => openEventStream<T>(client, url, options)
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
