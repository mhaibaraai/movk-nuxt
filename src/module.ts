import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import { name, version } from '../package.json'
import {
  apiResponseConfigSchema,
  apiAuthConfigSchema,
  apiToastConfigSchema
} from './runtime/schemas/api'
import type { MovkApiPublicConfig, MovkApiPrivateConfig, ApiEndpointPublicConfig, MovkApiFullConfig, ModuleOptions } from './runtime/types'
import { setupTheme } from './theme'

export * from './runtime/types'

const DEFAULT_ENDPOINT = { default: { baseURL: '/api' } }

function splitEndpointConfigs(endpoints?: MovkApiFullConfig['endpoints']) {
  const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
  const privateEndpoints: Record<string, { headers?: Record<string, string> }> = {}

  if (!endpoints) return { publicEndpoints, privateEndpoints }

  for (const [name, { headers, ...publicConfig }] of Object.entries(endpoints)) {
    publicEndpoints[name] = publicConfig as ApiEndpointPublicConfig
    if (headers) {
      privateEndpoints[name] = { headers }
    }
  }

  return { publicEndpoints, privateEndpoints }
}

function buildApiRuntimeConfig(apiConfig: MovkApiFullConfig) {
  const { publicEndpoints, privateEndpoints } = splitEndpointConfigs(apiConfig.endpoints)
  const hasEndpoints = Object.keys(publicEndpoints).length > 0

  const publicConfig: MovkApiPublicConfig = {
    defaultEndpoint: apiConfig.defaultEndpoint ?? 'default',
    debug: apiConfig.debug ?? false,
    endpoints: hasEndpoints ? publicEndpoints : DEFAULT_ENDPOINT,
    response: apiResponseConfigSchema.parse(apiConfig.response ?? {}),
    auth: apiAuthConfigSchema.parse(apiConfig.auth ?? {}),
    toast: apiToastConfigSchema.parse(apiConfig.toast ?? {})
  }

  const privateConfig: MovkApiPrivateConfig = {
    endpoints: Object.keys(privateEndpoints).length > 0 ? privateEndpoints : undefined
  }

  return { publicConfig, privateConfig }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'movk',
    compatibility: { nuxt: '>=4.2.0' }
  },
  defaults: { prefix: 'M' },
  moduleDependencies: {
    '@nuxt/image': { version: '>=2.0.0' },
    '@nuxt/ui': { version: '>=4.3.0' },
    '@vueuse/nuxt': { version: '>=14.1.0' },
    'nuxt-og-image': { version: '>=5.1.13' },
    'nuxt-auth-utils': { version: '>=0.5.26' }
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    setupTheme(nuxt, resolve)

    nuxt.options.alias['#movk'] = resolve('./runtime')
    nuxt.options.css.push(resolve('runtime/style.css'))

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: ['auto-form-renderer/**', 'theme-picker/ThemePickerButton.vue']
    })

    addImportsDir(resolve('runtime/composables'))

    const apiConfig = options.api ?? {}
    if (apiConfig.enabled !== false) {
      const { publicConfig, privateConfig } = buildApiRuntimeConfig(apiConfig)

      nuxt.options.runtimeConfig.movkApi = privateConfig
      nuxt.options.runtimeConfig.public.movkApi = publicConfig

      addPlugin({ src: resolve('runtime/plugins/api.factory'), mode: 'all' })
      addServerHandler({
        route: '/api/_movk/session',
        method: 'post',
        handler: resolve('runtime/server/api/_movk/session.post')
      })
    }
  }
})
