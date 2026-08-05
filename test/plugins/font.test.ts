import type { MovkUIOptions } from '../../src/unplugin'
import { describe, expect, it, vi } from 'vitest'
import MovkFontPlugin from '../../src/plugins/font'

/** 取出插件注册的 transformIndexHtml 并执行，返回注入的 tag 描述符 */
function injectTags(theme?: MovkUIOptions['theme']) {
  const plugin = MovkFontPlugin({ theme } as MovkUIOptions)
  const hook = (plugin.vite as any).transformIndexHtml
  return hook()
}

describe('MovkFontPlugin 的字体注入', () => {
  it('内置字体产出 preconnect 与样式表，且 preconnect 在前', () => {
    expect(injectTags({ font: 'Alibaba PuHuiTi' })).toEqual([
      {
        tag: 'link',
        attrs: { rel: 'preconnect', href: 'https://cdn.mhaibaraai.cn', crossorigin: '' },
        injectTo: 'head'
      },
      {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href: 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css',
          id: 'font-alibaba-puhuiti'
        },
        injectTo: 'head'
      }
    ])
  })

  it('自托管字体的相对地址不产出 preconnect', () => {
    expect(injectTags({ font: { name: 'My Font', href: '/fonts/my-font.css' } })).toEqual([
      {
        tag: 'link',
        attrs: { rel: 'stylesheet', href: '/fonts/my-font.css', id: 'font-my-font' },
        injectTo: 'head'
      }
    ])
  })

  it('未配置字体时不注入任何 tag', () => {
    expect(injectTags({})).toEqual([])
  })

  it('theme.enabled 为 false 时整体跳过', () => {
    expect(injectTags({ enabled: false, font: 'Alibaba PuHuiTi' })).toEqual([])
  })

  // 与 Nuxt 侧 addFontLinks 对等：family 名写错必须出警告，否则静默回退系统字体
  it('未登记且无 href 的字体不注入但发出警告', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(injectTags({ font: 'alibaba-puhuiti' })).toEqual([])
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]![0]).toContain('alibaba-puhuiti')

    warn.mockRestore()
  })
})
