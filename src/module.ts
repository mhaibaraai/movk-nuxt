import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'
import {
  DEFAULT_RESPONSE_CONFIG,
  DEFAULT_AUTH_CONFIG,
  DEFAULT_TOAST_CONFIG,
  DEFAULT_ENDPOINT
} from './runtime/constants/api-defaults'
import type { MovkApiPublicConfig, ApiEndpointPublicConfig, EndpointPrivateConfig, MovkApiFullConfig, ModuleOptions } from './runtime/types'
import { setupTheme } from './theme'

export * from './runtime/types'

function buildApiRuntimeConfig(apiConfig: MovkApiFullConfig) {
  const publicEndpoints: Record<string, ApiEndpointPublicConfig> = {}
  const privateEndpoints: Record<string, EndpointPrivateConfig> = {}

  if (apiConfig.endpoints) {
    for (const [key, { headers, ...rest }] of Object.entries(apiConfig.endpoints)) {
      publicEndpoints[key] = rest as ApiEndpointPublicConfig
      if (headers) privateEndpoints[key] = { headers }
    }
  }

  const hasEndpoints = Object.keys(publicEndpoints).length > 0

  const publicConfig: MovkApiPublicConfig = {
    defaultEndpoint: apiConfig.defaultEndpoint ?? 'default',
    debug: apiConfig.debug ?? false,
    endpoints: hasEndpoints ? publicEndpoints : DEFAULT_ENDPOINT,
    response: defu(apiConfig.response, DEFAULT_RESPONSE_CONFIG) as MovkApiPublicConfig['response'],
    auth: defu(apiConfig.auth, DEFAULT_AUTH_CONFIG) as MovkApiPublicConfig['auth'],
    toast: defu(apiConfig.toast, DEFAULT_TOAST_CONFIG) as MovkApiPublicConfig['toast']
  }

  const privateConfig = {
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
    'nuxt-auth-utils': { version: '>=0.5.27' }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    setupTheme(nuxt, resolve)

    nuxt.options.alias['#movk'] = resolve('./runtime')

    nuxt.options.css = nuxt.options.css || []
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
    }
  }
})
