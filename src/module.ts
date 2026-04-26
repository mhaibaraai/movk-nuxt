import type { FetchContext, FetchResponse } from 'ofetch'
import type { ApiInstance, EndpointPrivateConfig, MovkApiFullConfig, MovkApiPublicConfig } from './runtime/types'
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
  /**
   * 是否启用主题模块（appConfig 默认值、theme plugin、ThemePicker 组件）
   * @defaultValue true
   */
  theme?: boolean
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

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiInstance
  }

  interface RuntimeNuxtHooks {
    /** 请求发送前（认证注入后） */
    'movk:api:request': (context: FetchContext) => void | Promise<void>
    /** 响应成功（业务检查 + 解包后） */
    'movk:api:response': (
      context: FetchContext & { response: FetchResponse<any> }
    ) => void | Promise<void>
    /** 任何错误（业务错误 + HTTP 错误） */
    'movk:api:error': (
      context: FetchContext & { response: FetchResponse<any> }
    ) => void | Promise<void>
    /** 401 专用（支持 handled 标记跳过默认行为） */
    'movk:api:unauthorized': (
      context: FetchContext & { response: FetchResponse<any> },
      result: { handled: boolean }
    ) => void | Promise<void>
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    movk?: ModuleOptions
  }

  interface NuxtOptions {
    movk: ModuleOptions
  }

  interface PublicRuntimeConfig {
    movkApi: MovkApiPublicConfig
  }

  interface RuntimeConfig {
    movkApi: { endpoints?: Record<string, EndpointPrivateConfig> }
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
    theme: true,
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

    setupTheme(nuxt, resolve, options)
    setupFonts(options, nuxt)

    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolve('runtime/index.css'))

    const componentIgnore: string[] = []
    if (options.theme === false) {
      componentIgnore.push('theme-picker/**')
    }

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: componentIgnore
    })

    addImportsDir(resolve('runtime/composables'))
    addTemplates(options, nuxt)

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
