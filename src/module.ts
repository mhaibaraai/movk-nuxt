import type {
  MovkApiFullConfig
} from './runtime/types'
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
import { setupTheme } from './utils/theme'
import { buildApiRuntimeConfig } from './utils/api'

export * from './runtime/types'

export interface ThemeFontConfig {
  /** 字体名称 */
  name: string
  /**
   * 字体 CSS 文件的完整 URL；未提供时运行时回退到 Google Fonts URL
   * @example 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css'
   */
  href?: string
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
     * Prefix for Tailwind CSS utility classes
     * @see https://ui.nuxt.com/docs/getting-started/installation/nuxt#themeprefix
     * @example 'tw'
     */
    prefix?: string
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
  defaults: {
    prefix: 'M',
    theme: {
      enabled: true
    }
  },
  moduleDependencies: {
    '@nuxt/image': { version: '>=2.0.0' },
    /** 默认禁用 @nuxt/ui 的 fonts 子模块（大陆地区无法访问 Google Fonts 时由本模块手动注入字体 link） */
    '@nuxt/ui': { version: '>=4.6.0', defaults: { fonts: false } },
    '@vueuse/nuxt': { version: '>=14.2.1' },
    'nuxt-auth-utils': { version: '>=0.5.29' },
    'nuxt-site-config': { version: '>=4.0.8' }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.alias['#movk'] = resolve('./runtime')

    setupTheme(nuxt, resolve, options['theme'])

    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolve('runtime/index.css'))

    const componentIgnore: string[] = [
      'auto-form-renderer/**',
      'data-table-renderer/**'
    ]
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
    addTemplates(options, nuxt, resolve)

    const apiConfig = options.api ?? {}
    if (apiConfig.enabled !== false) {
      const { publicConfig, privateConfig } = buildApiRuntimeConfig(apiConfig)

      nuxt.options.runtimeConfig.movkApi = privateConfig
      nuxt.options.runtimeConfig.public.movkApi = publicConfig

      addPlugin({ src: resolve('runtime/plugins/api.factory'), mode: 'all' })
    }

    const meta = await getPackageJsonMetadata(nuxt.options.rootDir)
    // @ts-expect-error
    nuxt.options.site = defu(nuxt.options.site, {
      name: meta.name || 'movk-nuxt'
    })
  }
})
