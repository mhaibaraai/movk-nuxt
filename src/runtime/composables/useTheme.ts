import { useAppConfig, useColorMode, useSiteConfig } from '#imports'
import { resolveThemeIcons, themeIcons } from '../domains/theme/theme-icons'
import { resolveActiveFont, resolveFontLinks, resolveFontStyle, type ThemeFontOption } from '../domains/theme/theme-font'
import { omit, kebabCase } from '@movk/core'
import { useLocalStorage } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { computed } from 'vue'
import { getDefaultConfig } from '../utils/theme-defaults'

type IconSet = 'lucide' | 'phosphor' | 'tabler'

export function useTheme() {
  const { movk, ui } = useAppConfig()
  const colorMode = useColorMode()
  const name = kebabCase(useSiteConfig().name)

  const color = computed<string>(() => colorMode.value === 'dark' ? (colors as any)[ui.colors.neutral][900] : 'white')

  const defaultConfig = getDefaultConfig()

  const _radius = useLocalStorage(`${name}-ui-radius`, movk?.radius ?? defaultConfig.radius)
  const _font = useLocalStorage(`${name}-ui-font`, '')
  const _iconSet = useLocalStorage(`${name}-ui-icons`, movk?.icons ?? defaultConfig.icons)
  const _blackAsPrimary = useLocalStorage(`${name}-ui-black-as-primary`, defaultConfig.blackAsPrimary)

  const pickerFonts: ThemeFontOption[] = movk?.picker?.fonts ?? []
  const configuredFont: string = movk?.font ?? defaultConfig.font
  const activeFont = computed(() => resolveActiveFont(_font.value, configuredFont))

  const neutralColors: string[] = movk?.picker?.neutralColors ?? []
  const neutral = computed<string>({
    get() {
      return ui.colors.neutral
    },
    set(option) {
      ui.colors.neutral = option as typeof ui.colors.neutral
      window.localStorage.setItem(`${name}-ui-neutral`, ui.colors.neutral)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed<string>({
    get() {
      return ui.colors.primary
    },
    set(option) {
      ui.colors.primary = option as typeof ui.colors.primary
      window.localStorage.setItem(`${name}-ui-primary`, ui.colors.primary)
      setBlackAsPrimary(false)
    }
  })

  const radiuses: number[] = movk?.picker?.radiuses ?? []
  const radius = computed<number>({
    get() {
      return _radius.value
    },
    set(option) {
      _radius.value = option
    }
  })

  const fonts: string[] = pickerFonts.map(f => f.name)
  const font = computed<string>({
    get() {
      return activeFont.value
    },
    set(option) {
      _font.value = option
    }
  })

  const icons: { label: string, icon: string, value: IconSet }[] = [
    { label: 'Lucide', icon: 'i-lucide-feather', value: 'lucide' },
    { label: 'Phosphor', icon: 'i-ph-phosphor-logo', value: 'phosphor' },
    { label: 'Tabler', icon: 'i-tabler-brand-tabler', value: 'tabler' }
  ]
  const icon = computed<IconSet>({
    get() {
      return _iconSet.value as IconSet
    },
    set(option) {
      _iconSet.value = option
      ui.icons = resolveThemeIcons(option, ui.icons) as any
    }
  })

  const modes = computed(() => [
    { label: 'light', icon: ui.icons.light },
    { label: 'dark', icon: ui.icons.dark },
    { label: 'system', icon: ui.icons.system }
  ])
  const mode = computed<string>({
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
  const fontStyle = computed(() => resolveFontStyle(activeFont.value))

  const link = computed(() => resolveFontLinks(activeFont.value, pickerFonts))

  const style = [
    { innerHTML: radiusStyle, id: `nuxt-ui-radius`, tagPriority: -2 },
    { innerHTML: blackAsPrimaryStyle, id: `nuxt-ui-black-as-primary`, tagPriority: -2 },
    { innerHTML: fontStyle, id: `nuxt-ui-font`, tagPriority: -2 }
  ]

  const hasCSSChanges = computed(() => {
    return _radius.value !== (movk?.radius ?? defaultConfig.radius)
      || _blackAsPrimary.value
      || activeFont.value !== configuredFont
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

    if (activeFont.value && activeFont.value !== configuredFont) {
      lines.push('', '@theme {', `  --font-sans: ${JSON.stringify(activeFont.value)}, sans-serif;`, '}')
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
    // 清空用户选择，activeFont 自然回落到配置的默认字体
    _font.value = ''
    _iconSet.value = defaultIcon
    ui.icons = resolveThemeIcons(defaultIcon, ui.icons) as any
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
