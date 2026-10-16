import type { FetchContext } from 'ofetch'
import type { ApiAuthConfig, ApiResponse, ApiResponseConfig } from '../../../types/api'
import type { useNuxtApp } from '#imports'
import { navigateTo } from '#imports'
import { getUserSession } from '../session'

type NuxtApp = ReturnType<typeof useNuxtApp>

const UNAUTHORIZED_CODE = 401

/** HTTP 状态码或业务码（按 codeKey 读取，兼容字符串）为 401 */
export function isUnauthorized(
  status: number | undefined,
  raw: ApiResponse | null | undefined,
  responseConfig: Partial<ApiResponseConfig> = {}
): boolean {
  if (status === UNAUTHORIZED_CODE) return true
  const code = raw?.[responseConfig.codeKey || 'code']
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
export async function dispatchUnauthorized(
  context: FetchContext,
  authConfig: ApiAuthConfig,
  nuxtApp: NuxtApp
): Promise<boolean> {
  const result = { handled: false }
  await nuxtApp.callHook('movk:api:unauthorized', context, result)
  if (!result.handled) {
    await handleUnauthorized(authConfig, nuxtApp)
  }
  return result.handled
}
