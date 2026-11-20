import { defineNuxtPlugin } from '#imports'
import { zodLocales, zodOptions } from '#build/movk-zod'
import { installZod } from '../domains/zod/apply'
import { ZOD_FORM_CONTEXT } from '../domains/zod/sync'
import type { ResolvedZodOptions, ZodLocaleFactory } from '../domains/zod/apply'
import type { MovkZodRuntimeConfig } from '../types/zod-config'

export default defineNuxtPlugin({
  name: 'movk:zod',
  setup(nuxtApp) {
    if (!zodOptions) return

    const options = zodOptions as ResolvedZodOptions
    const locales: Record<string, ZodLocaleFactory> = zodLocales
    const runtime: MovkZodRuntimeConfig = {}
    installZod(options, locales)
    nuxtApp.vueApp.provide(ZOD_FORM_CONTEXT, { options, locales, runtime })

    // 用户插件在本插件之后执行，等全部插件就绪再收集 movk:zod:config 的扩展
    nuxtApp.hook('app:created', () => nuxtApp.callHook('movk:zod:config', runtime))
  }
})
