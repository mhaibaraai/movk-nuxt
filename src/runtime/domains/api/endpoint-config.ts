import type { MovkApiPublicConfig, ResolvedEndpointConfig } from '../../types/api'
import defu from 'defu'

export function resolveEndpointConfig(
  publicConfig: MovkApiPublicConfig,
  endpoint?: string
): Pick<ResolvedEndpointConfig, 'baseURL' | 'auth' | 'toast' | 'response'> {
  const endpointName = endpoint || publicConfig.defaultEndpoint || 'default'
  const endpointConfig = publicConfig.endpoints[endpointName]
  if (!endpointConfig) {
    console.warn(`[Movk API] Endpoint "${endpointName}" not found, using default`)
    return resolveEndpointConfig(publicConfig, publicConfig.defaultEndpoint || 'default')
  }

  return {
    baseURL: endpointConfig.baseURL || '',
    auth: defu(endpointConfig.auth, publicConfig.auth) as ResolvedEndpointConfig['auth'],
    toast: defu(endpointConfig.toast, publicConfig.toast) as ResolvedEndpointConfig['toast'],
    response: defu(endpointConfig.response, publicConfig.response) as ResolvedEndpointConfig['response']
  }
}
