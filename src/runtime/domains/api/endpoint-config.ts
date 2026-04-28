import defu from 'defu'
import type { ApiAuthConfig, ApiResponseConfig, ApiToastConfig, MovkApiPublicConfig, ResolvedEndpointConfig } from '../../types/api'

export function resolveEndpointConfig(
  publicConfig: MovkApiPublicConfig,
  endpoint?: string
): Pick<ResolvedEndpointConfig, 'baseURL' | 'auth' | 'toast' | 'response'> {
  const endpointName = endpoint || publicConfig.defaultEndpoint || 'default'
  const endpointConfig = publicConfig.endpoints?.[endpointName]
  if (!endpointConfig) {
    console.warn(`[@movk/nuxt] Endpoint "${endpointName}" not found, using default`)
    return resolveEndpointConfig(publicConfig, publicConfig.defaultEndpoint || 'default')
  }

  return {
    baseURL: endpointConfig.baseURL || '',
    auth: defu(endpointConfig.auth, publicConfig.auth) as ApiAuthConfig,
    toast: defu(endpointConfig.toast, publicConfig.toast) as ApiToastConfig,
    response: defu(endpointConfig.response, publicConfig.response) as ApiResponseConfig
  }
}
