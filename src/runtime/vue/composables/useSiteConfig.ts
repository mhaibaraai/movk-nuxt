import appConfig from '#build/app.config'

interface SiteConfigStub {
  url: string
  name: string
  description: string
  defaultLocale: string
}

/**
 * Vue 模式下 `nuxt-site-config` 的 useSiteConfig 桩。
 * name 经 unplugin 的 options.site 注入 app.config（movkSite），默认非空以避免
 * useTheme/theme 插件的 localStorage key 前缀退化。
 */
export function useSiteConfig(): SiteConfigStub {
  const injected = (appConfig as Record<string, any>).movkSite ?? {}
  return {
    url: '',
    name: 'movk',
    description: '',
    defaultLocale: 'en',
    ...injected
  }
}
