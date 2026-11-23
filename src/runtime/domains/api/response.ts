import type { ApiRequestOptions, ApiResponse, ApiResponseConfig } from '../../types/api'
import { isPlainObject } from '@movk/core'

/** 单次请求最终生效的响应处理策略 */
export interface ResponsePolicy {
  check: boolean
  unwrap: boolean
}

/** 业务判定结果 */
export type ResponseInterpretation
  = | { ok: true, data: unknown }
    | { ok: false, code?: number | string, message?: string }

function asEnvelope(response: unknown): ApiResponse | null {
  return isPlainObject(response) ? response as ApiResponse : null
}

/**
 * 合并请求级与端点级（已含全局）策略
 * @description 优先级：请求显式值 > 端点 / 全局 response 配置 > 默认开启
 */
export function resolvePolicy(
  config: Partial<ApiResponseConfig>,
  request: ApiRequestOptions = {}
): ResponsePolicy {
  return {
    check: request.businessCheck ?? config.businessCheck ?? true,
    unwrap: request.unwrap ?? config.unwrap ?? true
  }
}

/** 非普通对象（数组、null、基本类型）一律判负 */
export function isBusinessSuccess(
  response: unknown,
  config: Partial<ApiResponseConfig> = {}
): boolean {
  const envelope = asEnvelope(response)
  if (!envelope) return false
  const successCodes = config.successCodes || [200, 0]
  return successCodes.includes(envelope[config.codeKey || 'code'] as number | string)
}

export function extractCode(
  response: unknown,
  config: Partial<ApiResponseConfig> = {}
): number | string | undefined {
  return asEnvelope(response)?.[config.codeKey || 'code'] as number | string | undefined
}

export function extractMessage(
  response: unknown,
  config: Partial<ApiResponseConfig> = {}
): string | undefined {
  const envelope = asEnvelope(response)
  if (!envelope) return undefined
  return (envelope[config.messageKey || 'message'] as string | undefined)
    || envelope.message
    || envelope.msg
}

export function extractData(
  response: unknown,
  config: Partial<ApiResponseConfig> = {}
): unknown {
  const envelope = asEnvelope(response)
  const dataKey = config.dataKey || 'data'
  return envelope && dataKey in envelope ? envelope[dataKey] : undefined
}

/**
 * 按策略判定响应：校验失败返回业务码与消息，通过则按需解包
 */
export function interpretResponse(
  raw: unknown,
  policy: ResponsePolicy,
  config: Partial<ApiResponseConfig> = {}
): ResponseInterpretation {
  if (policy.check && !isBusinessSuccess(raw, config)) {
    return { ok: false, code: extractCode(raw, config), message: extractMessage(raw, config) }
  }
  return { ok: true, data: policy.unwrap ? extractData(raw, config) : raw }
}
