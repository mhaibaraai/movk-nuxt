import type { MovkApiFullConfig } from './runtime/types/api/module'
import type { ModuleOptions as UiModuleOptions } from '@nuxt/ui'
import type { ModuleOptions as SiteConfigOptions } from 'nuxt-site-config'
import type { SiteConfigInput } from 'nuxt-site-config/kit'
import type { Nuxt } from 'nuxt/schema'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'
import { addTemplates } from './templates'
import { getPackageJsonMetadata } from './runtime/utils/meta'
import { kebabCase } from 'scule'
import { updateSiteConfig } from 'nuxt-site-config/kit'
import { defaultOptions, getDefaultApiConfig } from './utils/defaults'
import { addTheme } from './utils/theme'
import { UI_COMPONENTS } from './utils/ui-components'

export * from './runtime/types'

interface NuxtWithExtra {
  options: Nuxt['options'] & {
    ui?: UiModuleOptions
    site?: SiteConfigOptions
  }
}

interface ThemeFontConfig {
  /** 字体名称 */
  name: string
  /**
   * 字体 CSS 文件的完整 URL；未提供时运行时回退到 Google Fonts URL
   * @example 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css'
   */
  href?: string
}

type StrictUiTheme = {
  [K in keyof NonNullable<UiModuleOptions['theme']>]?: Exclude<NonNullable<UiModuleOptions['theme']>[K], null>
}

export interface ModuleOptions {
  /**
   * 组件前缀
   * @defaultValue 'M'
   */
  prefix?: string
  /** API 模块配置 */
  api?: MovkApiFullConfig
  /** 主题模块配置 */
  theme?: {
    /**
     * 是否启用主题模块（appConfig 默认值、theme plugin、ThemePicker 组件）
     * @defaultValue true
     */
    enabled?: boolean
    /**
     * Define the color aliases available for components
     * @defaultValue `['primary', 'secondary', 'success', 'info', 'warning', 'error']`
     * @see https://ui.nuxt.com/docs/getting-started/installation/nuxt#themecolors
     */
    colors?: StrictUiTheme['colors']
    /**
     * The default variants to use for components
     * @defaultValue 'nuxt.options.ui.theme.defaultVariants'
     * @see https://ui.nuxt.com/docs/getting-started/installation/nuxt#themedefaultvariants
     */
    defaultVariants?: StrictUiTheme['defaultVariants']
    /**
     * Prefix for Tailwind CSS utility classes
     * @defaultValue 'nuxt.options.ui.theme.prefix'
     * @see https://ui.nuxt.com/docs/getting-started/installation/nuxt#themeprefix
     * @example 'tw'
     */
    prefix?: StrictUiTheme['prefix']
    /** ThemePicker 字体可选项；提供时完整替换内置列表 */
    fonts?: ThemeFontConfig[]
    /** ThemePicker 圆角可选项 */
    radiuses?: number[]
    /** ThemePicker neutral 颜色可选项 */
    neutralColors?: string[]
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'movk',
    compatibility: { nuxt: '>=4.4.2' }
  },
  defaults: defaultOptions,
  moduleDependencies: {
    '@nuxt/image': { version: '>=2.0.0' },
    '@nuxt/ui': { version: '>=4.6.0', defaults: { fonts: false } },
    '@vueuse/nuxt': { version: '>=14.2.1' },
    'nuxt-auth-utils': { version: '>=0.5.29' },
    'nuxt-site-config': { version: '>=4.0.8' }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.movk = options
    nuxt.options.alias['#movk'] = resolve('./runtime')

    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolve('runtime/index.css'))

    // movk 组件层内部渲染、但消费方通常不会直接书写的 @nuxt/ui 组件,需向 componentDetection 声明,
    // 否则其主题类(如 Table 的 min-w-full)不会被 @source 扫描生成。复用组件层导入清单,去 U 前缀。
    const movkUiDeps = UI_COMPONENTS.map(name => name.slice(1))
    const uiOptions = (nuxt as NuxtWithExtra).options
    const ui = (uiOptions.ui ??= {})
    const experimental = (ui.experimental ??= {})
    const detection = experimental.componentDetection
    if (detection === true) {
      experimental.componentDetection = movkUiDeps
    } else if (Array.isArray(detection)) {
      experimental.componentDetection = [...new Set([...detection, ...movkUiDeps])]
    }

    const componentIgnore: string[] = []
    if (options.theme?.enabled === false) {
      componentIgnore.push('theme-picker/**')
    }

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: componentIgnore
    })

    addImportsDir(resolve('runtime/composables'))

    const apiConfig = options.api ?? {}
    if (apiConfig.enabled !== false) {
      const { publicConfig, privateConfig } = getDefaultApiConfig(apiConfig)

      nuxt.options.runtimeConfig.movkApi = privateConfig as typeof nuxt.options.runtimeConfig.movkApi
      nuxt.options.runtimeConfig.public.movkApi = publicConfig as typeof nuxt.options.runtimeConfig.public.movkApi

      addPlugin({ src: resolve('runtime/plugins/api.factory'), mode: 'all' })
    }

    const meta = await getPackageJsonMetadata(nuxt.options.rootDir)

    nuxt.hook('modules:done', async () => {
      const site = defu((nuxt as NuxtWithExtra).options.site, {
        name: kebabCase(meta.name || '') || 'movk',
        description: meta.description,
        debug: false
      })

      updateSiteConfig(site as SiteConfigInput)

      const uiTheme = (nuxt as NuxtWithExtra).options.ui?.theme
      const themeDefaults: StrictUiTheme = {
        prefix: uiTheme?.prefix ?? undefined,
        colors: uiTheme?.colors ?? undefined,
        defaultVariants: uiTheme?.defaultVariants ?? undefined
      }

      options.theme = defu(options.theme || {}, themeDefaults)

      addTheme(nuxt, resolve, options.theme)
      await addTemplates(options, nuxt)
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/types/app.config.d.ts') })
    })
  }
})
