import type { ApiAuthConfig, ApiEndpointPublicConfig, ApiResponseConfig, ApiToastConfig } from './config'

/**
 * Movk API 模块公共配置
 * @description 定义模块的全局配置（可在客户端访问）
 */
export interface MovkApiPublicConfig {
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint?: string
  /**
   * 是否启用调试模式（在控制台输出请求和响应日志）
   * @defaultValue false
   */
  debug?: boolean
  /**
   * 端点配置映射
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints?: Record<string, ApiEndpointPublicConfig>
  /**
   * 全局响应配置（已合并默认值，运行时必然存在）
   */
  response?: ApiResponseConfig
  /**
   * 全局认证配置（已合并默认值，运行时必然存在）
   */
  auth?: ApiAuthConfig
  /**
   * 全局 Toast 配置（已合并默认值，运行时必然存在）
   */
  toast?: ApiToastConfig
}

/**
 * 端点私有配置（仅服务端）
 * @description 从端点配置中拆分出的服务端专用字段，不会暴露给客户端
 */
export interface EndpointPrivateConfig {
  /** 自定义请求头（仅服务端使用，不会暴露给客户端） */
  headers?: Record<string, string>
}

/**
 * Movk API 模块完整配置
 * @description 定义模块的完整配置（公共+私有），用于模块初始化时的配置验证
 */
export interface MovkApiFullConfig {
  /**
   * 是否启用 API 模块
   * @defaultValue true
   */
  enabled?: boolean
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint?: string
  /**
   * 是否启用调试模式
   * @defaultValue false
   */
  debug?: boolean
  /**
   * 端点配置映射（包含公共和私有配置）
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints?: Record<string, ApiEndpointPublicConfig & EndpointPrivateConfig>
  /**
   * 全局响应配置
   */
  response?: ApiResponseConfig
  /**
   * 全局认证配置
   */
  auth?: ApiAuthConfig
  /**
   * 全局 Toast 配置
   */
  toast?: ApiToastConfig
}

/**
 * 已解析的端点配置
 * @description 合并全局配置和端点配置后的最终配置，供内部使用
 */
export interface ResolvedEndpointConfig extends Omit<ApiEndpointPublicConfig, 'auth' | 'toast' | 'response'> {
  /** 认证配置（已合并全局默认值，必然存在） */
  auth: ApiAuthConfig
  /** Toast 配置（已合并全局默认值，必然存在） */
  toast: ApiToastConfig
  /** 响应配置（已合并全局默认值，必然存在） */
  response: ApiResponseConfig
  /** 自定义请求头（仅服务端配置） */
  headers?: Record<string, string>
}
