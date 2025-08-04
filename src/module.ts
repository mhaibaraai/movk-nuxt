import type { AnyObject } from '@movk/core'
import type { ApiProfile } from './runtime/types'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addServerScanDir,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  installModule,
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
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.movk = options
    nuxt.options.alias['#movk'] = resolve('./runtime')
    nuxt.options.appConfig.movk = defu(nuxt.options.appConfig.movk || {}, options)

    async function registerModule(name: string, key: string, options: Record<string, any>) {
      if (!hasNuxtModule(name)) {
        await installModule(name, options)
      }
      else {
        (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
      }
    }

    await installModule('@vueuse/nuxt')
    await installModule('@nuxt/image')
    await installModule('nuxt-auth-utils')
    await installModule('@nuxt/ui-pro')

    await registerModule('@nuxt/eslint', 'eslint', {
      config: {
        standalone: false,
        nuxt: {
          sortConfigKeys: true,
        },
      },
    })

    nuxt.options.css.push(resolve('runtime/assets/main.css'))

    nuxt.hook('i18n:registerModule', (register) => {
      register({
        langDir: resolve('./runtime/i18n/locales'),
        locales: [
          { code: 'zh_cn', file: 'zh_cn.json' },
          { code: 'en', file: 'en.json' },
        ],
      })
    })

    addPlugin({ src: resolve('runtime/plugins/api.factory.ts') })

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
    })

    addImportsDir(resolve('runtime/composables'))
    addServerScanDir(resolve('runtime/server'))
  },
})

declare module 'nuxt/app' {
  interface NuxtApp {
    $createApiFetcher: (apiProfile: ApiProfile, customInterceptors: AnyObject) => typeof $fetch
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
