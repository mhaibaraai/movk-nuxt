import type { ApiAuthConfig } from '../../types/api'
import type { useNuxtApp } from '#imports'
import { getPath } from '@movk/core'
import { getUserSession } from './session'

type NuxtApp = ReturnType<typeof useNuxtApp>

// 请求拦截器在 await 之后执行，SSR 下已无 Nuxt 上下文，必须使用创建客户端时捕获的 nuxtApp
function getTokenFromSession(tokenPath: string, nuxtApp: NuxtApp): string | null {
  let sessionData: unknown
  try {
    sessionData = getUserSession(nuxtApp)?.session?.value
  }
  catch {
    return null
  }
  if (!sessionData) return null

  return (getPath(sessionData as Record<string, unknown>, tokenPath) as string) || null
}

function getTokenFromPublicRuntimeConfig(tokenPath: string, nuxtApp: NuxtApp): string | null {
  try {
    return (getPath(nuxtApp.$config.public, tokenPath) as string) || null
  }
  catch {
    return null
  }
}

function buildAuthHeaderValue(token: string, config: ApiAuthConfig): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

export function getAuthHeaders(auth: ApiAuthConfig, nuxtApp: NuxtApp): Record<string, string> {
  const headers: Record<string, string> = {}

  if (!auth.enabled) return headers

  const token = auth.tokenSource === 'public-runtime-config'
    ? getTokenFromPublicRuntimeConfig(auth.tokenPath || 'apiToken', nuxtApp)
    : getTokenFromSession(auth.sessionTokenPath || 'token', nuxtApp)

  if (token) {
    const headerName = auth.headerName || 'Authorization'
    headers[headerName] = buildAuthHeaderValue(token, auth)
  }

  return headers
}
