import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../module'
import { addPlugin } from '@nuxt/kit'
import defu from 'defu'

export function setupTheme(nuxt: Nuxt, resolve: Resolver['resolve'], options: ModuleOptions) {
  if (options.theme === false) return

  nuxt.options.appConfig.movk = defu(nuxt.options.appConfig.movk || {}, {
    radius: 0.25,
    blackAsPrimary: false,
    font: 'Alibaba PuHuiTi',
    icons: 'lucide',
    prefix: options?.prefix,
    tv: {
      twMergeConfig: {
        prefix: options?.prefix
      }
    }
  })

  nuxt.options.appConfig.ui = defu(nuxt.options.appConfig.ui || {}, {
    colors: {
      primary: 'blue',
      secondary: 'blue',
      success: 'green',
      info: 'blue',
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
