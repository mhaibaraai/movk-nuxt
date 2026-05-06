import type { z } from 'zod'
import { isObject } from '@movk/core'
import { AUTOFORM_META } from './constants'

type AutoFormMetadata = Record<string, unknown>

/**
 * 应用元数据到 Zod schema
 */
export function applyMeta<T extends z.ZodType>(schema: T, meta?: unknown): T {
  const normalizedMeta = isObject(meta) ? meta as AutoFormMetadata : {}
  return schema.meta(normalizedMeta) as T
}

/**
 * 从 Zod schema 中提取 AutoForm 元数据
 *
 * 通过 BFS 遍历以下路径读取 meta：
 * - schema.meta() — Zod v4 全局 registry
 * - schema._zod.parent — .refine()/.check() 创建新实例时设置的父引用
 * - schema.unwrap() — 可选/默认值等包装类型
 * - schema.def.innerType / .in / .out / .schema — 结构性内层类型
 *
 * 收集所有层级的 meta 并合并，外层优先级更高。
 */
export function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  const queue: unknown[] = [schema]
  const visited = new Set<unknown>()
  const collectedMetas: AutoFormMetadata[] = []

  while (queue.length > 0) {
    const current = queue.shift() as any
    if (!current || visited.has(current))
      continue

    visited.add(current)

    const meta = typeof current.meta === 'function' ? current.meta() : undefined
    if (meta && isObject(meta)) {
      const typedMeta = meta as AutoFormMetadata
      const normalizedMeta = typedMeta?.[AUTOFORM_META.KEY] && isObject(typedMeta[AUTOFORM_META.KEY])
        ? typedMeta[AUTOFORM_META.KEY] as AutoFormMetadata
        : typedMeta
      collectedMetas.push(normalizedMeta)
    }

    if (typeof current.unwrap === 'function') {
      try {
        queue.push(current.unwrap())
      }
      catch {
        // unwrap 失败时忽略
      }
    }

    // 跟踪 Zod v4 的 _zod.parent 链路
    if (current?._zod?.parent)
      queue.push(current._zod.parent)

    const def = current?.def || current?._def
    if (def?.innerType)
      queue.push(def.innerType)
    if (def?.in)
      queue.push(def.in)
    if (def?.out)
      queue.push(def.out)
    if (def?.schema)
      queue.push(def.schema)
  }

  if (collectedMetas.length === 0)
    return {}

  // 内层 meta 提供基础字段，外层 meta 覆盖
  return Object.assign({}, ...collectedMetas.reverse())
}

/**
 * 提取错误消息和元数据
 * @returns [errorMessage, metadata]
 */
export function extractErrorAndMeta(controlMeta?: any): [string | undefined, any] {
  if (typeof controlMeta === 'string') {
    return [controlMeta, undefined]
  }

  if (controlMeta && isObject(controlMeta) && 'error' in controlMeta) {
    const { error, ...meta } = controlMeta
    return [error, meta]
  }

  return [undefined, controlMeta]
}
