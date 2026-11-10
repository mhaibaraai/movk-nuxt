import { kebabCase } from '@movk/core'
import { defineNuxtPlugin, useSiteConfig, useTheme } from '#imports'
import { migrateDocsThemePreferences } from '../utils/theme-preferences'

export default defineNuxtPlugin({
  name: 'docs-theme-provider',
  enforce: 'pre',
  dependsOn: ['movk-theme'],
  setup() {
    if (import.meta.client) {
      migrateDocsThemePreferences(kebabCase(useSiteConfig().name), localStorage, document.documentElement.style)
    }

    return { provide: { docsTheme: useTheme() } }
  }
})
