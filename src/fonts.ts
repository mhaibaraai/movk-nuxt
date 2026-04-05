import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from './runtime/types/module'
import { createAlibabaPuHuiTiProvider } from './providers/alibaba-puhuiti'

const FONT_PROVIDERS = [
  {
    key: 'alibabaPuhuiti' as const,
    providerKey: 'alibaba-puhuiti',
    create: createAlibabaPuHuiTiProvider
  }
] satisfies Array<{
  key: keyof NonNullable<ModuleOptions['fonts']>
  providerKey: string
  create: (cdn: string) => unknown
}>

const BUNNY_FONT_NAMES = ['Public Sans', 'DM Sans', 'Geist', 'Inter', 'Poppins', 'Outfit', 'Raleway']

export function setupFonts(options: ModuleOptions, nuxt: Nuxt) {
  if (options.fonts?.enabled === false) return

  // fonts 由 @nuxtjs/fonts 模块注入，NuxtOptions 类型中无此属性
  const nuxtOpts = nuxt.options as typeof nuxt.options & { fonts: { families: Array<{ name: string, provider?: string }> } }

  // 初始化 fonts.families
  nuxtOpts.fonts = (nuxtOpts.fonts || {}) as typeof nuxtOpts.fonts
  nuxtOpts.fonts.families = nuxtOpts.fonts.families || []
  const existingNames = new Set(nuxtOpts.fonts.families.map(f => f.name))

  // 注入 bunny 字体
  for (const name of BUNNY_FONT_NAMES) {
    if (!existingNames.has(name)) {
      nuxtOpts.fonts.families.push({ name, provider: 'bunny' })
    }
  }

  const active = FONT_PROVIDERS.filter(fp => options.fonts?.[fp.key]?.cdn)
  if (!active.length) return

  nuxt.hook('fonts:providers' as any, (providers: Record<string, unknown>) => {
    for (const fp of active) {
      providers[fp.providerKey] = fp.create(options.fonts![fp.key]!.cdn)
    }
  })
}
