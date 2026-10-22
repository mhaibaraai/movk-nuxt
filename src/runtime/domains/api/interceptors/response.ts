import type { FetchContext, FetchResponse } from 'ofetch'
import type { ApiClientDeps } from '../report'
import { bindErrorContext, createApiError } from '../errors'
import { interpretResponse, resolvePolicy } from '../response'
import { reportSuccess } from '../report'
import { isReadableStream } from '../stream'

function isJsonResponse(response: FetchResponse<unknown>): boolean {
  return (response.headers.get('content-type') || '').toLowerCase().includes('application/json')
}

/** 流式读取的 JSON 响应（下载、SSE 的错误信封）先还原为对象，再走统一判定 */
async function readJson(response: FetchResponse<unknown>): Promise<unknown> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  }
  catch {
    return text
  }
}

/**
 * 构造 onResponse 拦截器
 *
 * @description 只负责成功响应的判定与转换，失败上报统一交给客户端出口：
 * - 以流读取的 JSON 响应先解析为对象（含 HTTP 错误响应）
 * - HTTP 4xx/5xx 直接返回，交给 ofetch 抛 FetchError（保留重试）
 * - 真正的流（SSE、二进制）短路：只派发 movk:api:response，不解包不校验
 * - 其余按策略（请求 > 端点 > 全局）判定：通过则解包并上报成功，失败抛业务 ApiError
 *
 * **契约**：拦截器输出 = 业务数据。`movk:api:response` hook 收到的 `context.response._data` 已按策略处理。
 */
export function createOnResponse(deps: ApiClientDeps) {
  const { endpoint, config, publicConfig, nuxtApp } = deps

  return async function onResponse(context: FetchContext): Promise<void> {
    const { response } = context
    if (!response) return

    // 先于状态码判断：HTTP 错误的 JSON 响应体同样要还原，供出口抽取错误消息
    if (isReadableStream(response._data) && isJsonResponse(response)) {
      response._data = await readJson(response)
    }

    if (response.status >= 400) return

    if (isReadableStream(response._data)) {
      if (publicConfig.debug) {
        console.info('[@movk/nuxt] Response: <stream>')
      }
      await nuxtApp.callHook('movk:api:response', context)
      return
    }

    const raw = response._data
    if (publicConfig.debug) {
      console.info('[@movk/nuxt] Response:', raw)
    }

    const result = interpretResponse(raw, resolvePolicy(config.response, context.options), config.response)

    if (!result.ok) {
      throw bindErrorContext(createApiError({
        kind: 'business',
        endpoint,
        code: result.code,
        message: result.message,
        response: raw
      }), context)
    }

    response._data = result.data
    await reportSuccess(context, raw, deps)
  }
}
