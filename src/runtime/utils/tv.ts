import { createTV } from 'tailwind-variants'
import type { defaultConfig } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import appConfig from '#build/app.config'

const appConfigTv = appConfig as AppConfig & { movk: { tv: typeof defaultConfig } }

export const tv = /* @__PURE__ */ createTV(appConfigTv.movk?.tv)
