import type { ApiResponse, ApiResponseConfig } from '../../types/api'

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
    || response.message
    || response.msg
}

export function extractData(
  response: ApiResponse,
  config: Partial<ApiResponseConfig> = {}
): unknown {
  const dataKey = config.dataKey || 'data'
  return response[dataKey] ?? response
}
