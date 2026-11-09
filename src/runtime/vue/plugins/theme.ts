import { defineNuxtPlugin, useAppConfig, useSiteConfig } from '#imports'
import { kebabCase } from '@movk/core'
import { restorePaletteVars } from '../../domains/theme/theme-fouc'
import { resolveThemeIcons } from '../../domains/theme/theme-icons'

/**
 * Vue 模式主题插件：从 localStorage 恢复色板变量与图标集。
 * 剥离了 Nuxt 模式 theme 插件中的 server 端 useHead FOUC 脚本与 site-config 依赖。
 */
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const site = useSiteConfig()
  const name = kebabCase(site.name)

  restorePaletteVars(name)

  const icons = localStorage.getItem(`${name}-ui-icons`)
  if (icons) appConfig.ui.icons = resolveThemeIcons(icons, appConfig.ui.icons) as any
})
