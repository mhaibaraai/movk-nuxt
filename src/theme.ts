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
    font: 'Public Sans',
    icons: 'lucide'
  })

  nuxt.options.app.head.meta = nuxt.options.app.head.meta || []

  nuxt.options.app.head.meta.push(
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  )

  addPlugin({
    src: resolve('runtime/plugins/theme'),
    mode: 'all'
  })
}
