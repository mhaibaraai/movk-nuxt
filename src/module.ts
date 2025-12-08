import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addTypeTemplate,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import defu from 'defu'
import { z } from 'zod/v4'
import { name, version } from '../package.json'
import { movkApiModuleOptionsSchema } from './runtime/schemas/api'
import type { ApiInstance, MovkApiModuleOptions } from './runtime/types'

export * from './runtime/types'

const moduleOptionsSchema = z.object({
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix: z.string().default('M'),
  /**
   * API 模块配置
   */
  api: movkApiModuleOptionsSchema.optional()
})

export type ModuleOptions = z.input<typeof moduleOptionsSchema>

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'movk',
    compatibility: {
      nuxt: '>=4.2.0'
    }
  },
  defaults: moduleOptionsSchema.parse({}),
  moduleDependencies: {
    '@nuxt/image': {
      version: '>=2.0.0'
    },
    '@nuxt/ui': {
      version: '>=4.2.1'
    },
    '@vueuse/nuxt': {
      version: '>=14.1.0'
    },
    'nuxt-auth-utils': {
      version: '>=0.5.25'
    }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.movk = options
    nuxt.options.alias['#movk'] = resolve('./runtime')
    nuxt.options.appConfig.movk = defu(nuxt.options.appConfig.movk || {}, options)

    const apiConfig = movkApiModuleOptionsSchema.parse(defu(options.api || {}, {
      enabled: true,
      defaultEndpoint: 'default',
      endpoints: {
        default: {
          baseURL: '/api'
        }
      },
      auth: {
        enabled: false,
        tokenSource: 'session',
        sessionTokenPath: 'secure.token',
        tokenType: 'Bearer',
        headerName: 'Authorization',
        redirectOnUnauthorized: true,
        loginPath: '/login',
        clearSessionOnUnauthorized: true
      },
      toast: {
        enabled: true,
        success: { show: true, color: 'success', duration: 3000 },
        error: { show: true, color: 'error', duration: 5000 }
      },
      success: {
        successCodes: [200, 0],
        codeKey: 'code',
        messageKey: 'msg',
        dataKey: 'data'
      },
      debug: false
    }))

    // 注入运行时配置
    nuxt.options.runtimeConfig.public.movkApi = apiConfig

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: ['auto-form-renderer/**']
    })

    addImportsDir(resolve('runtime/composables'))
    addImportsDir(resolve('runtime/shared'))

    // 注册 API 插件
    if (apiConfig.enabled) {
      addPlugin({
        src: resolve('runtime/plugins/api.factory'),
        mode: 'all'
      })
    }

    addTypeTemplate({
      filename: 'runtime/types/auto-form-zod.d.ts',
      src: resolve('runtime/types/zod.d.ts')
    })
  }
})

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiInstance
  }
}

declare module 'nuxt/schema' {
  interface NuxtOptions {
    ['movk']: ModuleOptions
  }

  interface RuntimeConfig { }

  interface PublicRuntimeConfig {
    movkApi: MovkApiModuleOptions
  }
}
