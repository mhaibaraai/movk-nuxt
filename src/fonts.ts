import type { Nuxt } from '@nuxt/schema'
import { createAlibabaPuHuiTiProvider } from './providers/alibaba-puhuiti'
import type { ModuleOptions } from './module'

const FONT_PROVIDERS = [
  {
    key: 'alibabaPuhuiti' as const,
    name: 'Alibaba PuHuiTi',
    providerKey: 'alibaba-puhuiti',
    create: createAlibabaPuHuiTiProvider
  }
] satisfies Array<{
  key: keyof NonNullable<ModuleOptions['fonts']>
  name: string
  providerKey: string
  create: (cdn: string, name: string) => unknown
}>

export function setupFonts(options: ModuleOptions, nuxt: Nuxt) {
  if (options.fonts?.enabled === false) return

  const nuxtOpts = nuxt.options as typeof nuxt.options & { fonts: { provider: string, families: Array<{ name: string, provider?: string }> } }

  const active = FONT_PROVIDERS.filter(fp => options.fonts?.[fp.key]?.cdn)
  if (!active.length) return

  nuxt.hook('fonts:providers' as any, (providers: Record<string, unknown>) => {
    for (const fp of active) {
      providers[fp.providerKey] = fp.create(options.fonts![fp.key]!.cdn, fp.name)
    }
  })

  nuxtOpts.fonts = (nuxtOpts.fonts || {}) as typeof nuxtOpts.fonts
  nuxtOpts.fonts.provider = nuxtOpts.fonts?.provider || ''
}
