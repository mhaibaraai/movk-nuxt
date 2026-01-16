import { useAppConfig, useColorMode, useSiteConfig } from '#imports'
import { omit } from '@movk/core'
import colors from 'tailwindcss/colors'
import { computed } from 'vue'

export function useTheme() {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const site = useSiteConfig()

  const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone'] as const
  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral
    },
    set(option) {
      appConfig.ui.colors.neutral = option
      window.localStorage.setItem(`${site.name}-ui-neutral`, appConfig.ui.colors.neutral)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors] as const
  const primaryColors = Object.keys(omit(colors, [...colorsToOmit]))
  const primary = computed({
    get() {
      return appConfig.ui.colors.primary
    },
    set(option) {
      appConfig.ui.colors.primary = option
      window.localStorage.setItem(`${site.name}-ui-primary`, appConfig.ui.colors.primary)
      setBlackAsPrimary(false)
    }
  })

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
  const radius = computed({
    get() {
      return appConfig.theme.radius
    },
    set(option) {
      appConfig.theme.radius = option
      window.localStorage.setItem(`${site.name}-ui-radius`, String(appConfig.theme.radius))
    }
  })

  const fonts = ['Public Sans', 'DM Sans', 'Geist', 'Inter', 'Poppins', 'Outfit', 'Raleway']
  const font = computed({
    get() {
      return appConfig.theme.font
    },
    set(option) {
      appConfig.theme.font = option
      if (appConfig.theme.font) {
        window.localStorage.setItem(`${site.name}-ui-font`, appConfig.theme.font)
      }
    }
  })

  const modes = [
    { label: 'light', icon: appConfig.ui.icons.light },
    { label: 'dark', icon: appConfig.ui.icons.dark },
    { label: 'system', icon: appConfig.ui.icons.system }
  ]
  const mode = computed({
    get() {
      return colorMode.value
    },
    set(option) {
      colorMode.preference = option
    }
  })

  function setBlackAsPrimary(value: boolean) {
    appConfig.theme.blackAsPrimary = value
    window.localStorage.setItem(`${site.name}-ui-black-as-primary`, String(value))
  }

  const hasCSSChanges = computed(() => {
    return appConfig.theme.radius !== 0.25
      || appConfig.theme.blackAsPrimary
      || appConfig.theme.font !== 'Public Sans'
  })

  const hasAppConfigChanges = computed(() => {
    return appConfig.ui.colors.primary !== 'green'
      || appConfig.ui.colors.neutral !== 'slate'
  })

  function exportCSS(): string {
    const lines = [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";'
    ]

    if (appConfig.theme.font !== 'Public Sans') {
      lines.push('', '@theme {', `  --font-sans: '${appConfig.theme.font}', sans-serif;`, '}')
    }

    const rootLines: string[] = []
    if (appConfig.theme.radius !== 0.25) {
      rootLines.push(`  --ui-radius: ${appConfig.theme.radius}rem;`)
    }
    if (appConfig.theme.blackAsPrimary) {
      rootLines.push('  --ui-primary: black;')
    }

    if (rootLines.length) {
      lines.push('', ':root {', ...rootLines, '}')
    }

    if (appConfig.theme.blackAsPrimary) {
      lines.push('', '.dark {', '  --ui-primary: white;', '}')
    }

    return lines.join('\n')
  }

  function exportAppConfig(): string {
    const config: Record<string, any> = {}

    if (appConfig.ui.colors.primary !== 'green' || appConfig.ui.colors.neutral !== 'slate') {
      config.ui = { colors: {} }
      if (appConfig.ui.colors.primary !== 'green') {
        config.ui.colors.primary = appConfig.ui.colors.primary
      }
      if (appConfig.ui.colors.neutral !== 'slate') {
        config.ui.colors.neutral = appConfig.ui.colors.neutral
      }
    }

    const configString = JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, '\'')

    return `export default defineAppConfig(${configString})`
  }

  function resetTheme() {
    // Reset without triggering individual tracking events
    appConfig.ui.colors.primary = 'green'
    window.localStorage.removeItem(`${site.name}-ui-primary`)

    appConfig.ui.colors.neutral = 'slate'
    window.localStorage.removeItem(`${site.name}-ui-neutral`)

    appConfig.theme.radius = 0.25
    window.localStorage.removeItem(`${site.name}-ui-radius`)

    appConfig.theme.font = 'Public Sans'
    window.localStorage.removeItem(`${site.name}-ui-font`)

    appConfig.theme.blackAsPrimary = false
    window.localStorage.removeItem(`${site.name}-ui-black-as-primary`)
  }

  return {
    neutralColors,
    neutral,
    primaryColors,
    primary,
    setBlackAsPrimary,
    radiuses,
    radius,
    fonts,
    font,
    modes,
    mode,
    hasCSSChanges,
    hasAppConfigChanges,
    exportCSS,
    exportAppConfig,
    resetTheme
  }
}
