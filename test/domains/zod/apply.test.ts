import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { en, zhCN } from 'zod/locales'
import { extendZodConfig, installZod, syncZodLocale } from '../../../src/runtime/domains/zod/apply'
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

  it('auto 模式初始使用 fallback，syncZodLocale 后切换', () => {
    installZod({ ...base, locale: 'auto' }, locales)
    expect(messageOf(z.string(), undefined)).toBe('This field is required')

    syncZodLocale('zh-CN', () => '必填')
    expect(messageOf(z.string(), undefined)).toBe('必填')
    expect(messageOf(z.string().min(3), 'a')).toContain('过小')
  })

  it('固定 locale 时忽略 syncZodLocale', () => {
    installZod(base, locales)
    syncZodLocale('en', () => 'required')
    expect(messageOf(z.string(), undefined)).toBe('此项为必填')
  })

  it('映射不到的语言回退到 fallback', () => {
    installZod({ ...base, locale: 'auto' }, locales)
    syncZodLocale('xx', () => 'x')
    expect(messageOf(z.string().min(3), 'a')).toContain('Too small')
  })

  it('extendZodConfig 追加的 customError 优先于必填规则', () => {
    installZod(base, locales)
    extendZodConfig({ customError: issue => issue.input === undefined ? '自定义' : undefined })
    expect(messageOf(z.string(), undefined)).toBe('自定义')
    expect(messageOf(z.string().min(3), 'a')).toContain('过小')
  })
})
