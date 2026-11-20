import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { en, zhCN } from 'zod/locales'
import { installZod } from '../../../src/runtime/domains/zod/apply'
import type { ResolvedZodOptions } from '../../../src/runtime/domains/zod/apply'

const base: ResolvedZodOptions = {
  locale: 'zh-CN',
  fallback: 'en',
  localeMap: {},
  requiredInputs: [undefined],
  label: true,
  jitless: false
}

const locales = { en, zhCN }

function messageOf(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('installZod', () => {
  afterEach(() => {
    z.config({ customError: undefined, localeError: en().localeError, jitless: false })
  })

  it('固定 locale 时使用对应 zod 文案与 movk 字典', () => {
    installZod(base, locales)
    expect(messageOf(z.string().min(3), 'a')).toBe(zhCN().localeError({ code: 'too_small', origin: 'string', minimum: 3, inclusive: true, input: 'a' } as never) as string)
    expect(messageOf(z.string(), undefined)).toBe('此项为必填')
    expect(messageOf(z.string().meta({ label: '姓名' }), undefined)).toBe('姓名为必填')
  })

  it('jitless 透传到 z.config', () => {
    installZod({ ...base, jitless: true }, locales)
    expect(z.config().jitless).toBe(true)
  })

  it('auto 模式的全局配置保持 fallback', () => {
    installZod({ ...base, locale: 'auto' }, locales)
    expect(messageOf(z.string(), undefined)).toBe('This field is required')

    expect(messageOf(z.string().min(3), 'a')).toContain('Too small')
  })

  it('映射不到的语言回退到 fallback', () => {
    installZod({ ...base, locale: 'xx' }, locales)
    expect(messageOf(z.string().min(3), 'a')).toContain('Too small')
  })
})
