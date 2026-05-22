import defu from 'defu'
import type { ApiAuthConfig, ApiResponseConfig, ApiToastConfig, MovkApiPublicConfig } from '../../types/api'
import type { EndpointPrivateConfig, ResolvedEndpointConfig } from '../../types/api/module'

/**
 * 合并全局与端点配置为运行时实际生效的 ResolvedEndpointConfig
 *
 * @param publicConfig 模块公共配置
 * @param endpoint 端点名称；未指定时使用 defaultEndpoint
 * @param privateEndpoints 服务端私有端点配置（含 headers），仅在服务端可用
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

  return {
    ...endpointConfig,
    baseURL: endpointConfig.baseURL || '',
    headers: privateEndpoints?.[endpointName]?.headers,
    auth: defu(endpointConfig.auth, publicConfig.auth) as ApiAuthConfig,
    toast: defu(endpointConfig.toast, publicConfig.toast) as ApiToastConfig,
    response: defu(endpointConfig.response, publicConfig.response) as ApiResponseConfig
  }
}
