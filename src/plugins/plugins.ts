import { resolvePathSync } from 'mlly'
import type { UnpluginOptions } from 'unplugin'
import type { MovkUIOptions } from '../unplugin'

const MOVK_PLUGINS_VIRTUAL = 'virtual:movk-plugins'

/**
 * 把 `@movk/nuxt/vue-plugin` 解析为 virtual:movk-plugins。
 * install(app)：先链入 @nuxt/ui 的 vue-plugin，再装 movk 主题插件。
 */
export default function MovkPluginsPlugin(options: MovkUIOptions): UnpluginOptions {
  const themePath = resolvePathSync('../runtime/vue/plugins/theme', {
    extensions: ['.ts', '.mjs', '.js'],
    url: import.meta.url
  })
  const themeEnabled = options.theme?.enabled !== false

  return {
    name: 'movk:plugins',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@movk/nuxt/vue-plugin') return MOVK_PLUGINS_VIRTUAL
    },
    loadInclude: id => id === MOVK_PLUGINS_VIRTUAL,
    load(id) {
      if (id !== MOVK_PLUGINS_VIRTUAL) return
      return [
        `import nuxtUIPlugin from '@nuxt/ui/vue-plugin'`,
        themeEnabled ? `import movkThemePlugin from ${JSON.stringify(themePath)}` : '',
        `export default {`,
        `  install(app, pluginOptions = {}) {`,
        `    app.use(nuxtUIPlugin, pluginOptions)`,
        themeEnabled ? `    app.use(movkThemePlugin)` : '',
        `  }`,
        `}`
      ].filter(Boolean).join('\n')
    }
  } satisfies UnpluginOptions
}
