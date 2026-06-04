import type { UnpluginOptions } from 'unplugin'
import type { MovkUIOptions } from '../unplugin'
import { getDefaultConfig } from '../runtime/utils/theme-defaults'

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
  const siteName = JSON.stringify(options.site?.name ?? 'movk')

  return {
    name: 'movk:app-config',
    transform(code, id) {
      if (!id.includes('nuxt-ui-app-config')) return
      if (!code.includes('export default')) return

      const injected = [
        `import { defu as __movkDefu } from 'defu'`,
        code.replace('export default', 'const __movkUiAppConfig ='),
        `export default __movkDefu({`,
        `  movk: ${movkDefault},`,
        `  movkSite: { name: ${siteName} },`,
        `  ui: __movkDefu({ colors: ${colorDefaults} }, __movkUiAppConfig.ui || {})`,
        `}, __movkUiAppConfig)`
      ].join('\n')

      return { code: injected, map: null }
    }
  } satisfies UnpluginOptions
}
