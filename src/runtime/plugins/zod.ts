import { defineNuxtPlugin } from '#imports'
import { zodLocales, zodOptions } from '#build/movk-zod'
import { extendZodConfig, installZod } from '../domains/zod/apply'
import type { ResolvedZodOptions, ZodLocaleFactory } from '../domains/zod/apply'
import type { MovkZodRuntimeConfig } from '../types/zod-config'

export default defineNuxtPlugin({
  name: 'movk:zod',
  setup(nuxtApp) {
    if (!zodOptions) return

    installZod(zodOptions as ResolvedZodOptions, zodLocales as Record<string, ZodLocaleFactory>)

    // 用户插件在本插件之后执行，等全部插件就绪再收集 movk:zod:config 的扩展
    nuxtApp.hook('app:created', async () => {
      const runtime: MovkZodRuntimeConfig = {}
      await nuxtApp.callHook('movk:zod:config', runtime)
      extendZodConfig(runtime)
    })
  }
})
