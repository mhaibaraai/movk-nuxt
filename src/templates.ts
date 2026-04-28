import type { NuxtTemplate, NuxtTypeTemplate } from '@nuxt/schema'
import { addTemplate, addTypeTemplate, getLayerDirectories, type Resolver } from '@nuxt/kit'
import { kebabCase } from 'scule'
import * as theme from './theme'
import type { ModuleOptions } from './module'
import type { Nuxt } from 'nuxt/schema'

export function getTemplates(options: ModuleOptions, nuxt?: Nuxt) {
  const templates: NuxtTemplate[] = []

  function writeThemeTemplate(theme: Record<string, any>, path?: string) {
    for (const component in theme) {
      templates.push({
        filename: `movk-ui/${path ? path + '/' : ''}${kebabCase(component)}.ts`,
        write: true,
        getContents: async () => {
          const template = (theme as any)[component]
          const result = typeof template === 'function' ? template(options) : template

          const variants = Object.entries(result.variants || {})
            .filter(([_, values]) => {
              const keys = Object.keys(values as Record<string, unknown>)
              return keys.some(key => key !== 'true' && key !== 'false')
            })
            .map(([key]) => key)

          let json = JSON.stringify(result, null, 2)

          for (const variant of variants) {
            json = json.replace(new RegExp(`("${variant}": "[^"]+")`, 'g'), `$1 as typeof ${variant}[number]`)
            json = json.replace(new RegExp(`("${variant}": \\[\\s*)((?:"[^"]+",?\\s*)+)(\\])`, 'g'), (_, before, match, after) => {
              const replaced = match.replace(/("[^"]+")/g, `$1 as typeof ${variant}[number]`)
              return `${before}${replaced}${after}`
            })
          }

          function generateVariantDeclarations(variants: string[]) {
            return variants.filter(variant => json.includes(`as typeof ${variant}`)).map((variant) => {
              const keys = Object.keys(result.variants[variant])
              return `const ${variant} = ${JSON.stringify(keys, null, 2)} as const`
            })
          }

          return [
            ...generateVariantDeclarations(variants),
            `export default ${json}`
          ].join('\n\n')
        }
      })
    }
  }

  writeThemeTemplate(theme)

  async function generateSources() {
    if (!nuxt) {
      return '@source "./movk-ui";'
    }

    const sources: string[] = []
    const layers = getLayerDirectories(nuxt).map(layer => layer.app)

    // Add layer sources
    for (const layer of layers) {
      sources.push(`@source "${layer}**/*";`)
    }

    sources.push('@source "./movk-ui";')

    return sources.join('\n')
  }

  templates.push({
    filename: 'movk-ui.css',
    write: true,
    getContents: async () => {
      const sources = await generateSources()

      return `${sources}`
    }
  })

  templates.push({
    filename: 'movk-ui/index.ts',
    write: true,
    getContents: () => [
      ...Object.keys(theme).map(component => `export { default as ${component} } from './${kebabCase(component)}'`)
    ].join('\n')
  })

  templates.push({
    filename: 'types/movk-ui.d.ts',
    getContents: () => {
      return `import * as movkUi from '#build/movk-ui'
import type { TVConfig } from '@nuxt/ui'
import type { defaultConfig } from 'tailwind-variants'
import type { EndpointPrivateConfig, MovkApiPublicConfig, ApiInstance } from '@movk/nuxt'
import type { HookResult } from '@nuxt/schema'
import type { FetchContext } from 'ofetch'

type Radius = 0 | 0.125 | 0.25 | 0.375 | 0.5
type FontFamily = 'Alibaba PuHuiTi' | 'Public Sans' | 'DM Sans' | 'Geist' | 'Inter' | 'Poppins' | 'Outfit' | 'Raleway'
type Icons = 'lucide' | 'phosphor' | 'tabler'

type AppConfigUI = {
  radius?: Radius | (number & {})
  blackAsPrimary?: boolean
  font?: FontFamily | (string & {})
  icons?: Icons | (string & {})
  prefix?: string
  tv?: typeof defaultConfig
} & TVConfig<typeof movkUi>

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiInstance
  }

  interface RuntimeNuxtHooks {
    'movk:api:request': (context: FetchContext) => HookResult
    'movk:api:response': (context: FetchContext) => HookResult
    'movk:api:error': (context: FetchContext) => HookResult
    'movk:api:unauthorized': (context: FetchContext, result: { handled: boolean }) => HookResult
  }
}

declare module 'nuxt/schema' {
  interface AppConfig {
    /**
     * Movk UI theme configuration
     * @see https://nuxt.mhaibaraai.cn/docs/getting-started/theme
     */
    movk?: AppConfigUI
  }

  interface PublicRuntimeConfig {
    movkApi: MovkApiPublicConfig
  }

  interface RuntimeConfig {
    movkApi: { endpoints?: Record<string, EndpointPrivateConfig> }
  }
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    /**
     * Movk UI theme configuration
     * @see https://nuxt.mhaibaraai.cn/docs/getting-started/theme
     */
    movk?: AppConfigUI
  }
}

export {}
`
    }
  })

  return templates
}

export function addTemplates(options: ModuleOptions, nuxt: Nuxt, resolve: Resolver['resolve']) {
  const templates = getTemplates(options, nuxt)
  for (const template of templates) {
    if (template.filename!.endsWith('.d.ts')) {
      addTypeTemplate(template as NuxtTypeTemplate)
    } else {
      addTemplate(template)
    }
  }

  nuxt.hook('prepare:types', ({ references }) => {
    references.push({ path: resolve('./runtime/types/app.config.d.ts') })
  })
}
