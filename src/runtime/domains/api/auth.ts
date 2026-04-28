import type { ApiAuthConfig } from '../../types/api'
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

function buildAuthHeaderValue(token: string, config: ApiAuthConfig): string {
  const tokenType = config.tokenType === 'Custom'
    ? (config.customTokenType || '')
    : (config.tokenType || 'Bearer')

  return tokenType ? `${tokenType} ${token}` : token
}

export function getAuthHeaders(auth: ApiAuthConfig): Record<string, string> {
  const headers: Record<string, string> = {}

  if (!auth.enabled) return headers

  const tokenPath = auth.sessionTokenPath || 'token'
  const token = getTokenFromSession(tokenPath)

  if (token) {
    const headerName = auth.headerName || 'Authorization'
    headers[headerName] = buildAuthHeaderValue(token, auth)
  }

  return headers
}
