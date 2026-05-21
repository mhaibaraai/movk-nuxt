import type { FetchContext, FetchOptions } from 'ofetch'
import type {
  ApiError,
  ApiResponse,
  MovkApiPublicConfig,
  RequestToastOptions,
  TransferRequestOptions,
  TransferResult
} from '../../types/api'
import type { ResolvedEndpointConfig } from '../../types/api/module'
import type { useNuxtApp } from '#imports'
import { extractFilename } from '@movk/core'
import { getAuthHeaders } from './auth'
import { resolveEndpointConfig } from './endpoint-config'
import { createApiError } from './errors'
import { extractData, extractMessage, isBusinessSuccess } from './response'
import { showToast } from './toast'

type NuxtApp = ReturnType<typeof useNuxtApp>

/**
 * 预备传输上下文
 */
export interface PreparedTransfer {
  fullUrl: string
  headers: Record<string, string>
  config: ResolvedEndpointConfig
}

/**
 * 解析端点 + 拼装 URL + 合并 headers（auth 在前、用户在后，用户优先）
 */
export function prepareTransfer(
  publicConfig: MovkApiPublicConfig,
  url: string,
  options: TransferRequestOptions
): PreparedTransfer {
  const config = resolveEndpointConfig(publicConfig, options.endpoint)
  const fullUrl = `${config.baseURL || ''}${url}`
  const authHeaders = getAuthHeaders(config.auth)
  const headers = { ...authHeaders, ...(options.headers || {}) }
  return { fullUrl, headers, config }
}

/**
 * 解析下载文件名
 * @description 优先级：override > content-disposition > URL pathname 末段 > 'download'
 */
export function resolveFilename(
  headers: Headers,
  url: string,
  override?: string
): string {
  if (override) return override

  const fromHeader = extractFilename(headers, '')
  if (fromHeader) return fromHeader

  try {
    const base = typeof location !== 'undefined' ? location.origin : 'http://localhost'
    const pathname = new URL(url, base).pathname
    const last = pathname.split('/').filter(Boolean).pop()
    if (last) return last
  }
  catch { /* fallthrough */ }

  return 'download'
}

/**
 * 安全解析 JSON 响应
 * @description content-type 含 application/json 时尝试 JSON.parse；失败或非 JSON 返回 null
 */
export function tryParseJsonResponse(headers: Headers, text: string): ApiResponse | null {
  const contentType = headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) return null
  try {
    return JSON.parse(text) as ApiResponse
  }
  catch {
    return null
  }
}

/**
 * 把 XHR 的 getAllResponseHeaders() 字符串解析为标准 Headers
 */
export function parseXhrHeaders(raw: string): Headers {
  const headers = new Headers()
  if (!raw) return headers
  for (const line of raw.trim().split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const name = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (name) headers.append(name, value)
  }
  return headers
}

/**
 * finalizeTransfer 入参
 */
export interface FinalizeTransferContext<T> {
  /** JSON 响应体；纯二进制成功时为 null */
  raw: ApiResponse | null
  /** 无 JSON 时由调用方提供成功/失败判定与默认数据 */
  fallback?: { isSuccess: boolean, data: T | null, message?: string }
  config: ResolvedEndpointConfig
  publicConfig: MovkApiPublicConfig
  /** 单次请求 toast 覆盖；false 整体禁用 */
  requestToast: RequestToastOptions | false | undefined
  skipBusinessCheck?: boolean
  /** 合成的 FetchContext，用于派发 movk:api:* hook */
  fetchContext: FetchContext
}

/**
 * 统一处理传输结果：业务校验 → 派发 hook → 触发 toast → 构造 TransferResult
 *
 * @description 本函数**不抛异常**，所有错误以 result.error 形式返回，由 composable 自行决定是否 throw。
 *  中止场景应由调用方在调用本函数前短路，不要进入此函数。
 */
export async function finalizeTransfer<T>(
  nuxtApp: NuxtApp,
  ctx: FinalizeTransferContext<T>
): Promise<TransferResult<T>> {
  const { raw, fallback, config, publicConfig, requestToast, skipBusinessCheck, fetchContext } = ctx
  const { response: responseConfig, toast: toastConfig } = config

  if (publicConfig.debug) {
    console.info('[@movk/nuxt] Transfer response:', raw ?? fallback)
  }

  const hasRaw = raw !== null

  const isSuccess = hasRaw
    ? (skipBusinessCheck || isBusinessSuccess(raw, responseConfig))
    : (fallback?.isSuccess ?? false)

  if (isSuccess) {
    const data: T | null = hasRaw
      ? ((skipBusinessCheck ? raw : extractData(raw, responseConfig)) as T)
      : (fallback?.data ?? null)

    // 写入 _data 供 hook 订阅者读取已解包数据
    if (fetchContext.response) {
      fetchContext.response._data = data as unknown
    }

    await nuxtApp.callHook('movk:api:response', fetchContext)
    showToast('success', raw ?? fallback?.message, requestToast, toastConfig, responseConfig)

    return { data, error: null, aborted: false }
  }

  const message = hasRaw
    ? (extractMessage(raw, responseConfig) || fallback?.message)
    : fallback?.message

  const apiError: ApiError | Error = hasRaw
    ? createApiError(raw, message)
    : Object.assign(new Error(message || '请求失败'), { isBusinessError: false })

  if (fetchContext.response) {
    fetchContext.response._data = raw ?? undefined
  }
  fetchContext.error = apiError

  await nuxtApp.callHook('movk:api:error', fetchContext)
  showToast('error', raw ?? message, requestToast, toastConfig, responseConfig)

  return { data: null, error: apiError, aborted: false }
}

/**
 * 合成一个最小可用的 FetchContext，供 hook 订阅者使用
 *
 * @description 由于上传/下载基于 XHR / fetch，不经 ofetch；此处提供必要字段以与 $api 的 hook 契约对齐。
 */
export function buildFetchContext(
  request: string,
  options: FetchOptions,
  response?: { status: number, headers: Headers, _data?: unknown }
): FetchContext {
  return {
    request,
    options,
    response
  } as unknown as FetchContext
}
