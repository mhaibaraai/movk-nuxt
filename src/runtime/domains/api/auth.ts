import type { ApiAuthConfig } from '../../types/api'
import { getPath } from '@movk/core'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import { getUserSession } from './session'

function getTokenFromSession(tokenPath: string): string | null {
  let sessionData: unknown
  try {
    sessionData = getUserSession(useNuxtApp())?.session?.value
  }
  catch {
    return null
  }
  if (!sessionData) return null

  return (getPath(sessionData as Record<string, unknown>, tokenPath) as string) || null
}

function getTokenFromPublicRuntimeConfig(tokenPath: string): string | null {
  try {
    return (getPath(useRuntimeConfig().public, tokenPath) as string) || null
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

export function getAuthHeaders(auth: ApiAuthConfig): Record<string, string> {
  const headers: Record<string, string> = {}

  if (!auth.enabled) return headers

  const token = auth.tokenSource === 'public-runtime-config'
    ? getTokenFromPublicRuntimeConfig(auth.tokenPath || 'apiToken')
    : getTokenFromSession(auth.sessionTokenPath || 'token')

  if (token) {
    const headerName = auth.headerName || 'Authorization'
    headers[headerName] = buildAuthHeaderValue(token, auth)
  }

  return headers
}
