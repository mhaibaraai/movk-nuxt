import type { ApiError, ApiResponse } from '../../types/api'

export function createApiError(response: ApiResponse, message?: string): ApiError {
  const error = new Error(message || '请求失败', { cause: response }) as ApiError

  const rawCode = response.code ?? response.status ?? 500
  const numericCode = typeof rawCode === 'number' ? rawCode : Number(rawCode)
  error.statusCode = Number.isNaN(numericCode) ? 500 : numericCode

  error.response = response
  error.isBusinessError = true

  // 跳过工厂帧，让堆栈直接指向调用点
  Error.captureStackTrace?.(error, createApiError)

  return error
}
