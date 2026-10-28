import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  classifyFields,
  collectFieldDefaults,
  extractEnumValuesFromItems,
  isLeafField,
  remapFieldPath
} from '../../../src/runtime/domains/auto-form/fields'
import { AUTOFORM_META } from '../../../src/runtime/domains/auto-form/constants'
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

  it('collectFieldDefaults 处理父路径中重复出现的段名', () => {
    const field = createField({
      path: 'list[0].list',
      meta: { type: 'object' },
      children: [
        createField({ path: 'list[0].list.list', meta: { type: 'string' }, decorators: { defaultValue: 'x' } })
      ]
    })

    expect(collectFieldDefaults(field)).toEqual({ list: 'x' })
  })

  describe('remapFieldPath', () => {
    const template = createField({
      path: 'list',
      meta: { type: 'object' },
      children: [
        createField({ path: 'list.name', meta: { type: 'string' } }),
        createField({
          path: 'list.sub',
          meta: { type: 'array' },
          arrayElement: createField({
            path: 'list.sub',
            meta: { type: 'object' },
            children: [createField({ path: 'list.sub.list', meta: { type: 'string' } })]
          })
        })
      ]
    })

    it('按段替换前缀，并递归处理 children 与 arrayElement', () => {
      const item = remapFieldPath(template, 'list', 'list[1]')

      expect(item.path).toBe('list[1]')
      expect(item.children?.[0]?.path).toBe('list[1].name')
      expect(item.children?.[1]?.path).toBe('list[1].sub')
      expect(item.children?.[1]?.arrayElement?.path).toBe('list[1].sub')
      expect(item.children?.[1]?.arrayElement?.children?.[0]?.path).toBe('list[1].sub.list')
    })

    it('不修改原字段', () => {
      remapFieldPath(template, 'list', 'list[1]')
      expect(template.children?.[0]?.path).toBe('list.name')
    })

    it('嵌套数组项在已带索引的路径上继续重映射', () => {
      const inner = remapFieldPath(template, 'list', 'list[1]').children![1]!.arrayElement!
      const innerItem = remapFieldPath(inner, 'list[1].sub', 'list[1].sub[0]')

      expect(innerItem.children?.[0]?.path).toBe('list[1].sub[0].list')
    })

    it('对象内的数组（路径带点）同样正确', () => {
      const element = createField({ path: 'user.tags', meta: { type: 'string' } })
      expect(remapFieldPath(element, 'user.tags', 'user.tags[2]').path).toBe('user.tags[2]')
    })
  })
})
