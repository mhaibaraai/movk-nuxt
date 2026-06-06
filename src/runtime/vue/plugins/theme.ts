import { defineNuxtPlugin, useAppConfig, useSiteConfig } from '#imports'
import { kebabCase } from '@movk/core'
import { themeIcons } from '../../domains/theme/theme-icons'

/**
 * Vue 模式主题插件：仅做 color-mode 初始化（从 localStorage 恢复主色/中性色/图标集）。
 * 剥离了 Nuxt 模式 theme 插件中的 server 端 useHead FOUC 脚本与 site-config 依赖。
 */
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const site = useSiteConfig()
  const name = kebabCase(site.name)

  const primary = localStorage.getItem(`${name}-ui-primary`)
  if (primary) appConfig.ui.colors.primary = primary

  const neutral = localStorage.getItem(`${name}-ui-neutral`)
  if (neutral) appConfig.ui.colors.neutral = neutral

  const icons = localStorage.getItem(`${name}-ui-icons`)
  if (icons) appConfig.ui.icons = themeIcons[icons as keyof typeof themeIcons] as any
})
