import { z } from 'zod/v4'

/**
 * API 响应配置 Schema
 * @description 定义业务状态码判断规则和数据/消息字段的映射关系
 */
export const apiResponseConfigSchema = z.object({
  /**
   * 表示成功的业务状态码列表
   * @defaultValue [200, 0]
   */
  successCodes: z.array(z.union([z.number(), z.string()])).default([200, 0]),
  /**
   * 响应中业务状态码的字段名
   * @defaultValue 'code'
   */
  codeKey: z.string().default('code'),
  /**
   * 响应中消息内容的字段名
   * @defaultValue 'message'
   */
  messageKey: z.string().default('message'),
  /**
   * 响应中业务数据的字段名
   * @defaultValue 'data'
   */
  dataKey: z.string().default('data')
})

/**
 * 401 未授权处理配置 Schema
 * @description 定义当接收到 401 响应时的自动处理行为
 */
export const apiUnauthorizedConfigSchema = z.object({
  /**
   * 是否自动重定向到登录页
   * @defaultValue false
   */
  redirect: z.boolean().default(false),
  /**
   * 登录页路径
   * @defaultValue '/login'
   */
  loginPath: z.string().default('/login'),
  /**
   * 是否清除用户会话
   * @defaultValue false
   */
  clearSession: z.boolean().default(false)
})

/**
 * API 认证配置 Schema
 * @description 定义认证令牌的来源、格式和请求头配置
 */
export const apiAuthConfigSchema = z.object({
  /**
   * 是否启用认证
   * @defaultValue false
   */
  enabled: z.boolean().default(false),
  /**
   * 令牌来源类型
   * @defaultValue 'session'
   */
  tokenSource: z.enum(['session', 'custom']).default('session'),
  /**
   * 令牌在会话对象中的路径（支持点号分隔的嵌套路径）
   * @defaultValue 'token'
   */
  sessionTokenPath: z.string().default('token'),
  /**
   * 令牌类型前缀
   * @defaultValue 'Bearer'
   */
  tokenType: z.enum(['Bearer', 'Basic', 'Custom']).default('Bearer'),
  /** 自定义令牌类型前缀（当 tokenType 为 'Custom' 时使用） */
  customTokenType: z.string().optional(),
  /**
   * 认证请求头名称
   * @defaultValue 'Authorization'
   */
  headerName: z.string().default('Authorization'),
  /** 401 未授权处理配置 */
  unauthorized: apiUnauthorizedConfigSchema.optional()
})

/**
 * Toast 提示配置 Schema
 * @description 定义成功和错误提示的全局样式和行为
 */
export const apiToastConfigSchema = z.looseObject({
  /**
   * 是否启用 Toast 提示
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
     * 提示颜色
     * @defaultValue 'success'
     */
    color: z.string().default('success'),
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-check'
     */
    icon: z.string().optional(),
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration: z.number().default(3000)
  }).optional(),
  /** 错误提示配置 */
  error: z.looseObject({
    /**
     * 是否显示错误提示
     * @defaultValue true
     */
    show: z.boolean().default(true),
    /**
     * 提示颜色
     * @defaultValue 'error'
     */
    color: z.string().default('error'),
    /**
     * 图标类名
     * @defaultValue 'i-lucide-circle-x'
     */
    icon: z.string().optional(),
    /**
     * 显示时长（毫秒）
     * @defaultValue 3000
     */
    duration: z.number().default(3000)
  }).optional()
})

/**
 * API 认证部分配置 Schema
 * @description 用于端点级别的认证配置覆盖（所有字段均可选）
 * @internal
 */
const apiAuthPartialSchema = z.object({
  /** 是否启用认证 */
  enabled: z.boolean().optional(),
  /** 令牌来源类型 */
  tokenSource: z.enum(['session', 'custom']).optional(),
  /** 令牌在会话对象中的路径（支持点号分隔的嵌套路径） */
  sessionTokenPath: z.string().optional(),
  /** 令牌类型前缀 */
  tokenType: z.enum(['Bearer', 'Basic', 'Custom']).optional(),
  /** 自定义令牌类型前缀（当 tokenType 为 'Custom' 时使用） */
  customTokenType: z.string().optional(),
  /** 认证请求头名称 */
  headerName: z.string().optional(),
  /** 401 未授权处理配置 */
  unauthorized: z.object({
    /** 是否自动重定向到登录页 */
    redirect: z.boolean().optional(),
    /** 登录页路径 */
    loginPath: z.string().optional(),
    /** 是否清除用户会话 */
    clearSession: z.boolean().optional()
  }).optional()
}).optional()

/**
 * API 端点公共配置 Schema
 * @description 定义单个 API 端点的配置（可在客户端访问的配置）
 */
export const apiEndpointPublicConfigSchema = z.object({
  /** 端点的基础 URL */
  baseURL: z.string(),
  /** 端点别名（用于标识） */
  alias: z.string().optional(),
  /** 端点级别的认证配置（覆盖全局配置） */
  auth: apiAuthPartialSchema,
  /** 端点级别的 Toast 配置（覆盖全局配置） */
  toast: apiToastConfigSchema.partial().optional(),
  /** 端点级别的响应配置（覆盖全局配置） */
  response: apiResponseConfigSchema.partial().optional()
})

/**
 * API 端点私有配置 Schema
 * @description 定义仅在服务端可访问的端点配置（不会暴露给客户端）
 */
export const apiEndpointPrivateConfigSchema = z.object({
  /** 自定义请求头（仅服务端使用，不会暴露给客户端） */
  headers: z.record(z.string(), z.string()).optional()
})

/**
 * Movk API 模块公共配置 Schema
 * @description 定义模块的全局配置（可在客户端访问）
 */
export const movkApiPublicConfigSchema = z.object({
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint: z.string().default('default'),
  /**
   * 是否启用调试模式（在控制台输出请求和响应日志）
   * @defaultValue false
   */
  debug: z.boolean().default(false),
  /**
   * 端点配置映射
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints: z.record(z.string(), apiEndpointPublicConfigSchema).default({
    default: { baseURL: '/api' }
  }),
  /** 全局响应配置 */
  response: apiResponseConfigSchema.optional(),
  /** 全局认证配置 */
  auth: apiAuthConfigSchema.optional(),
  /** 全局 Toast 配置 */
  toast: apiToastConfigSchema.optional()
}).transform(data => ({
  ...data,
  response: apiResponseConfigSchema.parse(data.response ?? {}),
  auth: apiAuthConfigSchema.parse(data.auth ?? {}),
  toast: apiToastConfigSchema.parse(data.toast ?? {})
}))

/**
 * Movk API 模块私有配置 Schema
 * @description 定义模块的私有配置（仅服务端可访问，不会暴露给客户端）
 */
export const movkApiPrivateConfigSchema = z.object({
  /** 各端点的私有配置 */
  endpoints: z.record(z.string(), apiEndpointPrivateConfigSchema).optional()
})

/**
 * Movk API 模块完整配置 Schema
 * @description 定义模块的完整配置（公共+私有），用于模块初始化时的配置验证
 */
export const movkApiFullConfigSchema = z.object({
  /**
   * 是否启用 API 模块
   * @defaultValue true
   */
  enabled: z.boolean().default(true),
  /**
   * 默认使用的端点名称
   * @defaultValue 'default'
   */
  defaultEndpoint: z.string().default('default'),
  /**
   * 是否启用调试模式
   * @defaultValue false
   */
  debug: z.boolean().default(false),
  /**
   * 端点配置映射（包含公共和私有配置）
   * @defaultValue { default: { baseURL: '/api' } }
   */
  endpoints: z.record(
    z.string(),
    apiEndpointPublicConfigSchema.extend(apiEndpointPrivateConfigSchema.shape)
  ).default({ default: { baseURL: '/api' } }),
  /** 全局响应配置 */
  response: apiResponseConfigSchema.optional(),
  /** 全局认证配置 */
  auth: apiAuthConfigSchema.optional(),
  /** 全局 Toast 配置 */
  toast: apiToastConfigSchema.optional()
})
