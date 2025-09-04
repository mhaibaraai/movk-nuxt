import type { ZodError, ZodType } from 'zod/v4'
import * as z from 'zod/v4'

// Zod 类型工具
export function getZodType(schema: ZodType): string {
  // @ts-expect-error internal
  return schema?.def?.typeName ?? 'Unknown'
}

export function isOptional(schema: ZodType): boolean {
  // @ts-expect-error internal
  return getZodType(schema) === z.ZodFirstPartyTypeKind.ZodOptional
}

export function isDefault(schema: ZodType): boolean {
  // @ts-expect-error internal
  return getZodType(schema) === z.ZodFirstPartyTypeKind.ZodDefault
}

export function unwrapOptionalDefault<T extends ZodType>(schema: T): ZodType {
  let cur: any = schema
  while (cur?.def?.innerType) cur = cur.def.innerType
  return cur as ZodType
}

export function isEnum(schema: ZodType): boolean {
  // @ts-expect-error internal
  return getZodType(schema) === z.ZodFirstPartyTypeKind.ZodEnum
}

export function isNativeEnum(schema: ZodType): boolean {
  // @ts-expect-error internal
  return getZodType(schema) === z.ZodFirstPartyTypeKind.ZodNativeEnum
}

// Path 工具
export function joinPath(parent: string | undefined, key: string | number): string {
  if (parent == null || parent === '')
    return String(key)
  if (typeof key === 'number')
    return `${parent}[${key}]`
  return `${parent}.${key}`
}

export function stringifyPath(path: (string | number)[]): string {
  let out = ''
  for (const seg of path) out = joinPath(out, seg)
  return out
}

export function parsePath(path: string): (string | number)[] {
  // 简易解析：foo.bar[0].baz → ['foo','bar',0,'baz']
  const result: (string | number)[] = []
  const regex = /[^.[\]]+|\[(\d+)\]/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(path))) {
    if (m[1] != null)
      result.push(Number(m[1]))
    else result.push(m[0])
  }
  return result
}

export function stableItemKey(index: number, value: unknown): string {
  const hint = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
  return `i:${index}|h:${hint}`
}

// 错误映射
export interface FormError {
  path: string
  message: string
}

export function zodErrorsToFormErrors(err: ZodError | undefined): FormError[] {
  if (!err)
    return []
  return err.issues.map(issue => ({
    path: stringifyPath(issue.path as (string | number)[]),
    message: issue.message,
  }))
}

// 支持 refine/superRefine 的跨字段错误聚合（附加全局错误路径到根 '__root__'）
export function aggregateZodErrors(err: ZodError | undefined): { fieldErrors: FormError[], formErrors: string[] } {
  if (!err)
    return { fieldErrors: [], formErrors: [] }
  const fieldErrors: FormError[] = []
  const formErrors: string[] = []
  for (const issue of err.issues) {
    if (issue.path && issue.path.length > 0) {
      fieldErrors.push({ path: stringifyPath(issue.path as (string | number)[]), message: issue.message })
    }
    else {
      formErrors.push(issue.message)
    }
  }
  return { fieldErrors, formErrors }
}
