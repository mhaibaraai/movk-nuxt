import type { UnpluginOptions } from 'unplugin'
import type { MovkUIOptions } from '../unplugin'
import { defu } from 'defu'
import { kebabCase } from 'scule'
import { getDefaultConfig } from '../runtime/utils/theme-defaults'
import { getPackageJsonMetadata } from '../runtime/utils/meta'

const UI_COLOR_DEFAULTS = {
  primary: 'blue',
  secondary: 'blue',
  success: 'green',
  info: 'blue',
  warning: 'yellow',
  error: 'red',
  neutral: 'slate'
}

/**
 * 在 @nuxt/ui 生成的 `#build/app.config`（virtual:nuxt-ui-app-config）之上注入 movk 键，
 * 复用 movk 自己的 getDefaultConfig，对齐 Nuxt 模式 addTheme 的合并语义。
 */
export default function MovkAppConfigPlugin(options: MovkUIOptions): UnpluginOptions {
  const movkDefault = JSON.stringify(getDefaultConfig(options.theme))
  const colorDefaults = JSON.stringify(UI_COLOR_DEFAULTS)
  let movkSite = JSON.stringify(options.site ?? {})

  return {
    name: 'movk:app-config',
    vite: {
      async configResolved(config) {
        const meta = await getPackageJsonMetadata(config.root)
        movkSite = JSON.stringify(defu(options.site, {
          name: kebabCase(meta.name || '') || 'movk',
          description: meta.description
        }))
      }
    },
    transform(code, id) {
      if (!id.includes('nuxt-ui-app-config')) return
      if (!code.includes('export default')) return

      const injected = [
        `import { defu as __movkDefu } from 'defu'`,
        code.replace('export default', 'const __movkUiAppConfig ='),
        `export default __movkDefu({`,
        `  movk: ${movkDefault},`,
        `  movkSite: ${movkSite},`,
        `  ui: __movkDefu({ colors: ${colorDefaults} }, __movkUiAppConfig.ui || {})`,
        `}, __movkUiAppConfig)`
      ].join('\n')

      return { code: injected, map: null }
    }
  } satisfies UnpluginOptions
}
