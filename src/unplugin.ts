import { fileURLToPath } from 'node:url'
import { join, normalize } from 'pathe'
import { globSync } from 'tinyglobby'
import { defu } from 'defu'
import { createUnplugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import type { Options as ComponentsOptions } from 'unplugin-vue-components/types'
import { NuxtUIPlugin } from '@nuxt/ui/unplugin'
import type { NuxtUIOptions } from '@nuxt/ui/unplugin'

import type { ModuleOptions } from './module'
import MovkEnvironmentPlugin from './plugins/environment'
import MovkTemplatePlugin from './plugins/templates'
import MovkAppConfigPlugin from './plugins/app-config'
import MovkPluginsPlugin from './plugins/plugins'

export interface MovkUIOptions extends Pick<ModuleOptions, 'prefix' | 'theme'> {
  /** 站点信息，注入 app.config.movkSite；name 作为主题 localStorage key 前缀 */
  site?: { url?: string, name?: string, description?: string }
  /**
   * Nuxt UI 配置项
   * @see https://ui.nuxt.com/docs/getting-started/installation/vue#options
   */
  ui?: Partial<NuxtUIOptions>
}

export const runtimeDir = normalize(fileURLToPath(new URL('./runtime', import.meta.url)))

export { UI_COMPONENTS } from './utils/ui-components'

/** movk 在 vue 模式自动导入的非服务端 composables 及其公开导出（排除 API 域），对齐 Nuxt addImportsDir 的导出面 */
const MOVK_COMPOSABLES: Record<string, readonly string[]> = {
  useAutoForm: ['useAutoForm', 'defineControl', 'DEFAULT_CONTROLS', 'getAutoFormMetadata'],
  useTheme: ['useTheme'],
  useDateFormatter: ['useDateFormatter', 'CalendarDate'],
  useMessageBox: ['useMessageBox']
}

function createMovkComponentSource(cwd: string, prefix: string, ignore: string[] = []) {
  const files = globSync('**/*.vue', { cwd, ignore: ignore.filter(Boolean) })
  const paths = new Map(files.map((c) => {
    const componentName = `${prefix}${c.split('/').pop()?.replace(/\.vue$/, '')}`
    return [componentName, c] as const
  }))

  return {
    resolve: (componentName: string) => {
      const relativePath = paths.get(componentName)
      if (!relativePath) return
      return { name: 'default', from: join(cwd, relativePath) }
    }
  }
}

export const MovkPlugin = createUnplugin<MovkUIOptions | undefined>((_options = {}, meta) => {
  const options = defu(_options, { prefix: 'M', theme: { enabled: true } }) as MovkUIOptions & { prefix: string }

  const componentIgnore = options.theme?.enabled === false ? ['theme-picker/**'] : []
  const movkComponents = createMovkComponentSource(join(runtimeDir, 'components'), options.prefix, componentIgnore)

  // @nuxt/ui 的 unplugin 配置统一从 ui 透传口读取；movk 仅对 autoImport/components 注入自有贡献后整体下发
  const ui = options.ui || {}
  const uiOptions = defu(
    {
      prefix: 'U', // movk 强制 U 前缀（U* shim 依赖），不可被 ui.prefix 覆盖
      // 把 movk 非服务端 composables 注入 @nuxt/ui 的 unplugin-auto-import 单实例（避免第二实例）
      autoImport: ui.autoImport === false
        ? false
        : defu(ui.autoImport, {
            // 对齐 Nuxt：允许在 <template> 内使用自动导入（如复用页里 :data="makePeople(30)"）
            vueTemplate: true,
            imports: Object.entries(MOVK_COMPOSABLES).map(([from, names]) => ({
              from: join(runtimeDir, 'composables', from),
              imports: [...names]
            }))
          }),
      // movk 组件解析器注入 @nuxt/ui 的 unplugin-vue-components（defu 数组拼接），避免第二个实例触发重复检测
      components: ui.components === false
        ? false
        : defu(ui.components, { resolvers: [(name: string) => movkComponents.resolve(name)] } as ComponentsOptions)
    },
    ui
  )

  const uiPlugins = NuxtUIPlugin.raw(uiOptions as NuxtUIOptions, meta) as UnpluginOptions | UnpluginOptions[]

  return [
    MovkEnvironmentPlugin(options),
    MovkAppConfigPlugin(options),
    ...(Array.isArray(uiPlugins) ? uiPlugins : [uiPlugins]),
    MovkTemplatePlugin(options),
    MovkPluginsPlugin(options)
  ].flat(1) as UnpluginOptions[]
})
