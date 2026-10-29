import { kebabCase } from '@movk/core'
import { defineNuxtPlugin, useAppConfig, useHead, useSiteConfig } from '#imports'
import { createColorSwapScript } from '../domains/theme/theme-fouc'
import { resolveThemeIcons } from '../domains/theme/theme-icons'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()
    const site = useSiteConfig()
    const name = kebabCase(site.name)

    if (import.meta.client) {
      const primary = localStorage.getItem(`${name}-ui-primary`)
      if (primary) appConfig.ui.colors.primary = primary

      const neutral = localStorage.getItem(`${name}-ui-neutral`)
      if (neutral) appConfig.ui.colors.neutral = neutral

      const icons = localStorage.getItem(`${name}-ui-icons`)
      if (icons) appConfig.ui.icons = resolveThemeIcons(icons, appConfig.ui.icons) as any
    }

    if (import.meta.server) {
      useHead({
        script: [{
          // 与 @nuxt/ui colors 插件生成色板变量时读取的 prefix 保持一致
          innerHTML: createColorSwapScript(name, (appConfig.ui as { prefix?: string }).prefix),
          type: 'text/javascript',
          tagPriority: -1
        }, {
          innerHTML: `
            var r = parseFloat(localStorage.getItem('${name}-ui-radius'));
            if (isFinite(r)) document.documentElement.style.setProperty('--ui-radius', r + 'rem');
          `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1
        }, {
          innerHTML: `
            if (localStorage.getItem('${name}-ui-black-as-primary') === 'true') {
              var isDark = document.documentElement.classList.contains('dark');
              document.documentElement.style.setProperty('--ui-primary', isDark ? 'white' : 'black');
            }
          `.replace(/\s+/g, ' ')
        }]
      })
    }
  }
})
