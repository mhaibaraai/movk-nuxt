interface ThemeLike {
  slots?: Record<string, unknown>
  variants?: Record<string, unknown>
  compoundVariants?: Array<{ class?: unknown }>
}

/**
 * 构建期求值主题，收集全部类名供 `@source inline()` 使用。
 * 主题以模板字符串拼接类名（如 data-table），dist 中的 JS 无法被 Tailwind 直接扫描
 */
export function getThemeClasses(themes: ThemeLike[], prefix?: string): string[] {
  const classes = new Set<string>()

  const collect = (value: unknown): void => {
    if (typeof value === 'string') {
      value.split(/\s+/).filter(Boolean).forEach(cls => classes.add(prefix ? `${prefix}:${cls}` : cls))
    } else if (Array.isArray(value)) {
      value.forEach(collect)
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(collect)
    }
  }

  for (const theme of themes) {
    collect(theme.slots)
    collect(theme.variants)
    theme.compoundVariants?.forEach(entry => collect(entry.class))
  }

  return [...classes]
}
