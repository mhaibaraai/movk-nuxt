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
import { setupFonts } from './utils/fonts'
import { buildApiRuntimeConfig } from './utils/api'

export * from './runtime/types'

interface MovkFontProviderConfig {
  /**
   * CDN 基础 URL
   * @see 'https://fonts.nuxt.com/get-started/providers#custom-providers'
   * @example 'https://cdn.org/fonts'
   */
  cdn: string
  /**
   * 需要加载的字重，默认全部加载
   * @example [300, 400, 500, 700]
   */
  weights?: number[]
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
  }
  /** 字体提供器配置 */
  fonts?: {
    /**
     * 是否启用字体模块
     * @defaultValue true
     */
    enabled?: boolean
    /**
     * 阿里巴巴普惠体字体
     * @defaultValue 'https://cdn.mhaibaraai.cn/fonts'
     */
    alibabaPuhuiti?: MovkFontProviderConfig
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
    },
    fonts: {
      enabled: true,
      alibabaPuhuiti: {
        cdn: 'https://cdn.mhaibaraai.cn/fonts'
      }
    }
  },
  moduleDependencies: {
    '@nuxt/image': { version: '>=2.0.0' },
    '@nuxt/ui': { version: '>=4.6.0' },
    '@vueuse/nuxt': { version: '>=14.2.1' },
    'nuxt-auth-utils': { version: '>=0.5.29' },
    'nuxt-site-config': { version: '>=4.0.8' }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.alias['#movk'] = resolve('./runtime')

    setupTheme(nuxt, resolve, options['theme'])
    setupFonts(options, nuxt)

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
