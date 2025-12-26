import { z } from 'zod/v4'
import { movkApiModuleOptionsSchema } from './api'

/**
 * Movk 模块配置 Schema
 */
export const moduleOptionsSchema = z.object({
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix: z.string().default('M'),
  /**
   * API 模块配置
   */
  api: movkApiModuleOptionsSchema.optional()
})
