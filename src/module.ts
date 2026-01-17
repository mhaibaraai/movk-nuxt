import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addServerHandler,
  addTypeTemplate,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import { z } from 'zod/v4'
import { name, version } from '../package.json'
import {
  movkApiFullConfigSchema,
  apiResponseConfigSchema,
  apiAuthConfigSchema,
  apiToastConfigSchema
} from './runtime/schemas/api'
import type { ApiClient, MovkApiPublicConfig, MovkApiPrivateConfig, ApiEndpointPublicConfig } from './runtime/types'
import { setupTheme } from './theme'

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
  api: movkApiFullConfigSchema.optional()
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
      version: '>=4.3.0'
    },
    '@vueuse/nuxt': {
      version: '>=14.1.0'
    },
    'nuxt-og-image': {
      version: '>=5.1.13'
    },
    'nuxt-auth-utils': {
      version: '>=0.5.26'
    }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    setupTheme(nuxt, resolve)

    nuxt.options.alias['#movk'] = resolve('./runtime')

    const apiConfig = options.api || {}

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: ['auto-form-renderer/**', 'theme-picker/ThemePickerButton.vue']
    })

    nuxt.options.css.push(resolve('runtime/style.css'))

    addImportsDir(resolve('runtime/composables'))
    addImportsDir(resolve('runtime/shared'))

    if (apiConfig.enabled !== false) {
      const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
      const privateEndpoints: Record<string, { headers?: Record<string, string> }> = {}

      if (apiConfig.endpoints) {
        for (const [endpointName, endpoint] of Object.entries(apiConfig.endpoints)) {
          const { headers, ...publicConfig } = endpoint
          publicEndpoints[endpointName] = publicConfig as ApiEndpointPublicConfig
          if (headers) {
            privateEndpoints[endpointName] = { headers }
          }
        }
      }

      const publicConfig: MovkApiPublicConfig = {
        defaultEndpoint: apiConfig.defaultEndpoint ?? 'default',
        debug: apiConfig.debug ?? false,
        endpoints: Object.keys(publicEndpoints).length > 0
          ? publicEndpoints
          : { default: { baseURL: '/api' } },
        response: apiResponseConfigSchema.parse(apiConfig.response ?? {}),
        auth: apiAuthConfigSchema.parse(apiConfig.auth ?? {}),
        toast: apiToastConfigSchema.parse(apiConfig.toast ?? {})
      }

      const privateConfig: MovkApiPrivateConfig = {
        endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
      }

      nuxt.options.runtimeConfig.movkApi = privateConfig
      nuxt.options.runtimeConfig.public.movkApi = publicConfig

      addPlugin({
        src: resolve('runtime/plugins/api.factory'),
        mode: 'all'
      })

      addServerHandler({
        route: '/api/_movk/session',
        method: 'post',
        handler: resolve('runtime/server/api/_movk/session.post')
      })
    }

    addTypeTemplate({
      filename: 'runtime/types/auto-form-zod.d.ts',
      src: resolve('runtime/types/zod.d.ts')
    })
    addTypeTemplate({
      filename: 'runtime/types/auth.d.ts',
      src: resolve('runtime/types/auth.d.ts')
    })
  }
})

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiClient
  }
}

declare module 'nuxt/schema' {
  interface NuxtOptions {
    ['movk']: ModuleOptions
  }

  interface PublicRuntimeConfig {
    movkApi: MovkApiPublicConfig
  }

  interface RuntimeConfig {
    movkApi: MovkApiPrivateConfig
  }

  interface AppConfig {
    theme: {
      radius: number
      blackAsPrimary: boolean
      font: string
      icons: string
    }
  }
}
