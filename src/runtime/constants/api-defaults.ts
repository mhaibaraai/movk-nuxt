import type { ApiResponseConfig, ApiAuthConfig, ApiToastConfig } from '../types/api'

export const DEFAULT_RESPONSE_CONFIG: ApiResponseConfig = {
  successCodes: [200, 0],
  codeKey: 'code',
  messageKey: 'message',
  dataKey: 'data'
}

export const DEFAULT_AUTH_CONFIG: ApiAuthConfig = {
  enabled: false,
  tokenSource: 'session',
  sessionTokenPath: 'token',
  tokenType: 'Bearer',
  headerName: 'Authorization'
}

export const DEFAULT_TOAST_CONFIG: ApiToastConfig = {
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

export const DEFAULT_ENDPOINT = { default: { baseURL: '/api' } }
