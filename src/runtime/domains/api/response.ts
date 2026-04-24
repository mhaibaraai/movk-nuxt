import type { ApiError, ApiResponse, ApiResponseConfig } from '../../types/api'

export function isBusinessSuccess(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): boolean {
  const codeKey = config.codeKey || 'code'
  const successCodes = config.successCodes || [200, 0]
  const code = response[codeKey]
  return successCodes.includes(code as number | string)
}

export function extractMessage(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): string | undefined {
  const messageKey = config.messageKey || 'message'
  return (response[messageKey] as string | undefined)
    || (response.message as string | undefined)
    || (response.msg as string | undefined)
}

export function extractData(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): unknown {
  const dataKey = config.dataKey || 'data'
  return response[dataKey] ?? response
}

export function createApiError(response: ApiResponse, message?: string): ApiError {
  const error = new Error(message || '请求失败') as ApiError
  error.statusCode = Number(response.code || response.status || 500)
  error.response = response
  error.isBusinessError = true
  return error
}
