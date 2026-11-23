import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { AUTOFORM_META } from '../../../src/runtime/domains/auto-form/constants'
import { applyMeta } from '../../../src/runtime/domains/auto-form/metadata'
import { extractPureSchema, getArrayLengthBounds, introspectSchema, omitPaths } from '../../../src/runtime/domains/auto-form/schema'
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

  it('extractPureSchema 保留根 refinement 与 strict 设置', () => {
    const layoutField = applyMeta(z.any(), {
      type: AUTOFORM_META.LAYOUT_KEY,
      layout: { fields: { a: z.string() } }
    })
    const schema = z.strictObject({ hero: layoutField, b: z.string() })
      .refine(v => v.b !== 'bad', { message: 'refined' })

    const pure = extractPureSchema(schema)

    expect(pure.safeParse({ a: 'x', b: 'bad' }).error?.issues[0]?.message).toBe('refined')
    expect(pure.safeParse({ a: 'x', b: 'ok', extra: 1 }).success).toBe(false)
  })

  it('extractPureSchema 展开嵌套对象中的 layout', () => {
    const layoutField = applyMeta(z.any(), {
      type: AUTOFORM_META.LAYOUT_KEY,
      layout: { fields: { city: z.string() } }
    })
    const schema = z.object({ address: z.object({ row: layoutField }).optional() })

    const pure = extractPureSchema(schema)

    expect(pure.safeParse({ address: {} }).success).toBe(false)
    expect(pure.safeParse({ address: { city: 'x' } }).success).toBe(true)
    expect(pure.safeParse({}).success).toBe(true)
  })

  describe('omitPaths（meta.if 隐藏字段不参与校验）', () => {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(6),
      profile: z.object({
        phone: z.string(),
        email: z.string()
      }).optional()
    })

    it('剔除顶层隐藏字段', () => {
      const omitted = omitPaths(schema, ['password'])

      expect(Object.keys((omitted as any).shape)).toEqual(['username', 'profile'])
      expect(omitted.safeParse({ username: 'admin' }).success).toBe(true)
    })

    it('剔除嵌套字段并保留外层 optional', () => {
      const omitted = omitPaths(schema, ['password', 'profile.phone'])

      expect(omitted.safeParse({ username: 'a', profile: { email: 'e' } }).success).toBe(true)
      expect(omitted.safeParse({ username: 'a' }).success).toBe(true)
      expect(omitted.safeParse({ username: 'a', profile: {} }).success).toBe(false)
    })

    it('带 refinement 的 schema 不抛错且保留 refinement', () => {
      const refined = schema.refine(v => v.username !== 'root', { message: 'no root' })

      const omitted = omitPaths(refined, ['password'])

      expect(omitted.safeParse({ username: 'root' }).error?.issues.map(i => i.message)).toEqual(['no root'])
      expect(omitted.safeParse({ username: 'admin' }).success).toBe(true)
    })

    it('没有隐藏路径时返回原 schema', () => {
      expect(omitPaths(schema, [])).toBe(schema)
    })

    it('忽略不存在的路径', () => {
      const result = omitPaths(schema, ['nope', 'profile.nope'])

      expect(result.safeParse({ username: 'a', password: '123456' }).success).toBe(true)
      expect(result.safeParse({ username: 'a' }).success).toBe(false)
    })
  })
})

describe('introspectSchema 递归保护', () => {
  it('getter 定义的递归 schema 在最大深度处截断', () => {
    const Category = z.object({
      name: z.string(),
      get child() {
        return Category.optional()
      }
    })

    const fields = introspectSchema(Category, {} as any, '')
    let depth = 0
    let current = fields.find(f => f.path === 'child')
    while (current) {
      depth++
      current = current.children?.find(f => f.path.endsWith('child'))
    }
    expect(depth).toBeGreaterThan(5)
    expect(depth).toBeLessThanOrEqual(21)
  })
})

describe('getArrayLengthBounds', () => {
  it('读取 min / max / length 约束', () => {
    expect(getArrayLengthBounds(z.array(z.string()).min(1).max(3))).toEqual({ min: 1, max: 3 })
    expect(getArrayLengthBounds(z.array(z.string()).length(2))).toEqual({ min: 2, max: 2 })
    expect(getArrayLengthBounds(z.array(z.string()))).toEqual({ min: 0, max: Infinity })
  })
})
