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
import { getPackageJsonMetadata } from './runtime/utils/meta'
import { setupTheme } from './theme'
import { setupFonts } from './fonts'

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
    '@vueuse/nuxt': { version: '>=14.2.1' },
    '@nuxt/image': { version: '>=2.0.0' },
    '@nuxt/ui': { version: '>=4.6.0' },
    'nuxt-og-image': {
      version: '>=6.3.1',
      defaults: { zeroRuntime: true }
    },
    'nuxt-auth-utils': { version: '>=0.5.29' }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    if (options.theme?.enabled !== false) {
      setupTheme(nuxt, resolve)
    }
    setupFonts(options, nuxt)

    nuxt.options.alias['#movk'] = resolve('./runtime')

    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolve('runtime/style.css'))

    const componentIgnore = ['auto-form-renderer/**']
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
