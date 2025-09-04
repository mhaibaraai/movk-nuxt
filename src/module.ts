import type { UseFetchOptions } from '#app'
import type { ApiFetchOptions, ApiProfile } from './runtime/types'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import defu from 'defu'
import { z } from 'zod/v4'
import { name, version } from '../package.json'

export type * from './runtime/types'

const moduleOptionsSchema = z.object({
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix: z.string().default('M'),
  i18n: z.boolean().default(false),
})

type ModuleOptions = z.input<typeof moduleOptionsSchema>

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'movk',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  defaults: moduleOptionsSchema.parse({}),
  moduleDependencies: {
    '@nuxt/image': {
      version: '>=1.11.0',
    },
    '@nuxt/ui': {
      version: '>=4.0.0-alpha.0',
    },
    '@vueuse/nuxt': {
      version: '>=13.9.0',
    },
    'nuxt-auth-utils': {
      version: '>=0.5.23',
    },
    '@nuxt/eslint': {
      version: '>=1.9.0',
      defaults: {
        config: {
          standalone: false,
          nuxt: {
            sortConfigKeys: true,
          },
        },
      },
    },
    '@nuxtjs/i18n': {
      version: '>=10.0.6',
      defaults: {
        strategy: 'no_prefix',
        defaultLocale: 'zh_cn',
      },
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.movk = options
    nuxt.options.alias['#movk'] = resolve('./runtime')
    nuxt.options.appConfig.movk = defu(nuxt.options.appConfig.movk || {}, options)

    nuxt.options.css.push(resolve('runtime/assets/css/main.css'))

    if (options.i18n) {
      nuxt.hook('i18n:registerModule', (register) => {
        register({
          langDir: resolve('./runtime/i18n/locales'),
          locales: [
            { code: 'zh_cn', file: 'zh_cn.json' },
            { code: 'en', file: 'en.json' },
          ],
        })
      })
    }

    addPlugin({ src: resolve('runtime/plugins/api.factory.ts') })

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
    })

    addImportsDir(resolve('runtime/composables'))
  },
})

declare module 'nuxt/app' {
  interface NuxtApp {
    $createApiFetcher: <DataT>(apiProfile: ApiFetchOptions<DataT>) => {
      $api: typeof $fetch
      /**
       * API 配置
       */
      apiProfile: ApiProfile
      /**
       * 请求配置
       */
      fetchOptions: Omit<UseFetchOptions<DataT>, '$fetch'>
    }
  }
}

declare module '@nuxt/schema' {
  interface NuxtOptions {
    ['movk']: ModuleOptions
  }
  interface RuntimeConfig { }
  interface PublicRuntimeConfig {
    apiBase?: string
  }
}
