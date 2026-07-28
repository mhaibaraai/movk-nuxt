export interface ThemeFontOption {
  name: string
  href?: string
}

// 类型别名而非 interface：unhead 的 ResolvableLink 带 `data-*` 索引签名，
// interface 不具备隐式索引签名，直接传入 useHead 会失配
export type ThemeFontLink = {
  rel: 'stylesheet'
  href: string
  id: string
}

export function googleFontsHref(name: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`
}

export function resolveFontId(name: string): string {
  return `font-${name.toLowerCase().replace(/\s+/g, '-')}`
}

/**
 * 仅为已登记的字体解析样式表地址：缺省 href 的可选项视为 Google Fonts 托管，
 * 未登记的字体不猜测来源，避免在无法访问 Google 的网络环境下发出必然失败的请求。
 */
export function resolveFontHref(name: string, fonts: ThemeFontOption[]): string | undefined {
  const option = fonts.find(f => f.name === name)
  if (!option) return undefined

  return option.href ?? googleFontsHref(name)
}

export function resolveFontLinks(name: string | undefined, fonts: ThemeFontOption[]): ThemeFontLink[] {
  if (!name) return []

  const href = resolveFontHref(name, fonts)
  if (!href) return []

  return [{ rel: 'stylesheet', href, id: resolveFontId(name) }]
}

/**
 * 未指定字体时输出空规则。该 style 无层级（unlayered），会压过使用者写在
 * `@theme` 中的 `--font-sans`，因此只在字体被显式配置或用户主动切换时才声明。
 */
export function resolveFontStyle(name: string | undefined): string {
  if (!name) return ':root {}'

  return `:root { --font-sans: ${JSON.stringify(name)}, sans-serif; }`
}

/**
 * 合并用户选择与配置的默认字体。项目未配置 `theme.font` 时 localStorage 会存下空串，
 * 之后再配置默认字体不应被这份历史残留屏蔽，故空串视同未选择。
 */
export function resolveActiveFont(stored: string | undefined, configured: string | undefined): string {
  return stored || configured || ''
}

/** 预解析全部可选项地址，供预水合脚本查表，避免客户端重复猜测字体来源 */
export function resolveFontHrefMap(fonts: ThemeFontOption[]): Record<string, string> {
  return Object.fromEntries(
    fonts.map(f => [f.name, f.href ?? googleFontsHref(f.name)])
  )
}
