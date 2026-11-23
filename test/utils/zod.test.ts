import { describe, expect, it } from 'vitest'
import { generateZodTemplate, resolveZodOptions } from '../../src/utils/zod'

const available = ['en', 'zhCN', 'zhTW', 'ja']

describe('resolveZodOptions', () => {
  it('填充默认值', () => {
    expect(resolveZodOptions({ locale: 'zh-CN' }, available)).toEqual({
      options: {
        locale: 'zh-CN',
        fallback: 'en',
        localeMap: {},
        requiredInputs: [undefined],
        label: true,
        jitless: false
      },
      imports: ['zhCN', 'en'],
      unresolved: []
    })
  })

  it('固定 locale 只打包该语言与 fallback', () => {
    expect(resolveZodOptions({ locale: 'ja', fallback: 'zh-CN' }, available).imports).toEqual(['ja', 'zhCN'])
  })

  it('auto 模式按 locales 打包，并始终包含 fallback', () => {
    expect(resolveZodOptions({ locale: 'auto', locales: ['zh-CN', 'zh-Hant'] }, available).imports).toEqual(['zhCN', 'zhTW', 'en'])
  })

  it('auto 模式未设置 locales 时只打包 fallback', () => {
    expect(resolveZodOptions({ locale: 'auto' }, available).imports).toEqual(['en'])
  })

  it('localeMap 参与解析并去重', () => {
    const result = resolveZodOptions({ locale: 'auto', locales: ['zh-Hans', 'cn'], localeMap: { cn: 'zhCN' } }, available)
    expect(result.imports).toEqual(['zhCN', 'en'])
  })

  it('记录无法解析的语言', () => {
    expect(resolveZodOptions({ locale: 'auto', locales: ['xx'] }, available).unresolved).toEqual(['xx'])
  })

  it('required 的三种形式', () => {
    expect(resolveZodOptions({ locale: 'en', required: false }, available).options.requiredInputs).toBe(false)
    expect(resolveZodOptions({ locale: 'en', required: true }, available).options.requiredInputs).toEqual([undefined])
    expect(resolveZodOptions({ locale: 'en', required: { inputs: [undefined, null, ''] } }, available).options.requiredInputs).toEqual([undefined, null, ''])
    expect(resolveZodOptions({ locale: 'en', required: {} }, available).options.requiredInputs).toEqual([undefined])
  })
})

describe('generateZodTemplate', () => {
  it('未开启时导出空配置', () => {
    const code = generateZodTemplate(undefined)
    expect(code).toContain('export const zodLocales = {}')
    expect(code).toContain('export const zodOptions = undefined')
    expect(code).not.toContain('import')
  })

  it('只具名导入需要的语言', () => {
    const { options, imports } = resolveZodOptions({ locale: 'auto', locales: ['zh-CN'], required: { inputs: [undefined, null, ''] } }, available)
    const code = generateZodTemplate({ options, imports })
    expect(code).toContain(`import { zhCN, en } from 'zod/locales'`)
    expect(code).toContain('export const zodLocales = { zhCN, en }')
    expect(code).toContain('"requiredInputs": [undefined, null, ""]')
  })
})
