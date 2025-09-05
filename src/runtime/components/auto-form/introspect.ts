import type { ZodType } from 'zod/v4'
import { getMeta } from './registry'
import { resolveDiscriminatedUnionSchema } from './union'
import { joinPath, unwrapOptionalDefault } from './utils'

export interface IntrospectedField {
  path: string
  schema: ZodType
  zodType: string
  meta?: Record<string, any>
}

export function introspectSchema(schema: ZodType, parentPath = ''): IntrospectedField[] {
  const result: IntrospectedField[] = []
  const root = unwrapOptionalDefault(schema)
  const type = schema?.def?.type

  if (type === 'object') {
    const shape = (root as any).def.shape()
    for (const key of Object.keys(shape)) {
      const child = shape[key] as ZodType
      const path = joinPath(parentPath, key)
      result.push(...introspectSchema(child, path))
    }
    return result
  }

  if (type === 'array') {
    const item = (root as any).def.type
    const path = joinPath(parentPath, 0)
    result.push(...introspectSchema(item, path))
    return result
  }

  // 判别式联合
  if (type === 'union') {
    const resolved = resolveDiscriminatedUnionSchema(root, { discriminant: (getMeta(root) as any)?.discriminant })
    if (resolved)
      return introspectSchema(resolved, parentPath)
  }

  // 叶子字段
  result.push({
    path: parentPath,
    schema: root,
    zodType: type,
    meta: getMeta(root),
  })
  return result
}
