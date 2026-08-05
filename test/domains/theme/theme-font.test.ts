import { describe, expect, it } from 'vitest'

import {
  MOVK_FONTS,
  resolveFontFamily,
  resolveFontId,
  resolveFontLinks,
  resolveFontSource
} from '../../../src/runtime/domains/theme/theme-font'

describe('MOVK_FONTS', () => {
  // family 名写错不会报错，只会静默回退到系统字体（dashboard 曾把它写成 kebab-case），
  // 故在此固定住与 movk-fonts 仓库 scripts/fonts.config.ts 的约定
  it('key 与字体入口 CSS 的 font-family 逐字一致', () => {
    expect(Object.keys(MOVK_FONTS)).toEqual(['Alibaba PuHuiTi', 'OPPO Sans'])
  })

  it('地址均指向自建 CDN', () => {
    for (const href of Object.values(MOVK_FONTS)) {
      expect(href).toMatch(/^https:\/\/cdn\.mhaibaraai\.cn\/fonts\/[a-z-]+\.css$/)
    }
  })
})

describe('resolveFontSource', () => {
  it('内置字体名解析出 CDN 地址', () => {
    expect(resolveFontSource('Alibaba PuHuiTi')).toEqual({
      name: 'Alibaba PuHuiTi',
      href: MOVK_FONTS['Alibaba PuHuiTi']
    })
  })

  it('未登记的字体名保留名字但不给地址', () => {
    expect(resolveFontSource('Helvetica')).toEqual({ name: 'Helvetica' })
  })

  it('对象形式用于自托管字体', () => {
    expect(resolveFontSource({ name: 'My Font', href: '/fonts/my-font.css' })).toEqual({
      name: 'My Font',
      href: '/fonts/my-font.css'
    })
  })

  it('内置名可被显式 href 覆盖', () => {
    const source = resolveFontSource({ name: 'OPPO Sans', href: '/fonts/oppo-sans.css' })
    expect(source?.href).toBe('/fonts/oppo-sans.css')
  })

  it('空值与缺名字的对象视为未配置', () => {
    expect(resolveFontSource(undefined)).toBeUndefined()
    expect(resolveFontSource('')).toBeUndefined()
    expect(resolveFontSource({ name: '' })).toBeUndefined()
  })
})

describe('resolveFontLinks', () => {
  it('跨域字体先预连接再加载样式表', () => {
    expect(resolveFontLinks(resolveFontSource('Alibaba PuHuiTi'))).toEqual([
      // crossorigin 不可省：woff2 经 CSS 加载是 anonymous CORS 请求
      { rel: 'preconnect', href: 'https://cdn.mhaibaraai.cn', crossorigin: '' },
      { rel: 'stylesheet', href: MOVK_FONTS['Alibaba PuHuiTi'], id: 'font-alibaba-puhuiti' }
    ])
  })

  it('同源的相对地址不产出 preconnect', () => {
    expect(resolveFontLinks({ name: 'My Font', href: '/fonts/my-font.css' })).toEqual([
      { rel: 'stylesheet', href: '/fonts/my-font.css', id: 'font-my-font' }
    ])
  })

  it('未登记且无 href 的字体不发任何请求', () => {
    expect(resolveFontLinks(resolveFontSource('Helvetica'))).toEqual([])
    expect(resolveFontLinks(undefined)).toEqual([])
  })
})

describe('resolveFontFamily', () => {
  it('首选字体在前，系统中文字体兜底在后', () => {
    const family = resolveFontFamily('Alibaba PuHuiTi')
    expect(family.startsWith('"Alibaba PuHuiTi", ')).toBe(true)
    expect(family).toContain('"PingFang SC"')
    expect(family).toContain('"Microsoft YaHei"')
    expect(family.endsWith('sans-serif')).toBe(true)
  })

  it('转义字体名中的引号，避免截断 CSS 声明', () => {
    expect(resolveFontFamily('Ev"il').startsWith('"Ev\\"il", ')).toBe(true)
  })
})

describe('resolveFontId', () => {
  it('小写并以连字符替换空白', () => {
    expect(resolveFontId('OPPO Sans')).toBe('font-oppo-sans')
    expect(resolveFontId('Alibaba PuHuiTi')).toBe('font-alibaba-puhuiti')
  })
})
