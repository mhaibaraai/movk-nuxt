import colors from 'tailwindcss/colors'

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

type Shades = Record<(typeof SHADES)[number], string>
type PaletteAlias = 'primary' | 'neutral'

export type PaletteVars = Record<string, string>

interface StyleTarget {
  style: Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'>
}

const palettes = colors as unknown as Record<string, Shades | string | undefined>

/**
 * 运行时色板变量。v5 由 `@plugin "@nuxt/ui/colors"` 在构建期写入 `--ui-color-<alias>-<shade>`，
 * 这里直接取 Tailwind 色板字面值覆盖，不依赖产物中是否含 `--color-<palette>-*`
 */
export function resolvePaletteVars(selection: Partial<Record<PaletteAlias, string | null>>): PaletteVars {
  return Object.fromEntries(Object.entries(selection).flatMap(([alias, palette]) => {
    const shades = palette ? palettes[palette] : undefined
    if (!shades || typeof shades !== 'object') return []
    return SHADES.map(shade => [`--ui-color-${alias}-${shade}`, shades[shade]])
  }))
}

/** 以内联样式写入色板变量，并移除上一次写入但本次不再需要的变量 */
export function applyPaletteVars(el: StyleTarget, next: PaletteVars, prev: PaletteVars = {}): void {
  for (const key of Object.keys(prev)) {
    if (!(key in next)) el.style.removeProperty(key)
  }
  for (const [key, value] of Object.entries(next)) {
    el.style.setProperty(key, value)
  }
}
