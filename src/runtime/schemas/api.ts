import { z } from 'zod/v4'

/**
 * 标准 API 响应结构 Schema
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    /** 状态码 */
    code: z.union([z.number(), z.string()]).optional(),
    status: z.union([z.number(), z.string()]).optional(),
    /** 消息字段 */
    msg: z.string().optional(),
    message: z.string().optional(),
    /** 数据字段 */
    data: dataSchema.optional(),
    result: dataSchema.optional(),
    token: z.string().optional(),
    /** 错误信息 */
    error: z.string().nullable().optional()
  }).loose()

/**
 * 成功响应判断配置 Schema
 */
export const apiSuccessConfigSchema = z.object({
  /**
   * 成功状态码列表
   * @defaultValue [200, 0]
   */
  successCodes: z.array(z.union([z.number(), z.string()])).default([200, 0]),
  /**
   * 状态码字段名
   * @defaultValue 'code'
   */
  codeKey: z.string().default('code'),
  /**
   * 消息字段名
   * @defaultValue 'message'
   */
  messageKey: z.string().default('message'),
  /**
   * 数据字段名
   * @defaultValue 'data'
   */
  dataKey: z.string().default('data')
})

/**
 * Session 管理配置 Schema
 * 用于登录流程中自动设置 nuxt-auth-utils session
 */
export const apiSessionConfigSchema = z.object({
  /**
   * 是否启用 session 自动管理
   * @defaultValue false
   */
  enabled: z.boolean().default(false),

  /**
   * 用户信息接口路径
   * 登录成功后自动调用此接口获取用户信息
   * 如果不设置，则从登录响应中提取用户信息
   */
  userInfoPath: z.string().optional(),

  /**
   * 从登录响应中提取 token 的路径
   * @defaultValue 'data.token'
   */
  tokenPath: z.string().default('data.token'),

  /**
   * 用户信息在响应中的路径
   * @defaultValue 'data'
   */
  userDataPath: z.string().default('data'),

  /**
   * session 中存储 token 的路径
   * @defaultValue 'token'
   */
  sessionTokenPath: z.string().default('token')
})

/**
 * Auth 认证配置 Schema
 * 使用 nuxt-auth-utils 进行认证管理
 */
export const apiAuthConfigSchema = z.object({
  /**
   * 是否启用认证
   * @defaultValue false
   */
  enabled: z.boolean().default(false),
  /**
   * Token 来源
   * - 'session': 从 nuxt-auth-utils 的 session 中获取 (推荐)
   * - 'custom': 使用自定义 tokenGetter
   * @defaultValue 'session'
   */
  tokenSource: z.enum(['session', 'custom']).default('session'),
  /**
   * Session 中 token 的路径
   *
   * 例如：
   * - 'token' -> session.token
   * - 'user.token' -> session.user.token
   *
   * @defaultValue 'token'
   */
  sessionTokenPath: z.string().default('token'),
  /**
   * Token 类型
   * @defaultValue 'Bearer'
   */
  tokenType: z.enum(['Bearer', 'Basic', 'Custom']).default('Bearer'),
  /**
   * 自定义 Token 类型值
   * 当 tokenType 为 'Custom' 时使用
   */
  customTokenType: z.string().optional(),
  /**
   * 自定义 Header 名称
   * @defaultValue 'Authorization'
   */
  headerName: z.string().default('Authorization'),
  /**
   * 401 错误时是否自动跳转登录页
   * @defaultValue true
   */
  redirectOnUnauthorized: z.boolean().default(true),
  /**
   * 登录页路径
   * @defaultValue '/login'
   */
  loginPath: z.string().default('/login'),
  /**
   * 是否在 401 时自动清除 session
   * @defaultValue true
   */
  clearSessionOnUnauthorized: z.boolean().default(true)
})

/**
 * Toast 提示配置 Schema
 * @see https://ui.nuxt.com/docs/composables/use-toast
 */
export const apiToastConfigSchema = z.object({
  /**
   * 是否全局启用提示
   * @defaultValue true
   */
  enabled: z.boolean().default(true),
  /** 成功提示配置 */
  success: z.object({
    /**
     * 是否显示成功提示
     * @defaultValue true
     */
    show: z.boolean().default(true),
    /**
     * 默认颜色
     * @defaultValue 'success'
     */
    color: z.string().default('success'),
    /**
     * 默认图标
     */
    icon: z.string().optional(),
    /**
     * 持续时间 (ms)
     * @defaultValue 3000
     */
    duration: z.number().default(3000)
  }).loose().optional(),
  /** 错误提示配置 */
  error: z.object({
    /**
     * 是否显示错误提示
     * @defaultValue true
     */
    show: z.boolean().default(true),
    /**
     * 默认颜色
     * @defaultValue 'error'
     */
    color: z.string().default('error'),
    /**
     * 默认图标
     */
    icon: z.string().optional(),
    /**
     * 持续时间 (ms)
     * @defaultValue 5000
     */
    duration: z.number().default(5000)
  }).loose().optional()
})

/**
 * 单个 API 端点配置 Schema
 */
export const apiEndpointConfigSchema = z.object({
  /** 基础 URL */
  baseURL: z.string(),
  /** 端点别名 */
  alias: z.string().optional(),
  /** 该端点的认证配置 */
  auth: apiAuthConfigSchema.partial().optional(),
  /** 该端点的 Toast 配置 */
  toast: apiToastConfigSchema.partial().optional(),
  /** 该端点的成功判断配置 */
  success: apiSuccessConfigSchema.partial().optional(),
  /** 默认请求头 */
  headers: z.record(z.string(), z.string()).optional()
})

/**
 * Movk API 模块配置 Schema
 */
export const movkApiModuleOptionsSchema = z.object({
  /**
   * 是否启用 API 功能
   * @defaultValue true
   */
  enabled: z.boolean().default(true),
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint: z.string().default('default'),
  /**
   * API 端点配置
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints: z.record(z.string(), apiEndpointConfigSchema).default({
    default: { baseURL: '/api' }
  }),
  /**
   * 全局认证配置
   */
  auth: apiAuthConfigSchema.optional(),
  /**
   * 全局 Toast 配置
   */
  toast: apiToastConfigSchema.optional(),
  /**
   * 全局成功判断配置
   */
  success: apiSuccessConfigSchema.optional(),
  /**
   * 是否启用调试模式
   * @defaultValue false
   */
  debug: z.boolean().default(false)
}).transform(data => ({
  ...data,
  // 使用 schema 解析确保默认值生效
  auth: apiAuthConfigSchema.parse(data.auth ?? {}),
  toast: apiToastConfigSchema.parse(data.toast ?? {}),
  success: apiSuccessConfigSchema.parse(data.success ?? {})
}))

// ==================== 导出类型 ====================

export type ApiResponseBase<T = unknown> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>
export type ApiSuccessConfig = z.infer<typeof apiSuccessConfigSchema>
export type ApiSessionConfig = z.infer<typeof apiSessionConfigSchema>
export type ApiAuthConfig = z.infer<typeof apiAuthConfigSchema>
export type ApiToastConfig = z.infer<typeof apiToastConfigSchema>
export type ApiEndpointConfig = z.infer<typeof apiEndpointConfigSchema>
export type MovkApiModuleOptions = z.infer<typeof movkApiModuleOptionsSchema>

/**
 * 解析 API 模块配置
 */
export function parseMovkApiOptions(options: unknown): MovkApiModuleOptions {
  return movkApiModuleOptionsSchema.parse(options)
}

/**
 * 安全解析 API 模块配置
 */
export function safeParseMovkApiOptions(options: unknown) {
  return movkApiModuleOptionsSchema.safeParse(options)
}
