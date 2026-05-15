import { useAppConfig, useColorMode, useSiteConfig } from '#imports'
import { themeIcons } from '../domains/theme/theme-icons'
import { omit, kebabCase } from '@movk/core'
import { useLocalStorage } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { computed } from 'vue'
import { getDefaultConfig } from '../../utils/defaults'

export function useTheme() {
  const { movk, ui } = useAppConfig()
  const colorMode = useColorMode()
  const name = kebabCase(useSiteConfig().name)

  const color = computed(() => colorMode.value === 'dark' ? (colors as any)[ui.colors.neutral][900] : 'white')

  const defaultConfig = getDefaultConfig()

  const _radius = useLocalStorage(`${name}-ui-radius`, movk?.radius ?? defaultConfig.radius)
  const _font = useLocalStorage(`${name}-ui-font`, movk?.font ?? defaultConfig.font)
  const _iconSet = useLocalStorage(`${name}-ui-icons`, movk?.icons ?? defaultConfig.icons)
  const _blackAsPrimary = useLocalStorage(`${name}-ui-black-as-primary`, defaultConfig.blackAsPrimary)

  const pickerFonts = movk?.picker?.fonts ?? []

  const neutralColors = movk?.picker?.neutralColors ?? []
  const neutral = computed({
    get() {
      return ui.colors.neutral
    },
    set(option) {
      ui.colors.neutral = option
      window.localStorage.setItem(`${name}-ui-neutral`, ui.colors.neutral)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed({
    get() {
      return ui.colors.primary
    },
    set(option) {
      ui.colors.primary = option
      window.localStorage.setItem(`${name}-ui-primary`, ui.colors.primary)
      setBlackAsPrimary(false)
    }
  })

  const radiuses = movk?.picker?.radiuses ?? []
  const radius = computed({
    get() {
      return _radius.value
    },
    set(option) {
      _radius.value = option
    }
  })

  const fonts = pickerFonts.map(f => f.name)
  const font = computed({
    get() {
      return _font.value
    },
    set(option) {
      _font.value = option
    }
  })

  const icons = [
    { label: 'Lucide', icon: 'i-lucide-feather', value: 'lucide' },
    { label: 'Phosphor', icon: 'i-ph-phosphor-logo', value: 'phosphor' },
    { label: 'Tabler', icon: 'i-tabler-brand-tabler', value: 'tabler' }
  ]
  const icon = computed({
    get() {
      return _iconSet.value
    },
    set(option) {
      _iconSet.value = option
      ui.icons = themeIcons[option as keyof typeof themeIcons] as any
    }
  })

  const modes = computed(() => [
    { label: 'light', icon: ui.icons.light },
    { label: 'dark', icon: ui.icons.dark },
    { label: 'system', icon: ui.icons.system }
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
    return _radius.value !== (movk?.radius ?? defaultConfig.radius)
      || _blackAsPrimary.value
      || _font.value !== (movk?.font ?? defaultConfig.font)
  })

  const hasConfigChanges = computed(() => {
    return ui.colors.primary !== 'blue'
      || ui.colors.neutral !== 'slate'
      || _iconSet.value !== (movk?.icons ?? defaultConfig.icons)
  })

  function exportCSS(): string {
    const lines = [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";'
    ]

    if (_font.value !== defaultConfig.font) {
      lines.push('', '@theme {', `  --font-sans: '${_font.value}', sans-serif;`, '}')
    }

    const rootLines: string[] = []
    if (_radius.value !== defaultConfig.radius) {
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
      primary: 'blue',
      neutral: 'slate',
      secondary: 'blue',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red'
    }
    const colorEntries = Object.entries(defaultColors).filter(([key, def]) => (ui.colors as any)[key] !== def)
    if (colorEntries.length) {
      config.ui = { colors: Object.fromEntries(colorEntries.map(([key]) => [key, (ui.colors as any)[key]])) }
    }

    if (_iconSet.value !== defaultConfig.icons) {
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
    const defaultPrimary = 'blue'
    const defaultNeutral = 'slate'
    const defaultIcon = movk?.icons ?? defaultConfig.icons

    ui.colors.primary = defaultPrimary
    window.localStorage.removeItem(`${name}-ui-primary`)

    ui.colors.neutral = defaultNeutral
    window.localStorage.removeItem(`${name}-ui-neutral`)

    _radius.value = movk?.radius ?? defaultConfig.radius
    _font.value = movk?.font ?? defaultConfig.font
    _iconSet.value = defaultIcon
    ui.icons = themeIcons[defaultIcon as keyof typeof themeIcons] as any
    _blackAsPrimary.value = movk?.blackAsPrimary ?? defaultConfig.blackAsPrimary
  }

  return {
    color,
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
    configLabel: 'app.config.ts',
    exportCSS,
    exportConfig,
    resetTheme
  }
}
