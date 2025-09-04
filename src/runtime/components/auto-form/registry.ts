import * as z from 'zod/v4'
import type { AutoFormRegistryMeta } from '../../types'

// Zod v4 自定义注册表，承载 AutoForm 元数据
export const autoFormRegistry = z.registry<AutoFormRegistryMeta>()

// 读取优先顺序：
// 1) 本地 schema 实例的 .meta()
// 2) autoFormRegistry 中的注册项
export function getMeta<TOutput = unknown>(schema: z.ZodType): AutoFormRegistryMeta | undefined {
  const local = schema.meta?.()
  if (local && Object.keys(local).length > 0)
    return local as AutoFormRegistryMeta
  const reg = autoFormRegistry.get(schema) as AutoFormRegistryMeta | undefined
  return reg
}

export function setMeta(schema: z.ZodType, meta: AutoFormRegistryMeta) {
  // 同步到全局注册表，支持 .register 的使用体验
  autoFormRegistry.add(schema, meta)
  return schema
}


