import type { ApiProfile, ApiProfileInput } from '../types'
import { simpleHash } from '@movk/core'
import { LRUCache } from 'lru-cache'
import { ApiProfileSchema } from '../types'

const apiCache = new LRUCache<string, ApiProfile>({
  max: 120,
  ttl: 10 * 60 * 1000,
  updateAgeOnGet: true,
  allowStale: true,
  noDeleteOnFetchRejection: true,
})

function generateCacheKey(config: Record<string, any>): string {
  const sortedKeys = Object.keys(config).sort()
  const stableString = sortedKeys
    .map(key => `${key}:${JSON.stringify(config[key])}`)
    .join('|')

  return `api-profile:${simpleHash(stableString)}`
}

export function validateApiProfile(apiProfile: ApiProfileInput): ApiProfile {
  const cacheKey = generateCacheKey(apiProfile)
  const cachedProfile = apiCache.get(cacheKey)
  if (cachedProfile) {
    return cachedProfile
  }

  let profile: ApiProfile
  const validation = ApiProfileSchema.safeParse(apiProfile)
  if (!validation.success) {
    console.warn('[API Factory] API configuration validation failed:', validation.error.issues)
    profile = ApiProfileSchema.parse({})
  }
  else {
    profile = validation.data
  }

  apiCache.set(cacheKey, profile)
  return profile
}

export async function executeCallbacks(callbacks: any, context: any) {
  if (!callbacks)
    return

  const callbackArray = Array.isArray(callbacks) ? callbacks : [callbacks]

  for (const callback of callbackArray) {
    if (typeof callback === 'function') {
      try {
        await callback(context)
      }
      catch (error) {
        console.warn('[API Factory] Callback execution error:', error)
      }
    }
  }
}
