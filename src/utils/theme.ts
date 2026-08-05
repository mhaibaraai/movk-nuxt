import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../module'
import { addPlugin, useLogger } from '@nuxt/kit'
import defu from 'defu'
import { getDefaultConfig } from '../runtime/utils/theme-defaults'
import { resolveFontLinks, resolveFontSource, resolveFontWarning } from '../runtime/domains/theme/theme-font'
import type { Direction } from '@nuxt/ui'

export function addTheme(nuxt: Nuxt, resolve: Resolver['resolve'], theme?: ModuleOptions['theme']) {
  if (theme?.enabled === false) return

  nuxt.options.app.head.meta = nuxt.options.app.head.meta || []

  nuxt.options.app.head.meta.push(
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  )

  addFontLinks(nuxt, theme?.font)

  nuxt.options.app.head.htmlAttrs = defu(nuxt.options.app.head.htmlAttrs || {}, {
    dir: 'ltr' as Direction
  })

  nuxt.options.appConfig.movk = defu(
    nuxt.options.appConfig.movk || {},
    getDefaultConfig(theme)
  )

  nuxt.options.appConfig.ui = defu(
    {
      colors: {
        primary: 'blue',
        secondary: 'blue',
        success: 'green',
        info: 'blue',
        warning: 'yellow',
        error: 'red',
        neutral: 'slate'
      }
    },
    nuxt.options.appConfig.ui || {}
  )

  addPlugin({
    src: resolve('runtime/plugins/theme'),
    mode: 'all'
  })
}

/**
 * 字体样式表在构建期写入 `<head>`，随 SSR 直出，不依赖运行时 JS。
 * `--font-sans` 由 `movk-ui.css` 模板注入，二者共用同一份 `theme.font`。
 */
function addFontLinks(nuxt: Nuxt, font: NonNullable<ModuleOptions['theme']>['font']) {
  const source = resolveFontSource(font)
  if (!source) return

  const links = resolveFontLinks(source)
  if (!links.length) {
    // 未登记的字体不猜测来源：在无法访问 Google Fonts 的网络环境下，
    // 猜测只会换来一个必然超时的请求
    useLogger('movk').warn(resolveFontWarning(source.name))
    return
  }

  nuxt.options.app.head.link = nuxt.options.app.head.link || []
  nuxt.options.app.head.link.push(...links)
}
