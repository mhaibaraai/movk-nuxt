import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createErrorMap } from '../../../src/runtime/domains/zod/error-map'
import type { MovkTranslator } from '../../../src/runtime/composables/useMovkLocale'

const t: MovkTranslator = (key, vars) => key === 'validation.requiredWithLabel' ? `${vars?.label} required` : 'required'

function issueOf(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input, { error: undefined })
  if (result.success) throw new Error('expected failure')
  return { ...result.error.issues[0], input, inst: schema, schema } as never
}

describe('createErrorMap', () => {
  it('输入为 undefined 时提示必填', () => {
    const map = createErrorMap({ requiredInputs: [undefined], label: false, getT: () => t })
    expect(map(issueOf(z.string(), undefined))).toBe('required')
  })

  it('不在 requiredInputs 中的输入交给 locale 处理', () => {
    const map = createErrorMap({ requiredInputs: [undefined], label: false, getT: () => t })
    expect(map(issueOf(z.string().min(1), ''))).toBeUndefined()
  })

  it('requiredInputs 可包含 null 与空字符串', () => {
    const map = createErrorMap({ requiredInputs: [undefined, null, ''], label: false, getT: () => t })
    expect(map(issueOf(z.string().min(1), ''))).toBe('required')
    expect(map(issueOf(z.string(), null))).toBe('required')
  })

  it('requiredInputs 为 false 时不处理必填', () => {
    const map = createErrorMap({ requiredInputs: false, label: false, getT: () => t })
    expect(map(issueOf(z.string(), undefined))).toBeUndefined()
  })

  it('label 开启时用 meta 的 label 或 title 插值', () => {
    const map = createErrorMap({ requiredInputs: [undefined], label: true, getT: () => t })
    expect(map(issueOf(z.string().meta({ label: '姓名' }), undefined))).toBe('姓名 required')
    expect(map(issueOf(z.string().meta({ title: 'Name' }), undefined))).toBe('Name required')
  })

  it('label 读不到字符串时退回通用文案', () => {
    const map = createErrorMap({ requiredInputs: [undefined], label: true, getT: () => t })
    expect(map(issueOf(z.string().meta({ label: () => 'x' }), undefined))).toBe('required')
    expect(map(issueOf(z.string(), undefined))).toBe('required')
  })

  it('label 关闭时不读 meta', () => {
    const map = createErrorMap({ requiredInputs: [undefined], label: false, getT: () => t })
    expect(map(issueOf(z.string().meta({ label: '姓名' }), undefined))).toBe('required')
  })

  it('customError 优先，返回空值时继续走必填规则', () => {
    const customError = vi.fn((issue: { input: unknown }) => issue.input === 'x' ? 'custom' : undefined)
    const map = createErrorMap({ requiredInputs: [undefined], label: false, getT: () => t, customError: customError as never })
    expect(map(issueOf(z.number(), 'x'))).toBe('custom')
    expect(map(issueOf(z.string(), undefined))).toBe('required')
  })

  it('每次调用读取最新的 translator', () => {
    let current: MovkTranslator = () => 'a'
    const map = createErrorMap({ requiredInputs: [undefined], label: false, getT: () => current })
    expect(map(issueOf(z.string(), undefined))).toBe('a')
    current = () => 'b'
    expect(map(issueOf(z.string(), undefined))).toBe('b')
  })
})
