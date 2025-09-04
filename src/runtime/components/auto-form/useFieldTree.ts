import type { ZodType } from 'zod/v4'
import type { AutoFormOptions, FieldMeta } from '../../types'
import { computed } from 'vue'
import { introspectSchema } from './introspect'
import { resolveControl } from './mapper'

export interface FieldNode {
  path: string
  meta?: FieldMeta
  control: ReturnType<typeof resolveControl>
}

export function useFieldTree(schema: ZodType, options: AutoFormOptions = {}) {
  const fields = computed<FieldNode[]>(() => {
    const entries = introspectSchema(schema)
    return entries.map(e => ({
      path: e.path,
      meta: e.meta as FieldMeta | undefined,
      control: resolveControl(e.meta as FieldMeta, options),
    }))
  })

  return {
    fields,
  }
}
