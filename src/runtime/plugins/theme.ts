import { kebabCase } from '@movk/core'
import { defineNuxtPlugin, useAppConfig, useHead, useSiteConfig } from '#imports'
import { createColorRestoreScript, restorePaletteVars } from '../domains/theme/theme-fouc'
import { resolveThemeIcons } from '../domains/theme/theme-icons'

export default defineNuxtPlugin({
  name: 'movk-theme',
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()
    const site = useSiteConfig()
    const name = kebabCase(site.name)

    if (import.meta.client) {
      restorePaletteVars(name)

      const icons = localStorage.getItem(`${name}-ui-icons`)
      if (icons) appConfig.ui.icons = resolveThemeIcons(icons, appConfig.ui.icons) as any
    }

    if (import.meta.server) {
      useHead({
        script: [{
          innerHTML: createColorRestoreScript(name),
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
