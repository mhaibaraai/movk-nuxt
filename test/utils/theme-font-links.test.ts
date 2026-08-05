import { describe, expect, it, vi } from 'vitest'

const warn = vi.fn()

vi.mock('@nuxt/kit', () => ({
  addPlugin: vi.fn(),
  useLogger: () => ({ warn })
}))

const { addTheme } = await import('../../src/utils/theme')

/** addTheme 只读 app.head 与 appConfig，构造最小可用的 Nuxt 形状即可 */
function createNuxt() {
  return {
    options: {
      app: { head: {} },
      appConfig: {}
    }
  } as any
}

const resolve = ((p: string) => p) as any

describe('addTheme 的字体注入', () => {
  it('内置字体产出 preconnect 与样式表，且 preconnect 在前', () => {
    const nuxt = createNuxt()
    addTheme(nuxt, resolve, { font: 'Alibaba PuHuiTi' })

    expect(nuxt.options.app.head.link).toEqual([
      { rel: 'preconnect', href: 'https://cdn.mhaibaraai.cn', crossorigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css',
        id: 'font-alibaba-puhuiti'
      }
    ])
  })

  it('自托管字体的相对地址不产出 preconnect', () => {
    const nuxt = createNuxt()
    addTheme(nuxt, resolve, { font: { name: 'My Font', href: '/fonts/my-font.css' } })

    expect(nuxt.options.app.head.link).toEqual([
      { rel: 'stylesheet', href: '/fonts/my-font.css', id: 'font-my-font' }
    ])
  })

  it('未配置字体时不写入任何 link', () => {
    const nuxt = createNuxt()
    addTheme(nuxt, resolve, {})

    expect(nuxt.options.app.head.link).toBeUndefined()
  })

  // dashboard 曾把 family 名写成 kebab-case，静默失效数月，故必须出警告
  it('未登记且无 href 的字体不发请求但发出警告', () => {
    const nuxt = createNuxt()
    warn.mockClear()
    addTheme(nuxt, resolve, { font: 'alibaba-puhuiti' })

    expect(nuxt.options.app.head.link).toBeUndefined()
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]![0]).toContain('alibaba-puhuiti')
  })

  it('theme.enabled 为 false 时整体跳过', () => {
    const nuxt = createNuxt()
    addTheme(nuxt, resolve, { enabled: false, font: 'Alibaba PuHuiTi' })

    expect(nuxt.options.app.head.link).toBeUndefined()
  })
})
