import type { FetchContext, FetchError } from 'ofetch'
import type { ApiError, ApiErrorData, ApiErrorKind, ApiResponseConfig } from '../../types/api'
import { isPlainObject } from '@movk/core'
import { createError, isNuxtError } from '#imports'
import { extractMessage } from './response'

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  business: '请求失败',
  http: '请求失败',
  network: '网络错误',
  timeout: '请求超时',
  aborted: '请求已中止'
}

export interface ApiErrorInput {
  kind: ApiErrorKind
  endpoint: string
  message?: string
  code?: number | string
  response?: unknown
}

/** 能映射为 HTTP 语义的码直接作为 statusCode，其余（如 40001、'A0001'）回退 500，原值保留在 data.code */
function toStatusCode(code: number | string | undefined): number | undefined {
  const numeric = Number(code)
  return Number.isInteger(numeric) && numeric >= 100 && numeric <= 599 ? numeric : undefined
}

export function createApiError(input: ApiErrorInput): ApiError {
  const { kind, endpoint, message, code, response } = input
  const data: ApiErrorData = { kind, endpoint, code, response }

  return createError<ApiErrorData>({
    statusCode: toStatusCode(code) ?? 500,
    message: message || DEFAULT_MESSAGES[kind],
    data
  })
}

export function isApiError(error: unknown): error is ApiError {
  return isNuxtError(error) && isPlainObject(error.data) && typeof error.data.kind === 'string'
}

function isFetchError(error: unknown): error is FetchError {
  return error instanceof Error && error.name === 'FetchError'
}

function causeName(error: Error): string | undefined {
  const cause = error.cause
  return cause instanceof Error || isPlainObject(cause) ? (cause as { name?: string }).name : undefined
}

/**
 * 把 ofetch 抛出的错误归一为 ApiError
 * @returns 无法识别的错误（如用户钩子内抛出）返回 null，由调用方原样抛出
 */
export function toApiError(
  error: unknown,
  endpoint: string,
  responseConfig: Partial<ApiResponseConfig> = {}
): ApiError | null {
  if (isApiError(error)) return error
  if (!isFetchError(error)) {
    return error instanceof Error && error.name === 'AbortError'
      ? createApiError({ kind: 'aborted', endpoint })
      : null
  }

  const name = causeName(error)
  if (name === 'AbortError') return createApiError({ kind: 'aborted', endpoint })
  if (name === 'TimeoutError') return createApiError({ kind: 'timeout', endpoint })

  const { response } = error
  if (!response) return createApiError({ kind: 'network', endpoint })

  return createApiError({
    kind: 'http',
    endpoint,
    code: response.status,
    response: error.data,
    message: extractMessage(error.data, responseConfig) || `请求失败 (${response.status})`
  })
}

const errorContexts = new WeakMap<object, FetchContext>()

/** 拦截器内抛出的业务错误不经 FetchError，借此携带 FetchContext 给上报环节 */
export function bindErrorContext(error: ApiError, context: FetchContext): ApiError {
  errorContexts.set(error, context)
  return error
}

/** 取回失败请求的 FetchContext；FetchError 自带 request / options / response */
export function getErrorContext(error: unknown): FetchContext | undefined {
  if (error === null || typeof error !== 'object') return undefined
  const bound = errorContexts.get(error)
  if (bound) return bound
  if (!isFetchError(error)) return undefined
  return { request: error.request!, options: error.options!, response: error.response, error } as FetchContext
}
