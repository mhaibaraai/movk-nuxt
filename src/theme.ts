import { addPlugin, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import defu from 'defu'

/**
 * 设置主题配置
 * 包括 appConfig.theme 默认值和 head 中的主题相关样式
 */
export function setupTheme(nuxt: Nuxt, resolve: Resolver['resolve']) {
  nuxt.options.appConfig.theme = defu(nuxt.options.appConfig.theme || {}, {
    radius: 0.25,
    blackAsPrimary: false,
    font: 'Alibaba PuHuiTi',
    icons: 'lucide'
  })

  // 修改 ui 模块的默认颜色配置
  nuxt.options.appConfig.ui = defu(nuxt.options.appConfig.ui || {}, {
    colors: {
      primary: 'blue',
      secondary: 'teal',
      success: 'green',
      info: 'teal',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate'
    }
  })

  nuxt.options.app.head.meta = nuxt.options.app.head.meta || []

  nuxt.options.app.head.meta.push(
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  )

  nuxt.options.app.head.htmlAttrs = defu(nuxt.options.app.head.htmlAttrs || {}, {
    lang: 'zh-CN',
    dir: 'ltr' as const
  })

  addPlugin({
    src: resolve('runtime/plugins/theme'),
    mode: 'all'
  })
}
