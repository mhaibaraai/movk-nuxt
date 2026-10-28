import { describe, expect, it } from 'vitest'
import { resolveZodLocale } from '../../../src/runtime/domains/zod/locale-map'

const available = ['en', 'zhCN', 'zhTW', 'ptBR', 'fr', 'ja']

describe('resolveZodLocale', () => {
  it('去掉连字符后精确匹配', () => {
    expect(resolveZodLocale('zh-CN', available)).toBe('zhCN')
    expect(resolveZodLocale('pt-BR', available)).toBe('ptBR')
  })

  it('精确匹配失败时回退到主语言子标签', () => {
    expect(resolveZodLocale('en-US', available)).toBe('en')
    expect(resolveZodLocale('fr-BE', available)).toBe('fr')
  })

  it('内置映射处理脚本子标签', () => {
    expect(resolveZodLocale('zh-Hans', available)).toBe('zhCN')
    expect(resolveZodLocale('zh-Hant', available)).toBe('zhTW')
    expect(resolveZodLocale('zh', available)).toBe('zhCN')
  })

  it('localeMap 优先于内置映射', () => {
    expect(resolveZodLocale('zh-Hans', available, { 'zh-Hans': 'zhTW' })).toBe('zhTW')
    expect(resolveZodLocale('jp', available, { jp: 'ja' })).toBe('ja')
  })

  it('localeMap 指向不可用的语言时继续尝试其他候选', () => {
    expect(resolveZodLocale('zh-CN', available, { 'zh-CN': 'ko' })).toBe('zhCN')
  })

  it('无法匹配时返回 undefined', () => {
    expect(resolveZodLocale('xx', available)).toBeUndefined()
  })
})
