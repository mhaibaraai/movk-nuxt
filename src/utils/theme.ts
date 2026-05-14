import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../module'
import { addPlugin } from '@nuxt/kit'
import defu from 'defu'
import { getDefaultConfig } from './defaults'

export function addTheme(nuxt: Nuxt, resolve: Resolver['resolve'], theme?: ModuleOptions['theme']) {
  if (theme?.enabled === false) return

  nuxt.options.app.head.meta = nuxt.options.app.head.meta || []

  nuxt.options.app.head.meta.push(
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  )

  nuxt.options.app.head.htmlAttrs = defu(nuxt.options.app.head.htmlAttrs || {}, {
    lang: 'zh-CN',
    dir: 'ltr' as const
  })

  nuxt.options.appConfig.movk = defu(
    nuxt.options.appConfig.movk || {},
    getDefaultConfig(theme)
  )

  nuxt.options.appConfig.ui = defu(
    nuxt.options.appConfig.ui || {},
    {
      colors: { primary: 'blue', secondary: 'blue', success: 'green', info: 'blue', warning: 'yellow', error: 'red', neutral: 'slate' }
    })

  addPlugin({
    src: resolve('runtime/plugins/theme'),
    mode: 'all'
  })
}
