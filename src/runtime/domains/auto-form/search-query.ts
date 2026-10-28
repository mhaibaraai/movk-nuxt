import type { z } from 'zod'

type SearchState = Record<string, unknown>
export type SearchQuery = Record<string, string | null | Array<string | null> | undefined>

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

/** 默认的搜索载荷清洗：字符串去首尾空白，剔除空字符串、`undefined` 与 `null` */
export function cleanSearchPayload<T extends SearchState>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => !isEmpty(value))
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  ) as Partial<T>
}

/** 将搜索状态写成 URL query：数组保留为多值，对象以 JSON 编码，空值跳过 */
export function serializeSearchQuery(state: SearchState): SearchQuery {
  return Object.fromEntries(
    Object.entries(state)
      .filter(([, value]) => !isEmpty(value))
      .map(([key, value]) => {
        if (Array.isArray(value)) return [key, value.map(String)]
        if (typeof value === 'object') return [key, JSON.stringify(value)]
        return [key, String(value)]
      })
  )
}

function coreType(schema: z.ZodType): string | undefined {
  let current: any = schema
  while (current?._zod?.def?.innerType) current = current._zod.def.innerType
  return current?._zod?.def?.type
}

function parseValue(raw: string | null | Array<string | null>, type: string | undefined): unknown {
  const values = (Array.isArray(raw) ? raw : [raw]).filter((v): v is string => v !== null)
  const first = values[0]
  if (first === undefined) return undefined

  switch (type) {
    case 'array': return values
    case 'number': {
      const number = Number(first)
      return Number.isNaN(number) ? undefined : number
    }
    case 'boolean': return first === 'true' ? true : first === 'false' ? false : undefined
    case 'string':
    case 'enum':
      return first
    default:
      try {
        return JSON.parse(first)
      }
      catch {
        return type === undefined ? first : undefined
      }
  }
}

/** 按 schema 字段类型把 URL query 还原为搜索状态，忽略 schema 外的键与无法解析的值 */
export function parseSearchQuery(query: SearchQuery, schema: z.ZodObject): SearchState {
  const shape = schema.shape as Record<string, z.ZodType>
  return Object.fromEntries(
    Object.entries(query).flatMap(([key, raw]) => {
      const fieldSchema = shape[key]
      if (!fieldSchema || raw === undefined) return []
      const value = parseValue(raw, coreType(fieldSchema))
      return value === undefined ? [] : [[key, value]]
    })
  )
}
