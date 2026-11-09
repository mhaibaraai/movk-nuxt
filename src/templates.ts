import type { NuxtTemplate, NuxtTypeTemplate } from '@nuxt/schema'
import { addTemplate, addTypeTemplate, getLayerDirectories, hasNuxtModule, useLogger } from '@nuxt/kit'
import * as themes from './runtime/themes'
import type { ModuleOptions } from './module'
import type { Nuxt } from 'nuxt/schema'
import { getThemeClasses } from './utils/theme-classes'
import { resolveFontFamily, resolveFontSource } from './runtime/domains/theme/theme-font'
import { generateZodTemplate, resolveZodOptions } from './utils/zod'

export function getTemplates(options: ModuleOptions, nuxt?: Nuxt) {
  const templates: NuxtTemplate[] = []

  const prefix = options.theme?.prefix

  function generateSources() {
    const layers = nuxt ? getLayerDirectories(nuxt).map(layer => `@source "${layer.app}**/*";`) : []
    const themeClasses = getThemeClasses(Object.values(themes), prefix).join(' ')
    // SearchForm 按断点动态拼接列数类名
    const gridCols = `${prefix ? `${prefix}:` : ''}{,sm:,md:,lg:,xl:}grid-cols-{1,2,3,4,5,6,7,8,9,10,11,12}`

    return [
      ...layers,
      `@source inline(${JSON.stringify(themeClasses)});`,
      `@source inline(${JSON.stringify(gridCols)});`
    ].join('\n')
  }

  /**
   * 走 `@theme` 而非无层级的 `:root`：本模板经 `runtime/index.css` 引入，
   * 而后者被置于项目 CSS 之前，项目自己的 `@theme` 因此仍能覆盖。
   */
  function generateFontTheme() {
    if (options.theme?.enabled === false) return ''

    const source = resolveFontSource(options.theme?.font)
    if (!source) return ''

    return `@theme {\n  --font-sans: ${resolveFontFamily(source.name)};\n}`
  }

  templates.push({
    filename: 'movk-ui.css',
    write: true,
    getContents: () => [generateSources(), generateFontTheme()].filter(Boolean).join('\n')
  })

  templates.push({
    filename: 'types/movk-ui.d.ts',
    getContents: () => {
      const themeEntries = Object.keys(themes).map(key => `    ${key}: typeof movkThemes.${key}`).join('\n')
      return `import type * as movkThemes from '#movk/themes'
import type { Direction } from '@nuxt/ui'
import type { MovkApiPublicConfig, ApiError, ApiInstance, ModuleOptions, MovkZodRuntimeConfig, AutoFormProps, SearchFormProps, DataTableProps, DatePickerProps, MessageBoxProps, TreeProps } from '@movk/nuxt'
import type { HookResult } from '@nuxt/schema'
import type { FetchContext } from 'ofetch'

type Radius = 0 | 0.125 | 0.25 | 0.375 | 0.5
type Icons = 'lucide' | 'phosphor' | 'tabler'

type AppConfigUI = {
  dir?: Direction,
  radius?: Radius | (number & {})
  blackAsPrimary?: boolean
  icons?: Icons | (string & {})
  picker?: {
    radiuses?: number[]
    neutralColors?: string[]
  }
}

// 并入 Nuxt UI 的主题清单：app.config.ui.movk*、<UTheme :ui/:variants> 由此获得类型
declare module '@nuxt/ui' {
  interface CustomThemes {
${themeEntries}
  }

  // <UTheme :props> 的组件默认 prop
  interface ThemeDefaults {
    movkAutoForm?: Partial<AutoFormProps<any, any, any>>
    movkSearchForm?: Partial<SearchFormProps<any>>
    movkDataTable?: Partial<DataTableProps<any>>
    movkDatePicker?: Partial<DatePickerProps<any, any, any, any>>
    movkMessageBox?: Partial<MessageBoxProps>
    movkTree?: Partial<TreeProps<any, any>>
  }
}

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiInstance
  }

  interface RuntimeNuxtHooks {
    'movk:api:request': (context: FetchContext) => HookResult
    'movk:api:response': (context: FetchContext) => HookResult
    'movk:api:error': (context: FetchContext, error: ApiError) => HookResult
    'movk:api:unauthorized': (context: FetchContext, result: { handled: boolean }) => HookResult
    'movk:zod:config': (config: MovkZodRuntimeConfig) => HookResult
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
    movkApi: { endpoints?: Record<string, { headers?: Record<string, string> }> }
  }
}

declare module '@nuxt/schema' {
  interface NuxtOptions {
    ['movk']: ModuleOptions
  }

  interface AppConfigInput {
    /**
     * Movk UI theme configuration
     * @see https://nuxt.mhaibaraai.cn/docs/getting-started/theme
     */
    movk?: AppConfigUI
  }

  interface CustomAppConfig {
    movk?: AppConfigUI
  }
}

export {}
`
    }
  })

  // nuxt-auth-utils 按需登记，未安装时 `#imports` 中没有 useUserSession，经此模板统一出口
  templates.push({
    filename: 'movk-session.ts',
    write: true,
    // meta.name 为 'auth-utils'；经 modules 数组手动注册时按包名匹配
    getContents: () => nuxt && (hasNuxtModule('auth-utils', nuxt) || hasNuxtModule('nuxt-auth-utils', nuxt))
      ? `import { useUserSession as _useUserSession } from '#imports'

export const useUserSession: (() => unknown) | undefined = _useUserSession
`
      : `export const useUserSession: (() => unknown) | undefined = undefined
`
  })

  templates.push({
    filename: 'movk-zod.ts',
    write: true,
    getContents: async () => {
      if (!options.zod) return generateZodTemplate(undefined)

      const available = Object.keys(await import('zod/locales'))
      const setup = resolveZodOptions(options.zod, available)
      if (setup.unresolved.length) {
        useLogger('movk').warn(`No zod locale matches: ${setup.unresolved.join(', ')}. Falling back to "${setup.options.fallback}".`)
      }
      return generateZodTemplate(setup)
    }
  })

  templates.push({
    filename: 'types/movk-api-endpoints.d.ts',
    getContents: () => {
      const endpoints = options.api?.endpoints
      const keys = endpoints && Object.keys(endpoints).length > 0
        ? Object.keys(endpoints)
        : ['default']
      const entries = keys.map(key => `    ${JSON.stringify(key)}: true`).join('\n')
      return `declare module '@movk/nuxt' {
  interface MovkApiEndpoints {
${entries}
  }
}

export {}
`
    }
  })

  return templates
}

export async function addTemplates(options: ModuleOptions, nuxt: Nuxt) {
  const templates = getTemplates(options, nuxt)
  for (const template of templates) {
    if (template.filename!.endsWith('.d.ts')) {
      addTypeTemplate(template as NuxtTypeTemplate)
    } else {
      addTemplate(template)
    }
  }
}
