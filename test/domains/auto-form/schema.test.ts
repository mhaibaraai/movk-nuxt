import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { AUTOFORM_META } from '../../../src/runtime/domains/auto-form/constants'
import { applyMeta } from '../../../src/runtime/domains/auto-form/metadata'
import { extractPureSchema, introspectSchema, omitFields } from '../../../src/runtime/domains/auto-form/schema'
import { useAutoForm } from '../../../src/runtime/composables/useAutoForm'

// controls 顶层 import 了多个 .vue 文件，vitest 默认无 @vitejs/plugin-vue 会解析失败；按 useAutoForm.test.ts 的方式打桩
vi.mock('../../../src/runtime/domains/auto-form/controls', () => ({
  DEFAULT_CONTROLS: {},
  defineControl: <T>(control: T) => control
}))

// fields.ts 顶层 import 了 #components（Nuxt 自动导入），在 vitest 中无法解析；仅打桩 useAutoForm 需要的函数
vi.mock('../../../src/runtime/domains/auto-form/fields', () => ({
  extractEnumValuesFromItems: () => []
}))

describe('auto-form schema', () => {
  const { afz } = useAutoForm()

  const mapping = {
    string: { component: 'Input', controlProps: { class: 'w-full' } },
    number: { component: 'InputNumber', controlProps: { class: 'w-full' } }
  } as any

  it('introspectSchema 解析对象字段、默认 label 与控件映射', () => {
    const schema = afz.object({
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

    const schema = afz.object({
      hero: layoutField,
      status: z.string()
    })

    const pureSchema = extractPureSchema(schema)
    const shape = (pureSchema as any).shape

    expect(Object.keys(shape)).toEqual(['title', 'count', 'status'])
  })

  describe('omitFields（meta.if 隐藏字段不参与校验）', () => {
    const schema = afz.object({
      username: z.string().min(1),
      password: z.string().min(6)
    })

    it('剔除隐藏字段后，该字段不再参与校验', () => {
      const omitted = omitFields(schema, ['password'])

      expect(Object.keys((omitted as any).shape)).toEqual(['username'])
      expect(omitted.safeParse({ username: 'admin' }).success).toBe(true)
    })

    it('不剔除时保留必填校验', () => {
      expect(schema.safeParse({ username: 'admin' }).success).toBe(false)
      expect(omitFields(schema, []).safeParse({ username: 'admin' }).success).toBe(false)
    })

    it('忽略不存在的 key，返回原 schema', () => {
      const result = omitFields(schema, ['nope'])

      expect(Object.keys((result as any).shape)).toEqual(['username', 'password'])
    })
  })
})
