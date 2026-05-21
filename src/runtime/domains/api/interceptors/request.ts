import type { FetchContext } from 'ofetch'
import type { MovkApiPublicConfig } from '../../../types/api'
import type { ResolvedEndpointConfig } from '../../../types/api/module'
import type { useNuxtApp } from '#imports'
import { getAuthHeaders } from '../auth'

type NuxtApp = ReturnType<typeof useNuxtApp>

function toHeaderRecord(headers: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!headers) return out
  if (headers instanceof Headers) {
    headers.forEach((value, key) => { out[key] = value })
    return out
  }
  if (Array.isArray(headers)) {
    for (const entry of headers as Array<[string, string | undefined]>) {
      if (entry && entry[1] !== undefined) out[entry[0]] = entry[1] as string
    }
    return out
  }
  for (const [key, value] of Object.entries(headers as Record<string, string | undefined>)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

/**
 * 构造 onRequest 拦截器：注入认证头、debug 日志、派发 movk:api:request hook
 *
 * @description Headers 重建前会过滤 undefined 值，规避 ofetch 某些版本 `Record<string, string | undefined>` 导致的 TypeError
 */
export function createOnRequest(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  nuxtApp: NuxtApp
) {
  const { auth: authConfig } = resolvedConfig

  return async function onRequest(context: FetchContext): Promise<void> {
    if (authConfig.enabled) {
      const authHeaders = getAuthHeaders(authConfig)
      const normalized = toHeaderRecord(context.options.headers)
      const headers = new Headers(normalized)
      for (const [key, value] of Object.entries(authHeaders)) {
        headers.set(key, value)
      }
      context.options.headers = headers
    }

    if (publicConfig.debug) {
      const h = context.options.headers
      const headersLog = h instanceof Headers
        ? Object.fromEntries(h.entries())
        : h
      console.info('[@movk/nuxt] Request:', {
        method: context.options.method || 'GET',
        url: `${resolvedConfig.baseURL}${context.request}`,
        headers: headersLog,
        body: context.options.body ? '(body present)' : undefined
      })
    }

    await nuxtApp.callHook('movk:api:request', context)
  }
}
