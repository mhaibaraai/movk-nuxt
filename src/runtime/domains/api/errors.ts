import type { ApiError, ApiResponse } from '../../types/api'

export function createApiError(response: ApiResponse, message?: string): ApiError {
  const error = new Error(message || '请求失败') as ApiError
  error.statusCode = Number(response.code || response.status || 500)
  error.response = response
  error.isBusinessError = true
  return error
}
