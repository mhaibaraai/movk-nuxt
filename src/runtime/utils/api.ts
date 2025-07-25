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

/**
 * 验证并缓存API配置，提供配置验证和缓存机制
 *
 * @category API
 * @param apiProfile API配置输入对象
 * @returns 验证后的API配置对象
 * @example
 * ```ts
 * // 验证基础API配置
 * const profile = validateApiProfile({
 *   timeout: 5000,
 *   retries: 3
 * })
 *
 * // 验证带认证的API配置
 * const authProfile = validateApiProfile({
 *   timeout: 8000,
 *   auth: {
 *     token: 'Bearer xyz123',
 *     type: 'bearer'
 *   },
 *   response: {
 *     dataKey: 'data'
 *   }
 * })
 *
 * // 如果配置无效，将使用默认配置
 * const defaultProfile = validateApiProfile({
 *   timeout: 'invalid' // 会回退到默认配置
 * })
 * ```
 */
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
