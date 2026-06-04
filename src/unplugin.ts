import { fileURLToPath } from 'node:url'
import { join, normalize } from 'pathe'
import { globSync } from 'tinyglobby'
import { defu } from 'defu'
import { createUnplugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import { NuxtUIPlugin } from '@nuxt/ui/unplugin'

import type { ModuleOptions } from './module'
import MovkEnvironmentPlugin from './plugins/environment'
import MovkTemplatePlugin from './plugins/templates'
import MovkAppConfigPlugin from './plugins/app-config'
import MovkPluginsPlugin from './plugins/plugins'

export interface MovkUIOptions extends Pick<ModuleOptions, 'prefix' | 'theme'> {
  /** 透传给 @nuxt/ui 的 unplugin 选项（colorMode、icon、ui、router 等） */
  ui?: Record<string, any>
  /** 站点名称，注入 app.config.movkSite，用于主题 localStorage key 前缀 */
  site?: { name?: string }
  /** 是否生成自动导入声明文件 @defaultValue true */
  dts?: boolean
  /** 覆盖 unplugin-auto-import 选项，false 关闭 composable 自动导入 */
  autoImport?: false | Record<string, any>
  /** 覆盖 unplugin-vue-components 选项，false 关闭组件自动导入 */
  components?: false | Record<string, any>
  /** 路由模式，对齐 @nuxt/ui */
  router?: boolean | 'inertia'
  /** 启用/禁用 @vueuse/core color-mode @defaultValue true */
  colorMode?: boolean
}

export const runtimeDir = normalize(fileURLToPath(new URL('./runtime', import.meta.url)))

/** movk 组件层从 `#components` 具名导入的 @nuxt/ui 组件（去 U 前缀映射到 @nuxt/ui/components/<Name>.vue） */
export const UI_COMPONENTS = [
  'UAccordion',
  'UButton', 'UBadge', 'UCheckbox', 'UCollapsible', 'UForm', 'UDropdownMenu', 'UIcon', 'UInput',
  'UModal', 'UPagination', 'USelect', 'UPopover', 'UCalendar', 'UColorPicker', 'UTable', 'UFormField',
  'UTooltip', 'UInputNumber', 'USwitch', 'UTextarea', 'USlider', 'UPinInput', 'UInputTags',
  'UFileUpload', 'USelectMenu', 'UInputMenu', 'UCheckboxGroup', 'URadioGroup', 'UInputDate',
  'UInputTime', 'UListbox'
] as const

/** movk 在 vue 模式自动导入的非服务端 composables 及其公开导出（排除 API 域），对齐 Nuxt addImportsDir 的导出面 */
const MOVK_COMPOSABLES: Record<string, readonly string[]> = {
  useAutoForm: ['useAutoForm', 'defineControl', 'DEFAULT_CONTROLS', 'getAutoFormMetadata'],
  useTheme: ['useTheme'],
  useDateFormatter: ['useDateFormatter', 'CalendarDate'],
  useMessageBox: ['useMessageBox']
}

interface MovkComponentSource {
  resolve: (name: string) => { name: string, from: string } | undefined
}

function createMovkComponentSource(cwd: string, prefix: string, ignore: string[] = []): MovkComponentSource {
  const files = globSync('**/*.vue', { cwd, ignore: ignore.filter(Boolean) })
  const paths = new Map(files.map((c) => {
    const componentName = `${prefix}${c.split('/').pop()?.replace(/\.vue$/, '')}`
    return [componentName, c] as const
  }))

  return {
    resolve: (componentName) => {
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

  // movk 组件解析器注入 @nuxt/ui 的 unplugin-vue-components（defu 数组拼接），避免第二个实例触发重复检测
  const uiOptions = defu(
    {
      prefix: 'U',
      colorMode: options.colorMode,
      router: options.router,
      dts: options.dts,
      // 把 movk 非服务端 composables 注入 @nuxt/ui 的 unplugin-auto-import 单实例（避免第二实例）
      autoImport: options.autoImport === false
        ? false
        : defu(options.autoImport, {
            // 对齐 Nuxt：允许在 <template> 内使用自动导入（如复用页里 :data="makePeople(30)"）
            vueTemplate: true,
            imports: Object.entries(MOVK_COMPOSABLES).map(([from, names]) => ({
              from: join(runtimeDir, 'composables', from),
              imports: [...names]
            }))
          }),
      components: options.components === false
        ? false
        : defu(options.components, { resolvers: [(name: string) => movkComponents.resolve(name)] })
    },
    options.ui || {}
  )

  const uiPlugins = NuxtUIPlugin.raw(uiOptions as any, meta) as UnpluginOptions | UnpluginOptions[]

  return [
    // movk 覆盖插件先注册，赢得 #imports/#components/#build/app.config 解析
    MovkEnvironmentPlugin(options),
    MovkAppConfigPlugin(options),
    ...(Array.isArray(uiPlugins) ? uiPlugins : [uiPlugins]),
    MovkTemplatePlugin(options),
    MovkPluginsPlugin(options)
  ].flat(1) as UnpluginOptions[]
})
