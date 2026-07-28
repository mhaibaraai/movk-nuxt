import { describe, expect, it } from 'vitest'

import {
  googleFontsHref,
  resolveActiveFont,
  resolveFontHref,
  resolveFontHrefMap,
  resolveFontId,
  resolveFontLinks,
  resolveFontStyle
} from '../../../src/runtime/domains/theme/theme-font'

const fonts = [
  { name: 'Alibaba PuHuiTi', href: 'https://cdn.example.com/fonts/alibaba-puhuiti.css' },
  { name: 'Public Sans' }
]

describe('resolveFontHref', () => {
  it('已登记且带 href 的字体使用自定义地址', () => {
    expect(resolveFontHref('Alibaba PuHuiTi', fonts)).toBe(fonts[0]!.href)
  })

  it('已登记但缺省 href 的字体回退 Google Fonts', () => {
    expect(resolveFontHref('Public Sans', fonts)).toBe(googleFontsHref('Public Sans'))
  })

  it('未登记的字体不猜测来源', () => {
    expect(resolveFontHref('OPPO Sans 4.0', fonts)).toBeUndefined()
  })

  it('可选项为空时不产生任何地址', () => {
    expect(resolveFontHref('Alibaba PuHuiTi', [])).toBeUndefined()
  })
})

describe('resolveFontLinks', () => {
  it('未指定字体时不产生 link', () => {
    expect(resolveFontLinks(undefined, fonts)).toEqual([])
    expect(resolveFontLinks('', fonts)).toEqual([])
  })

  it('未登记的字体不产生 link，避免请求不可达的 Google Fonts', () => {
    expect(resolveFontLinks('OPPO Sans 4.0', fonts)).toEqual([])
  })

  it('已登记的字体产生带稳定 id 的 stylesheet link', () => {
    expect(resolveFontLinks('Alibaba PuHuiTi', fonts)).toEqual([
      { rel: 'stylesheet', href: fonts[0]!.href, id: 'font-alibaba-puhuiti' }
    ])
  })
})

describe('resolveFontId', () => {
  it('小写并以连字符替换空白', () => {
    expect(resolveFontId('OPPO Sans 4.0')).toBe('font-oppo-sans-4.0')
  })
})

describe('resolveFontStyle', () => {
  it('未指定字体时输出空规则，把 --font-sans 留给使用者 CSS', () => {
    expect(resolveFontStyle(undefined)).toBe(':root {}')
    expect(resolveFontStyle('')).toBe(':root {}')
  })

  it('指定字体时输出 --font-sans 声明', () => {
    expect(resolveFontStyle('OPPO Sans 4.0')).toBe(':root { --font-sans: "OPPO Sans 4.0", sans-serif; }')
  })

  it('字体名中的引号被转义，不产生越界的 CSS', () => {
    expect(resolveFontStyle('Ev"il')).toBe(':root { --font-sans: "Ev\\"il", sans-serif; }')
  })
})

describe('resolveActiveFont', () => {
  it('用户选择优先于配置的默认字体', () => {
    expect(resolveActiveFont('Public Sans', 'Alibaba PuHuiTi')).toBe('Public Sans')
  })

  it('未选择时使用配置的默认字体', () => {
    expect(resolveActiveFont(undefined, 'Alibaba PuHuiTi')).toBe('Alibaba PuHuiTi')
  })

  // 项目此前未配置 theme.font 时 localStorage 会留下空串，
  // 之后再配置默认字体不应被这份历史残留永久屏蔽
  it('localStorage 残留空串时回退到配置的默认字体', () => {
    expect(resolveActiveFont('', 'Alibaba PuHuiTi')).toBe('Alibaba PuHuiTi')
  })

  it('两者都为空时返回空串，交由项目 CSS 决定', () => {
    expect(resolveActiveFont('', '')).toBe('')
    expect(resolveActiveFont(undefined, undefined)).toBe('')
  })
})

describe('resolveFontHrefMap', () => {
  it('为每个可选项预解析地址，供预水合脚本查表', () => {
    expect(resolveFontHrefMap(fonts)).toEqual({
      'Alibaba PuHuiTi': fonts[0]!.href,
      'Public Sans': googleFontsHref('Public Sans')
    })
  })

  it('未登记的字体不在表内，脚本据此跳过', () => {
    expect(resolveFontHrefMap(fonts)['OPPO Sans 4.0']).toBeUndefined()
  })
})
