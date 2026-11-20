import type { FetchContext } from 'ofetch'
import type { ApiAuthConfig, ApiError, MovkApiPublicConfig } from '../../types/api'
import type { ResolvedEndpointConfig } from '../../types/api/module'
import type { useNuxtApp } from '#imports'
import { navigateTo } from '#imports'
import { getUserSession } from './session'
import { showToast } from './toast'

type NuxtApp = ReturnType<typeof useNuxtApp>

/** 单端点请求管线的共享依赖 */
export interface ApiClientDeps {
  endpoint: string
  config: ResolvedEndpointConfig
  publicConfig: MovkApiPublicConfig
  nuxtApp: NuxtApp
}

const UNAUTHORIZED_CODE = 401

/** HTTP 状态码或业务码（兼容字符串）为 401 */
export function isUnauthorized(error: ApiError): boolean {
  const code = error.data?.code
  return code !== undefined && code !== null && Number(code) === UNAUTHORIZED_CODE
}

async function handleUnauthorized(authConfig: ApiAuthConfig, nuxtApp: NuxtApp): Promise<void> {
  const unauthorizedConfig = authConfig.unauthorized
  if (!unauthorizedConfig) return

  if (unauthorizedConfig.clearSession) {
    const userSession = getUserSession(nuxtApp)
    if (userSession?.clear) {
      try {
        await userSession.clear()
        await userSession.fetch?.()
      }
      catch { /* session not available */ }
    }
  }

  if (unauthorizedConfig.redirect) {
    const loginPath = unauthorizedConfig.loginPath || '/login'
    await nuxtApp.runWithContext(() => navigateTo(loginPath))
  }
}

/**
 * 派发 `movk:api:unauthorized`，业务未接管时执行默认的清理会话与重定向
 * @returns 业务侧是否已接管（`result.handled`）
 */
async function dispatchUnauthorized(context: FetchContext, deps: ApiClientDeps): Promise<boolean> {
  const result = { handled: false }
  await deps.nuxtApp.callHook('movk:api:unauthorized', context, result)
  if (!result.handled) {
    await handleUnauthorized(deps.config.auth, deps.nuxtApp)
  }
  return result.handled
}

/**
 * 成功上报：派发 `movk:api:response` 并触发成功 toast
 * @description message 为字符串时作固定文案，为响应体时按 messageKey 抽取
 */
export async function reportSuccess(context: FetchContext, message: unknown, deps: ApiClientDeps): Promise<void> {
  const { config, nuxtApp } = deps
  await nuxtApp.callHook('movk:api:response', context)
  showToast('success', message, context.options.toast, config.toast, config.response, context.options.method, nuxtApp)
}

/**
 * 失败上报：401 → `movk:api:unauthorized`（接管后不再派发 error）→ `movk:api:error` → 错误 toast
 * @description 由客户端出口在 ofetch 重试结束后统一调用，每次请求只上报一次；中止不上报
 */
export async function reportFailure(context: FetchContext | undefined, error: ApiError, deps: ApiClientDeps): Promise<void> {
  if (error.data?.kind === 'aborted') return

  const { config, publicConfig, nuxtApp } = deps
  const fetchContext = context ?? { request: '', options: {} } as FetchContext

  if (publicConfig.debug) {
    console.error('[@movk/nuxt] Error:', error.data?.kind, error.statusCode, error.data?.response)
  }

  const handled = isUnauthorized(error) && await dispatchUnauthorized(fetchContext, deps)
  if (!handled) {
    await nuxtApp.callHook('movk:api:error', fetchContext, error)
  }
  showToast('error', error.message, fetchContext.options.toast, config.toast, config.response, fetchContext.options.method, nuxtApp)
}
