import type { Suggest } from '@movk/core'

/**
 * API 响应配置
 * @description 定义业务状态码判断规则和数据/消息字段的映射关系
 */
export interface ApiResponseConfig {
  /**
   * 表示成功的业务状态码列表
   * @defaultValue [200, 0]
   */
  successCodes?: (number | string)[]
  /**
   * 响应中业务状态码的字段名
   * @defaultValue 'code'
   */
  codeKey?: string
  /**
   * 响应中消息内容的字段名
   * @defaultValue 'message'
   */
  messageKey?: string
  /**
   * 响应中业务数据的字段名
   * @defaultValue 'data'
   */
  dataKey?: string
}

/**
 * API 认证配置
 * @description 定义认证令牌的来源、格式和请求头配置
 */
export interface ApiAuthConfig {
  /**
   * 是否启用认证
   * @defaultValue false
   */
  enabled?: boolean
  /**
   * 令牌来源类型
   * @defaultValue 'session'
   */
  tokenSource?: Suggest<'session'>
  /**
   * 令牌在会话对象中的路径（支持点号分隔的嵌套路径）
   * @defaultValue 'token'
   * @example 'token' | 'user.accessToken' | 'auth.credentials.token'
   */
  sessionTokenPath?: string
  /**
   * 令牌类型前缀
   * @defaultValue 'Bearer'
   */
  tokenType?: Suggest<'Bearer' | 'Basic' | 'Custom'>
  /**
   * 自定义令牌类型前缀（当 tokenType 为 'Custom' 时使用）
   */
  customTokenType?: string
  /**
   * 认证请求头名称
   * @defaultValue 'Authorization'
   */
  headerName?: string
  /**
   * 401 未授权处理配置
   */
  unauthorized?: {
    /** 是否自动重定向到登录页 @defaultValue true */
    redirect?: boolean
    /** 登录页路径 @defaultValue '/login' */
    loginPath?: string
    /** 是否清除用户会话 @defaultValue true */
    clearSession?: boolean
  }
}

/**
 * Toast 提示配置
 * @description 定义成功和错误提示的全局样式和行为
 */
export interface ApiToastConfig {
  /**
   * 是否启用 Toast 提示
   * @defaultValue true
   */
  enabled?: boolean
  /**
   * 成功提示配置
   */
  success?: {
    /**
     * 是否显示成功提示
     * @defaultValue true
     */
    show?: boolean
    /**
     * 提示颜色
     * @defaultValue 'success'
     */
    color?: string
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-check'
     */
    icon?: string
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration?: number
  }
  /**
   * 错误提示配置
   */
  error?: {
    /**
     * 是否显示错误提示
     * @defaultValue true
     */
    show?: boolean
    /**
     * 提示颜色
     * @defaultValue 'error'
     */
    color?: string
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-x'
     */
    icon?: string
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration?: number
  }
}

/**
 * API 端点公共配置
 * @description 定义单个 API 端点的配置（可在客户端访问的配置）
 */
export interface ApiEndpointPublicConfig {
  /**
   * 端点的基础 URL
   */
  baseURL: string
  /**
   * 端点别名（用于标识）
   */
  alias?: string
  /**
   * 端点级别的认证配置（覆盖全局配置）
   */
  auth?: ApiAuthConfig
  /**
   * 端点级别的 Toast 配置（覆盖全局配置）
   */
  toast?: ApiToastConfig
  /**
   * 端点级别的响应配置（覆盖全局配置）
   */
  response?: ApiResponseConfig
}
