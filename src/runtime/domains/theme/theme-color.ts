import colors from 'tailwindcss/colors'

type Shades = Record<number, string>

/** 浏览器 theme-color：深色模式取中性色 900 色阶，自定义中性色（非 Tailwind 内置色板）回退到 neutral */
export function resolveThemeColor(neutral: string, mode: string): string {
  if (mode !== 'dark') return 'white'
  const shades = (colors as unknown as Record<string, Shades | undefined>)[neutral] ?? colors.neutral
  return shades[900]!
}
