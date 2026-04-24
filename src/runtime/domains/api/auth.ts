import type { ApiAuthConfig, ResolvedEndpointConfig } from '../../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useUserSession } from '#imports'

function getUserSession(): ReturnType<typeof useUserSession> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.vueApp.runWithContext(() => useUserSession())
  }
  catch {
    return null
  }
}

function getTokenFromSession(tokenPath: string): string | null {
  const userSession = getUserSession()
  if (!userSession?.session?.value) return null

  const sessionData = userSession.session.value
  return (getPath(sessionData, tokenPath) as string) || null
}

function buildAuthHeaderValue(token: string, config: Partial<ApiAuthConfig>): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

export function getAuthHeaders(config: Pick<ResolvedEndpointConfig, 'auth'>): Record<string, string> {
  const headers: Record<string, string> = {}
  const authConfig = config.auth

  if (!authConfig.enabled) return headers

  const tokenPath = authConfig.sessionTokenPath || 'token'
  const token = getTokenFromSession(tokenPath)

  if (token) {
    const headerName = authConfig.headerName || 'Authorization'
    headers[headerName] = buildAuthHeaderValue(token, authConfig)
  }

  return headers
}
