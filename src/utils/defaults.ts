import defu from 'defu'
import type { ApiEndpointPublicConfig, EndpointPrivateConfig, ModuleOptions } from '../module'

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
          duration: 3000
        },
        error: {
          show: true,
          color: 'error',
          duration: 3000
        }
      })
  }

  const privateConfig = {
    endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
  }

  return { publicConfig, privateConfig }
}

export function getDefaultConfig(theme?: ModuleOptions['theme']) {
  const pickerFonts = theme?.fonts ?? [
    { name: 'Alibaba PuHuiTi', href: 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css' },
    { name: 'Public Sans' },
    { name: 'DM Sans' },
    { name: 'Geist' },
    { name: 'Inter' },
    { name: 'Poppins' },
    { name: 'Outfit' },
    { name: 'Raleway' }
  ]
  const pickerRadiuses = theme?.radiuses ?? [0, 0.125, 0.25, 0.375, 0.5]
  const pickerNeutralColors = theme?.neutralColors ?? ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

  return {
    radius: 0.25,
    blackAsPrimary: false,
    font: 'Alibaba PuHuiTi',
    icons: 'lucide',
    prefix: theme?.prefix,
    tv: {
      twMergeConfig: {
        prefix: theme?.prefix
      }
    },
    picker: { fonts: pickerFonts, radiuses: pickerRadiuses, neutralColors: pickerNeutralColors }
  }
}

export const defaultOptions = {
  prefix: 'M',
  theme: {
    enabled: true
  }
}
