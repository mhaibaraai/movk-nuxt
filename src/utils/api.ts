import defu from 'defu'
import type {
  ApiAuthConfig,
  ApiEndpointPublicConfig,
  ApiResponseConfig,
  ApiToastConfig,
  EndpointPrivateConfig,
  MovkApiFullConfig
} from '../runtime/types/api'

const DEFAULT_RESPONSE_CONFIG = {
  successCodes: [200, 0, '200', '0'] as (number | string)[],
  codeKey: 'code',
  messageKey: 'message',
  dataKey: 'data'
} satisfies ApiResponseConfig

const DEFAULT_AUTH_CONFIG = {
  enabled: false,
  tokenSource: 'session',
  sessionTokenPath: 'token',
  tokenType: 'Bearer',
  headerName: 'Authorization',
  unauthorized: {
    redirect: true,
    clearSession: true,
    loginPath: '/login'
  }
} satisfies ApiAuthConfig

const DEFAULT_TOAST_CONFIG = {
  enabled: true,
  success: {
    show: true,
    color: 'success',
    duration: 3000
  },
  error: {
    show: true,
    color: 'error',
    duration: 3000
  }
} satisfies ApiToastConfig

export function buildApiRuntimeConfig(apiConfig: MovkApiFullConfig) {
  const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
  const privateEndpoints: Record<string, EndpointPrivateConfig> = {}

  if (apiConfig.endpoints) {
    for (const [key, { headers, ...rest }] of Object.entries(apiConfig.endpoints)) {
      publicEndpoints[key] = rest as ApiEndpointPublicConfig
      if (headers) privateEndpoints[key] = { headers }
    }
  }

  const endpoints = { default: { baseURL: '/api' }, ...publicEndpoints }

  const publicConfig = {
    defaultEndpoint: apiConfig.defaultEndpoint ?? 'default',
    debug: apiConfig.debug ?? false,
    endpoints,
    response: defu(apiConfig.response, DEFAULT_RESPONSE_CONFIG),
    auth: defu(apiConfig.auth, DEFAULT_AUTH_CONFIG),
    toast: defu(apiConfig.toast, DEFAULT_TOAST_CONFIG)
  }

  const privateConfig = {
    endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
  }

  return { publicConfig, privateConfig }
}
