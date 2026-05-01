import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  classifyFields,
  collectFieldDefaults,
  extractEnumValuesFromItems,
  isLeafField
} from '../../../src/runtime/domains/auto-form/fields'
import { AUTOFORM_META } from '../../../src/runtime/constants/auto-form'
import type { AutoFormField } from '../../../src/runtime/types/auto-form'

vi.mock('#components', () => ({
  UButton: 'UButton',
  UIcon: 'UIcon'
}))

function createField(partial: Partial<AutoFormField>): AutoFormField {
  return {
    path: partial.path ?? '',
    schema: partial.schema ?? z.any(),
    meta: partial.meta ?? {},
    decorators: partial.decorators ?? {},
    children: partial.children,
    arrayElement: partial.arrayElement
  }
}

describe('auto-form fields', () => {
  it('classifyFields 按字段类型正确分组', () => {
    const fields: [AutoFormField, AutoFormField, AutoFormField, AutoFormField] = [
      createField({ path: 'name', meta: { type: 'string' } }),
      createField({ path: 'profile', meta: { type: 'object' } }),
      createField({ path: 'tags', meta: { type: 'array' } }),
      createField({ path: 'layout', meta: { type: AUTOFORM_META.LAYOUT_KEY } })
    ]
    const [nameField, profileField] = fields

    const result = classifyFields(fields)

    expect(result.leafFields.map(field => field.path)).toEqual(['name'])
    expect(result.nestedFields.map(field => field.path)).toEqual(['profile'])
    expect(result.arrayFields.map(field => field.path)).toEqual(['tags'])
    expect(result.layoutFields.map(field => field.path)).toEqual(['layout'])
    expect(result.hasComplexFields).toBe(true)
    expect(isLeafField(nameField)).toBe(true)
    expect(isLeafField(profileField)).toBe(false)
  })

  it('collectFieldDefaults 递归收集对象字段默认值', () => {
    const field = createField({
      path: 'profile',
      meta: { type: 'object' },
      children: [
        createField({
          path: 'profile.name',
          meta: { type: 'string' },
          decorators: { defaultValue: 'movk' }
        }),
        createField({
          path: 'profile.nested',
          meta: { type: 'object' },
          children: [
            createField({
              path: 'profile.nested.age',
              meta: { type: 'number' },
              decorators: { defaultValue: 18 }
            })
          ]
        })
      ]
    })

    expect(collectFieldDefaults(field)).toEqual({
      name: 'movk',
      nested: { age: 18 }
    })
  })

  it('extractEnumValuesFromItems 支持对象项、label、valueKey 与分隔项过滤', () => {
    const values = extractEnumValuesFromItems([
      [{ label: '启用', value: 'enabled' }, { code: 'disabled' }],
      { type: 'separator' },
      'draft'
    ], 'code')

    expect(values).toEqual(['enabled', 'disabled', 'draft'])
  })
})
