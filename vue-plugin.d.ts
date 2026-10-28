import type { Plugin } from 'vue'
import type { MovkZodRuntimeConfig } from '@movk/nuxt'

interface MovkVuePluginOptions extends Record<string, unknown> {
  /** 仅在 Vite 插件开启 `zod` 时生效 */
  zod?: MovkZodRuntimeConfig
}

declare const plugin: Plugin<[options?: MovkVuePluginOptions]>

export default plugin
