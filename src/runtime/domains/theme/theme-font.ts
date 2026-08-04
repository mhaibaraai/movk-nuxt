export interface ThemeFontOption {
  /** `@font-face` 声明的 `font-family`，须与字体样式表逐字一致 */
  name: string
  /** 字体样式表地址；内置字体可省略，自托管字体填入口 CSS 的路径 */
  href?: string
}

// 拆成判别联合而非把 rel 写成宽联合：unhead 以 rel 的字面量区分 link 形态，
// `'preconnect' | 'stylesheet'` 无法赋给其中任一分支。
// 用类型别名而非 interface：unhead 的 ResolvableLink 带 `data-*` 索引签名，
// interface 不具备隐式索引签名，直接写入 app.head.link 会失配
export type ThemeFontLink
  = | { rel: 'preconnect', href: string, crossorigin: '' }
    | { rel: 'stylesheet', href: string, id: string }

/**
 * cdn.mhaibaraai.cn 提供的字体，key 即 `@font-face` 的 `font-family`。
 * 新增字体须同时更新 movk-fonts 仓库的 `scripts/fonts.config.ts`，两处的名字必须逐字相同。
 * @see https://github.com/mhaibaraai/movk-fonts
 */
export const MOVK_FONTS = {
  'Alibaba PuHuiTi': 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css',
  'OPPO Sans': 'https://cdn.mhaibaraai.cn/fonts/oppo-sans.css'
} as const

export type MovkFontFamily = keyof typeof MOVK_FONTS

/** 首选字体缺字或加载失败时的兜底，依次覆盖 macOS、Windows 与 Linux 的系统中文字体 */
const FALLBACK_STACK = [
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"Noto Sans CJK SC"',
  'sans-serif'
]

export function resolveFontId(name: string): string {
  return `font-${name.toLowerCase().replace(/\s+/g, '-')}`
}

/**
 * 归一化 `theme.font`：字符串按内置清单查地址，对象形式用于自托管字体。
 * 未登记且未给 `href` 的名字仍会产出 `--font-sans` 但不发请求——
 * 其 `@font-face` 由项目自己提供，模块无从猜测来源。
 */
export function resolveFontSource(font?: string | ThemeFontOption): ThemeFontOption | undefined {
  if (typeof font === 'string') {
    if (!font) return undefined
    const href = MOVK_FONTS[font as MovkFontFamily]
    return href ? { name: font, href } : { name: font }
  }

  if (!font?.name) return undefined

  return font.href ? { name: font.name, href: font.href } : { name: font.name }
}

/** 相对地址与页面同源，无需预连接 */
function resolveOrigin(href: string): string | undefined {
  try {
    return new URL(href).origin
  } catch {
    return undefined
  }
}

/**
 * 构建期写入 `<head>` 的字体资源。preconnect 必须带 `crossorigin`：
 * woff2 经 CSS 加载是 anonymous CORS 请求，属性不匹配的预热连接不会被复用。
 */
export function resolveFontLinks(source?: ThemeFontOption): ThemeFontLink[] {
  if (!source?.href) return []

  const origin = resolveOrigin(source.href)
  const preconnect: ThemeFontLink[] = origin ? [{ rel: 'preconnect', href: origin, crossorigin: '' }] : []

  return [
    ...preconnect,
    { rel: 'stylesheet', href: source.href, id: resolveFontId(source.name) }
  ]
}

/** 拼接 `--font-sans` 的取值：首选字体在前，系统中文字体兜底在后 */
export function resolveFontFamily(name: string): string {
  return [JSON.stringify(name), ...FALLBACK_STACK].join(', ')
}
