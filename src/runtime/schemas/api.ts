import { z } from 'zod/v4'

// ==================== API 响应 Schema ====================

/**
 * 标准 API 响应结构 Schema
 * 支持不同后端返回格式
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    /** 状态码 - 支持 code/status 等多种命名 */
    code: z.union([z.number(), z.string()]).optional(),
    status: z.union([z.number(), z.string()]).optional(),
    /** 消息字段 - 支持 msg/message 等多种命名 */
    msg: z.string().optional(),
    message: z.string().optional(),
    /** 数据字段 */
    data: dataSchema.optional(),
    result: dataSchema.optional(),
    token: z.string().optional(),
    /** 错误信息 */
    error: z.string().nullable().optional()
  }).loose()

// ==================== 成功响应配置 Schema ====================

/**
 * 成功响应判断配置 Schema
 */
export const apiSuccessConfigSchema = z.object({
  /** 成功状态码列表，默认 [200, 0] */
  successCodes: z.array(z.union([z.number(), z.string()])).default([200, 0]),
  /** 状态码字段名，默认 'code' */
  codeKey: z.string().default('code'),
  /** 消息字段名，默认 'msg' */
  messageKey: z.string().default('msg'),
  /** 数据字段名，默认 'data' */
  dataKey: z.string().default('data')
})

// ==================== 认证配置 Schema ====================

/**
 * Auth 认证配置 Schema
 * 使用 nuxt-auth-utils 进行认证管理
 */
export const apiAuthConfigSchema = z.object({
  /** 是否启用认证，默认 false */
  enabled: z.boolean().default(false),
  /**
   * Token 来源
   * - 'session': 从 nuxt-auth-utils 的 session 中获取 (推荐)
   * - 'custom': 使用自定义 tokenGetter
   */
  tokenSource: z.enum(['session', 'custom']).default('session'),
  /** Session 中 token 的路径，默认 'secure.token' (用于 nuxt-auth-utils) */
  sessionTokenPath: z.string().default('secure.token'),
  /** Token 类型，默认 'Bearer' */
  tokenType: z.enum(['Bearer', 'Basic', 'Custom']).default('Bearer'),
  /** 自定义 Token 类型值 (当 tokenType 为 'Custom' 时使用) */
  customTokenType: z.string().optional(),
  /** 自定义 Header 名称，默认 'Authorization' */
  headerName: z.string().default('Authorization'),
  /** 401 错误时是否自动跳转登录页 */
  redirectOnUnauthorized: z.boolean().default(true),
  /** 登录页路径 */
  loginPath: z.string().default('/login'),
  /** 是否在 401 时自动清除 session */
  clearSessionOnUnauthorized: z.boolean().default(true)
})

// ==================== Toast 配置 Schema ====================

/**
 * Toast 提示配置 Schema
 */
export const apiToastConfigSchema = z.object({
  /** 是否全局启用提示，默认 true */
  enabled: z.boolean().default(true),
  /** 成功提示配置 */
  success: z.object({
    /** 是否显示成功提示，默认 true */
    show: z.boolean().default(true),
    /** 默认颜色 */
    color: z.string().default('success'),
    /** 持续时间 (ms) */
    duration: z.number().default(3000)
  }).loose().optional(),
  /** 错误提示配置 */
  error: z.object({
    /** 是否显示错误提示，默认 true */
    show: z.boolean().default(true),
    /** 默认颜色 */
    color: z.string().default('error'),
    /** 持续时间 (ms) */
    duration: z.number().default(5000)
  }).loose().optional()
})

// ==================== 请求 Toast 配置 Schema ====================

/**
 * 单次请求的 Toast 配置 Schema
 */
export const requestToastOptionsSchema = z.object({
  /** 是否显示提示 */
  show: z.boolean().optional(),
  /** 成功提示配置 */
  success: z.union([
    z.object({
      color: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      duration: z.number().optional()
    }).loose(),
    z.literal(false)
  ]).optional(),
  /** 错误提示配置 */
  error: z.union([
    z.object({
      color: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      duration: z.number().optional()
    }).loose(),
    z.literal(false)
  ]).optional(),
  /** 自定义成功消息 */
  successMessage: z.string().optional(),
  /** 自定义错误消息 */
  errorMessage: z.string().optional()
})

// ==================== 请求配置 Schema ====================

/**
 * 单次请求配置 Schema
 */
export const requestOptionsSchema = z.object({
  /** 是否携带认证信息，覆盖全局配置 */
  auth: z.boolean().optional(),
  /** Toast 配置 */
  toast: z.union([requestToastOptionsSchema, z.literal(false)]).optional(),
  /** 是否解包响应数据，直接返回 data 字段 */
  unwrap: z.boolean().default(true),
  /** 请求超时时间 (ms) */
  timeout: z.number().optional(),
  /** 重试次数 */
  retry: z.union([z.number(), z.literal(false)]).optional(),
  /** 重试延迟 (ms) */
  retryDelay: z.number().optional()
})

// ==================== API 端点配置 Schema ====================

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
  headers: z.record(z.string(), z.string()).optional(),
  /** 请求超时时间 (ms) */
  timeout: z.number().optional()
})

// ==================== 模块配置 Schema ====================

/**
 * Movk API 模块配置 Schema
 */
export const movkApiModuleOptionsSchema = z.object({
  /** 是否启用 API 功能，默认 true */
  enabled: z.boolean().default(true),
  /** 默认使用的端点名称，默认 'default' */
  defaultEndpoint: z.string().default('default'),
  /** API 端点配置 */
  endpoints: z.record(z.string(), apiEndpointConfigSchema).optional(),
  /** 全局认证配置 */
  auth: apiAuthConfigSchema.partial().optional(),
  /** 全局 Toast 配置 */
  toast: apiToastConfigSchema.partial().optional(),
  /** 全局成功判断配置 */
  success: apiSuccessConfigSchema.partial().optional(),
  /** 是否启用调试模式 */
  debug: z.boolean().default(false)
})

// ==================== 导出类型 ====================

export type ApiResponseBase<T = unknown> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>
export type ApiSuccessConfig = z.infer<typeof apiSuccessConfigSchema>
export type ApiAuthConfig = z.infer<typeof apiAuthConfigSchema>
export type ApiToastConfig = z.infer<typeof apiToastConfigSchema>
export type RequestToastOptions = z.infer<typeof requestToastOptionsSchema>
export type RequestOptions = z.infer<typeof requestOptionsSchema>
export type ApiEndpointConfig = z.infer<typeof apiEndpointConfigSchema>
export type MovkApiModuleOptions = z.infer<typeof movkApiModuleOptionsSchema>

// ==================== 解析函数 ====================

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
