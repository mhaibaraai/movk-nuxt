import defu from 'defu'
import type { ApiEndpointPublicConfig, ModuleOptions } from '../module'
import type { EndpointPrivateConfig } from '../runtime/types/api/module'

export function getDefaultApiConfig(apiConfig: ModuleOptions['api']) {
  const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
  const privateEndpoints: Record<string, EndpointPrivateConfig> = {}

  if (apiConfig?.endpoints) {
    for (const [key, { headers, ...rest }] of Object.entries(apiConfig.endpoints)) {
      publicEndpoints[key] = rest as ApiEndpointPublicConfig
      if (headers) privateEndpoints[key] = { headers }
    }
  }
  const endpoints = { default: { baseURL: '/api' }, ...publicEndpoints }

  const publicConfig = {
    defaultEndpoint: apiConfig?.defaultEndpoint ?? 'default',
    debug: apiConfig?.debug ?? false,
    endpoints,
    response: defu(
      apiConfig?.response,
      {
        successCodes: [200, 0, '200', '0'] as (number | string)[],
        codeKey: 'code',
        messageKey: 'message',
        dataKey: 'data'
      }),
    auth: defu(
      apiConfig?.auth,
      {
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
      }),
    toast: defu(
      apiConfig?.toast,
      {
        enabled: true,
        success: {
          show: true,
          color: 'success',
          icon: 'i-lucide-circle-check'
        },
        error: {
          show: true,
          color: 'error',
          icon: 'i-lucide-circle-x'
        }
      })
  }

  const privateConfig = {
    endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
  }

  return { publicConfig, privateConfig }
}

export const defaultOptions = {
  prefix: 'M',
  theme: {
    enabled: true
  }
}
