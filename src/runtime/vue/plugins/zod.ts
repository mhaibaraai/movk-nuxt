import type { App } from 'vue'
import { zodLocales, zodOptions } from '#build/movk-zod'
import { installZod } from '../../domains/zod/apply'
import { ZOD_FORM_CONTEXT } from '../../domains/zod/sync'
import type { ResolvedZodOptions, ZodLocaleFactory } from '../../domains/zod/apply'
import type { MovkZodRuntimeConfig } from '../../types/zod-config'

/** Vue 模式 zod 插件：`customError` 经 `app.use(movk, { zod: { customError } })` 传入 */
export default {
  install(app: App, runtime: MovkZodRuntimeConfig = {}) {
    if (!zodOptions) return
    const options = zodOptions as ResolvedZodOptions
    const locales: Record<string, ZodLocaleFactory> = zodLocales
    installZod(options, locales)
    app.provide(ZOD_FORM_CONTEXT, { options, locales, runtime })
  }
}
