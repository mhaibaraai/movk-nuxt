import type { ZodAny, ZodObject } from 'zod/v4'
import type { AutoFormOptions, FieldMeta } from '../../types'
import { isFunction } from '@movk/core'
import { resolveControl } from './mapper'

export function useFieldTree(schema: ZodObject<any>, options: AutoFormOptions = {}) {
  const shape = schema.shape as Record<string, ZodAny>
  const fields = Object.entries(shape).map(([key, value]) => {
    const meta = isFunction(value.meta) ? value.meta() : value.meta || {}
    return {
      key,
      meta,
      control: resolveControl(meta as FieldMeta, options),
    }
  })
  return {
    fields,
  }
}
