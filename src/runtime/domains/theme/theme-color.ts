import colors from 'tailwindcss/colors'

type Shades = Record<number, string>
const palettes: Partial<Record<string, Shades | string>> = colors

function resolvePalette(color: string): Shades | undefined {
  const palette = palettes[color]
  return typeof palette === 'object' ? palette : undefined
}

/** 浏览器 theme-color：深色模式取中性色 900 色阶，自定义中性色（非 Tailwind 内置色板）回退到 neutral */
export function resolveThemeColor(neutral: string, mode: string): string {
  if (mode !== 'dark') return 'white'
  const shades = resolvePalette(neutral) ?? colors.neutral
  return shades[900]!
}

export function resolveSwatchColor(color: string, shade: 400 | 500, prefix?: string): string {
  const variable = `--${prefix ? `${prefix}-` : ''}color-${color}-${shade}`
  // Tailwind 可能省略仅在运行时引用的色阶。
  const fallback = resolvePalette(color === 'old-neutral' ? 'neutral' : color)?.[shade]
  return fallback ? `var(${variable}, ${fallback})` : `var(${variable})`
}
