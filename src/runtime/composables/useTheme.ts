import { useAppConfig, useColorMode, useSiteConfig } from '#imports'
import { resolveThemeIcons, themeIcons } from '../domains/theme/theme-icons'
import { resolveActiveRadius, resolveRadiusStyle } from '../domains/theme/theme-radius'
import { omit, kebabCase } from '@movk/core'
import { useLocalStorage } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { computed } from 'vue'
import { getDefaultConfig } from '../utils/theme-defaults'

type IconSet = 'lucide' | 'phosphor' | 'tabler'

/** @nuxt/ui 自身的 --ui-radius 默认值，仅用于 ThemePicker 在未配置时的回显 */
const UI_DEFAULT_RADIUS = 0.25

export function useTheme() {
  const { movk, ui } = useAppConfig()
  const colorMode = useColorMode()
  const name = kebabCase(useSiteConfig().name)

  const color = computed<string>(() => colorMode.value === 'dark' ? (colors as any)[ui.colors.neutral][900] : 'white')

  const defaultConfig = getDefaultConfig()

  // writeDefaults: false —— 未主动选择时不落盘，避免默认值被固化为历史残留
  const _radius = useLocalStorage<number | null>(`${name}-ui-radius`, null, { writeDefaults: false })
  const _iconSet = useLocalStorage(`${name}-ui-icons`, movk?.icons ?? defaultConfig.icons)
  const _blackAsPrimary = useLocalStorage(`${name}-ui-black-as-primary`, defaultConfig.blackAsPrimary)

  const configuredRadius: number | undefined = movk?.radius ?? defaultConfig.radius
  const activeRadius = computed(() => resolveActiveRadius(_radius.value, configuredRadius))

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
      return activeRadius.value ?? UI_DEFAULT_RADIUS
    },
    set(option) {
      _radius.value = option
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

  const radiusStyle = computed(() => resolveRadiusStyle(activeRadius.value))
  const blackAsPrimaryStyle = computed(() => _blackAsPrimary.value ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')

  const style = [
    { innerHTML: radiusStyle, id: `nuxt-ui-radius`, tagPriority: -2 },
    { innerHTML: blackAsPrimaryStyle, id: `nuxt-ui-black-as-primary`, tagPriority: -2 }
  ]

  const hasCSSChanges = computed(() => {
    return activeRadius.value !== configuredRadius
      || _blackAsPrimary.value
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

    const rootLines: string[] = []
    if (activeRadius.value !== undefined && activeRadius.value !== configuredRadius) {
      rootLines.push(`  --ui-radius: ${activeRadius.value}rem;`)
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

    _radius.value = null
    _iconSet.value = defaultIcon
    ui.icons = resolveThemeIcons(defaultIcon, ui.icons) as any
    _blackAsPrimary.value = movk?.blackAsPrimary ?? defaultConfig.blackAsPrimary
  }

  return {
    color,
    style,
    neutralColors,
    neutral,
    primaryColors,
    primary,
    blackAsPrimary,
    setBlackAsPrimary,
    radiuses,
    radius,
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
