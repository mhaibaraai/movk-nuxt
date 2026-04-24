import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { applyMeta, extractErrorAndMeta, getAutoFormMetadata } from '../../../src/runtime/domains/auto-form/metadata'

describe('auto-form metadata', () => {
  it('applyMeta 仅接受对象 meta', () => {
    const schema = applyMeta(z.string(), 'invalid-meta')
    expect(schema.meta()).toBeUndefined()
  })

  it('getAutoFormMetadata 合并内层与外层 meta，外层优先', () => {
    const inner = applyMeta(z.string(), {
      label: 'Inner',
      controlProps: { clearable: true },
      nested: { a: 1 }
    })
    const outer = applyMeta(inner.optional(), {
      label: 'Outer',
      nested: { b: 2 }
    })

    expect(getAutoFormMetadata(outer)).toEqual({
      label: 'Outer',
      controlProps: { clearable: true },
      nested: { b: 2 }
    })
  })

  it('extractErrorAndMeta 支持字符串和对象两种写法', () => {
    expect(extractErrorAndMeta('必填')).toEqual(['必填', undefined])
    expect(extractErrorAndMeta({ error: '无效', type: 'email' })).toEqual(['无效', { type: 'email' }])
  })
})
