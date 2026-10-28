import type { App } from 'vue'
import { zodLocales, zodOptions } from '#build/movk-zod'
import { installZod } from '../../domains/zod/apply'
import type { ResolvedZodOptions, ZodLocaleFactory } from '../../domains/zod/apply'
import type { MovkZodRuntimeConfig } from '../../types/zod-config'

/** Vue 模式 zod 插件：`customError` 经 `app.use(movk, { zod: { customError } })` 传入 */
export default {
  install(_app: App, runtime?: MovkZodRuntimeConfig) {
    if (!zodOptions) return
    installZod(zodOptions as ResolvedZodOptions, zodLocales as Record<string, ZodLocaleFactory>, runtime)
  }
}
