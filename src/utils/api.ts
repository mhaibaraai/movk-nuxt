import type {
  ApiAuthConfig, ApiEndpointPublicConfig, ApiResponseConfig, ApiToastConfig, EndpointPrivateConfig, MovkApiFullConfig, MovkApiPublicConfig } from '../runtime/types/api'
import defu from 'defu'

const DEFAULT_RESPONSE_CONFIG: ApiResponseConfig = {
  successCodes: [200, 0],
  codeKey: 'code',
  messageKey: 'message',
  dataKey: 'data'
}

const DEFAULT_AUTH_CONFIG: ApiAuthConfig = {
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
}

const DEFAULT_TOAST_CONFIG: ApiToastConfig = {
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
}

const DEFAULT_ENDPOINT = { default: { baseURL: '/api' } }

export function buildApiRuntimeConfig(apiConfig: MovkApiFullConfig) {
  const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
  const privateEndpoints: Record<string, EndpointPrivateConfig> = {}

  if (apiConfig.endpoints) {
    for (const [key, { headers, ...rest }] of Object.entries(apiConfig.endpoints)) {
      publicEndpoints[key] = rest as ApiEndpointPublicConfig
      if (headers) privateEndpoints[key] = { headers }
    }
  }

  const hasEndpoints = Object.keys(publicEndpoints).length > 0

  const publicConfig: MovkApiPublicConfig = {
    defaultEndpoint: apiConfig.defaultEndpoint ?? 'default',
    debug: apiConfig.debug ?? false,
    endpoints: hasEndpoints ? publicEndpoints : DEFAULT_ENDPOINT,
    response: defu(apiConfig.response, DEFAULT_RESPONSE_CONFIG) as MovkApiPublicConfig['response'],
    auth: defu(apiConfig.auth, DEFAULT_AUTH_CONFIG) as MovkApiPublicConfig['auth'],
    toast: defu(apiConfig.toast, DEFAULT_TOAST_CONFIG) as MovkApiPublicConfig['toast']
  }

  const privateConfig = {
    endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
  }

  return { publicConfig, privateConfig }
}
