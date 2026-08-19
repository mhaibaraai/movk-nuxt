import defu, { createDefu } from 'defu'
import type { ApiAuthConfig, ApiResponseConfig, ApiToastConfig, MovkApiPublicConfig } from '../../types/api'
import type { EndpointPrivateConfig, ResolvedEndpointConfig } from '../../types/api/module'

/**
 * Toast 配置合并器
 * @description methods 白名单按整体覆盖处理，避免 defu 默认的数组拼接把端点级白名单与全局级并集
 */
const mergeToastConfig = createDefu((obj, key, value) => {
  if (key === 'methods' && Array.isArray(value)) {
    (obj as Record<string, unknown>)[key as string] = value
    return true
  }
  return false
})

/**
 * 合并全局与端点配置为运行时实际生效的 ResolvedEndpointConfig
 *
 * @param publicConfig 模块公共配置
 * @param endpoint 端点名称；未指定时使用 defaultEndpoint
 * @param privateEndpoints 服务端私有端点配置（含机密 headers），仅在服务端可用；与端点 publicHeaders 合并后生效
 * @description 端点不存在时降级到 defaultEndpoint，并打印警告
 */
export function resolveEndpointConfig(
  publicConfig: MovkApiPublicConfig,
  endpoint?: string,
  privateEndpoints?: Record<string, EndpointPrivateConfig>
): ResolvedEndpointConfig {
  const endpointName = endpoint || publicConfig.defaultEndpoint || 'default'
  const endpointConfig = publicConfig.endpoints?.[endpointName]

  if (!endpointConfig) {
    console.warn(`[@movk/nuxt] Endpoint "${endpointName}" not found, using default`)
    return resolveEndpointConfig(publicConfig, publicConfig.defaultEndpoint || 'default', privateEndpoints)
  }

  const mergedHeaders = defu(
    privateEndpoints?.[endpointName]?.headers,
    endpointConfig.publicHeaders
  )

  return {
    ...endpointConfig,
    baseURL: endpointConfig.baseURL || '',
    headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : undefined,
    auth: defu(endpointConfig.auth, publicConfig.auth) as ApiAuthConfig,
    toast: mergeToastConfig(endpointConfig.toast ?? {}, publicConfig.toast ?? {}) as ApiToastConfig,
    response: defu(endpointConfig.response, publicConfig.response) as ApiResponseConfig
  }
}
