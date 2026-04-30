import { useAppConfig, useColorMode, useSiteConfig } from '#imports'
import { themeIcons } from '../domains/theme/theme-icons'
import { omit, kebabCase } from '@movk/core'
import { useLocalStorage } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { computed } from 'vue'

const SYSTEM_DEFAULT_RADIUS = 0.25
const SYSTEM_DEFAULT_FONT = 'Alibaba PuHuiTi'
const SYSTEM_DEFAULT_ICONS = 'lucide'
const SYSTEM_DEFAULT_PRIMARY = 'blue'
const SYSTEM_DEFAULT_NEUTRAL = 'slate'

export function useTheme() {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const site = useSiteConfig()
  const name = kebabCase(site.name)

  const movk = appConfig.movk

  const _radius = useLocalStorage(`${name}-ui-radius`, movk?.radius ?? SYSTEM_DEFAULT_RADIUS)
  const _font = useLocalStorage(`${name}-ui-font`, movk?.font ?? SYSTEM_DEFAULT_FONT)
  const _iconSet = useLocalStorage(`${name}-ui-icons`, movk?.icons ?? SYSTEM_DEFAULT_ICONS)
  const _blackAsPrimary = useLocalStorage(`${name}-ui-black-as-primary`, false)

  const pickerFonts = movk?.picker?.fonts ?? []
  const neutralColors = movk?.picker?.neutralColors ?? []
  const radiuses = movk?.picker?.radiuses ?? []
  const fonts = pickerFonts.map(f => f.name)

  const icons = [
    { label: 'Lucide', icon: 'i-lucide-feather', value: 'lucide' },
    { label: 'Phosphor', icon: 'i-ph-phosphor-logo', value: 'phosphor' },
    { label: 'Tabler', icon: 'i-tabler-brand-tabler', value: 'tabler' }
  ]

  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral
    },
    set(option) {
      appConfig.ui.colors.neutral = option
      window.localStorage.setItem(`${name}-ui-neutral`, appConfig.ui.colors.neutral)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed({
    get() {
      return appConfig.ui.colors.primary
    },
    set(option) {
      appConfig.ui.colors.primary = option
      window.localStorage.setItem(`${name}-ui-primary`, appConfig.ui.colors.primary)
      setBlackAsPrimary(false)
    }
  })

  const radius = computed({
    get() {
      return _radius.value
    },
    set(option) {
      _radius.value = option
    }
  })

  const font = computed({
    get() {
      return _font.value
    },
    set(option) {
      _font.value = option
    }
  })

  const icon = computed({
    get() {
      return _iconSet.value
    },
    set(option) {
      _iconSet.value = option
      appConfig.ui.icons = themeIcons[option as keyof typeof themeIcons] as any
    }
  })

  const modes = computed(() => [
    { label: 'light', icon: appConfig.ui.icons.light },
    { label: 'dark', icon: appConfig.ui.icons.dark },
    { label: 'system', icon: appConfig.ui.icons.system }
  ])
  const mode = computed({
    get() {
      return colorMode.value
    },
    set(option) {
      colorMode.preference = option
    }
  })

  const blackAsPrimary = computed(() => _blackAsPrimary.value)

  function setBlackAsPrimary(value: boolean) {
    _blackAsPrimary.value = value
  }

  const radiusStyle = computed(() => `:root { --ui-radius: ${_radius.value}rem; }`)
  const blackAsPrimaryStyle = computed(() => _blackAsPrimary.value ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')
  const fontStyle = computed(() => `:root { --font-sans: '${_font.value}', sans-serif; }`)

  const link = computed(() => {
    const fontName = _font.value
    const fontConfig = pickerFonts.find(f => f.name === fontName)
    const href = fontConfig?.href
      ?? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`
    return [{
      rel: 'stylesheet' as const,
      href,
      id: `font-${fontName.toLowerCase().replace(/\s+/g, '-')}`
    }]
  })

  const style = [
    { innerHTML: radiusStyle, id: `nuxt-ui-radius`, tagPriority: -2 },
    { innerHTML: blackAsPrimaryStyle, id: `nuxt-ui-black-as-primary`, tagPriority: -2 },
    { innerHTML: fontStyle, id: `nuxt-ui-font`, tagPriority: -2 }
  ]

  const hasCSSChanges = computed(() => {
    return _radius.value !== (movk?.radius ?? SYSTEM_DEFAULT_RADIUS)
      || _blackAsPrimary.value
      || _font.value !== (movk?.font ?? SYSTEM_DEFAULT_FONT)
  })

  const hasConfigChanges = computed(() => {
    return appConfig.ui.colors.primary !== SYSTEM_DEFAULT_PRIMARY
      || appConfig.ui.colors.neutral !== SYSTEM_DEFAULT_NEUTRAL
      || _iconSet.value !== (movk?.icons ?? SYSTEM_DEFAULT_ICONS)
  })

  function exportCSS(): string {
    const lines = [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";'
    ]

    if (_font.value !== SYSTEM_DEFAULT_FONT) {
      lines.push('', '@theme {', `  --font-sans: '${_font.value}', sans-serif;`, '}')
    }

    const rootLines: string[] = []
    if (_radius.value !== SYSTEM_DEFAULT_RADIUS) {
      rootLines.push(`  --ui-radius: ${_radius.value}rem;`)
    }
    if (_blackAsPrimary.value) {
      rootLines.push('  --ui-primary: black;')
    }

    if (rootLines.length) {
      lines.push('', ':root {', ...rootLines, '}')
    }

    const darkLines: string[] = []
    if (_blackAsPrimary.value) {
      darkLines.push('  --ui-primary: white;')
    }

    if (darkLines.length) {
      lines.push('', '.dark {', ...darkLines, '}')
    }
    return lines.join('\n')
  }

  function exportConfig(): string {
    const config: Record<string, any> = {}

    const defaultColors: Record<string, string> = {
      primary: SYSTEM_DEFAULT_PRIMARY,
      neutral: SYSTEM_DEFAULT_NEUTRAL,
      secondary: 'blue',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red'
    }
    const colorEntries = Object.entries(defaultColors).filter(([key, def]) => (appConfig.ui.colors as any)[key] !== def)
    if (colorEntries.length) {
      config.ui = { colors: Object.fromEntries(colorEntries.map(([key]) => [key, (appConfig.ui.colors as any)[key]])) }
    }

    if (_iconSet.value !== SYSTEM_DEFAULT_ICONS) {
      const iconMapping = themeIcons[_iconSet.value as keyof typeof themeIcons]
      config.ui = config.ui || {}
      config.ui.icons = iconMapping
    }

    const configString = JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, '\'')

    return `export default defineAppConfig(${configString})`
  }

  function resetTheme() {
    const defaultPrimary = SYSTEM_DEFAULT_PRIMARY
    const defaultNeutral = SYSTEM_DEFAULT_NEUTRAL
    const defaultRadius = movk?.radius ?? SYSTEM_DEFAULT_RADIUS
    const defaultFont = movk?.font ?? SYSTEM_DEFAULT_FONT
    const defaultIcons = movk?.icons ?? SYSTEM_DEFAULT_ICONS

    appConfig.ui.colors.primary = defaultPrimary
    window.localStorage.removeItem(`${name}-ui-primary`)

    appConfig.ui.colors.neutral = defaultNeutral
    window.localStorage.removeItem(`${name}-ui-neutral`)

    _radius.value = defaultRadius
    _font.value = defaultFont
    _iconSet.value = defaultIcons
    appConfig.ui.icons = themeIcons[defaultIcons as keyof typeof themeIcons] as any
    _blackAsPrimary.value = false
  }

  return {
    style,
    link,
    neutralColors,
    neutral,
    primaryColors,
    primary,
    blackAsPrimary,
    setBlackAsPrimary,
    radiuses,
    radius,
    fonts,
    font,
    icon,
    icons,
    modes,
    mode,
    hasCSSChanges,
    hasConfigChanges,
    configLabel: 'vite.config.ts',
    exportCSS,
    exportConfig,
    resetTheme
  }
}
