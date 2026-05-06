import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { AUTOFORM_META } from '../../../src/runtime/domains/auto-form/constants'
import { applyMeta } from '../../../src/runtime/domains/auto-form/metadata'
import { extractPureSchema, introspectSchema } from '../../../src/runtime/domains/auto-form/schema'
import type { AutoFormControls } from '../../../src/runtime/types/auto-form'

describe('auto-form schema', () => {
  const mapping = {
    string: { component: 'Input', controlProps: { class: 'w-full' } },
    number: { component: 'InputNumber', controlProps: { class: 'w-full' } }
  } satisfies AutoFormControls

  it('introspectSchema 解析对象字段、默认 label 与控件映射', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().optional()
    })

    const fields = introspectSchema(schema, mapping, '')

    expect(fields.map(field => field.path)).toEqual(['name', 'age'])
    expect(fields[0]?.meta.label).toBe('Name')
    expect(fields[0]?.meta.component).toBe('Input')
    expect(fields[1]?.meta.required).toBe(false)
  })

  it('extractPureSchema 展开 layout 标记字段', () => {
    const layoutField = applyMeta(z.any(), {
      type: AUTOFORM_META.LAYOUT_KEY,
      layout: {
        fields: {
          title: z.string(),
          count: z.number()
        }
      }
    })

    const schema = z.object({
      hero: layoutField,
      status: z.string()
    })

    const pureSchema = extractPureSchema(schema)
    const shape = (pureSchema as any).shape

    expect(Object.keys(shape)).toEqual(['title', 'count', 'status'])
  })
})
