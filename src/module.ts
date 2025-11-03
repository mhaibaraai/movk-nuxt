import {
  addComponentsDir,
  addImportsDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule
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
  prefix: z.string().default('M')
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
      version: '>=1.11.0'
    },
    '@nuxt/ui': {
      version: '>=4.1.0'
    },
    '@vueuse/nuxt': {
      version: '>=14.0.0'
    }
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.movk = options
    nuxt.options.alias['#movk'] = resolve('./runtime')
    nuxt.options.appConfig.movk = defu(nuxt.options.appConfig.movk || {}, options)

    nuxt.options.css.push(resolve('runtime/assets/css/main.css'))

    addComponentsDir({
      path: resolve('runtime/components'),
      prefix: options.prefix,
      pathPrefix: false,
      ignore: ['auto-form-renderer/**']
    })

    addImportsDir(resolve('runtime/shared'))

    addTypeTemplate({
      filename: 'runtime/types/auto-form-zod.d.ts',
      src: resolve('runtime/types/zod.d.ts')
    })
  }
})

declare module 'nuxt/schema' {
  interface NuxtOptions {
    ['movk']: ModuleOptions
  }
}
