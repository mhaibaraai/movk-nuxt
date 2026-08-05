import type { UnpluginOptions } from 'unplugin'
import type { MovkUIOptions } from '../unplugin'
import { resolveFontLinks, resolveFontSource, resolveFontWarning } from '../runtime/domains/theme/theme-font'

/**
 * 把 `theme.font` 解析出的字体样式表 `<link>` 注入 `index.html`。
 * Nuxt 模式的对等实现是 `addFontLinks`（src/utils/theme.ts），经 SSR head 直出。
 *
 * 用 `transformIndexHtml` 而非运行时 `useHead`：dev 与 build 两条路径都随 HTML 直出，不依赖运行时 JS。
 * `injectTo` 取 `'head'` 而非 `'head-prepend'` 是权衡——后者会插到 `<meta charset>` 之前，
 * 代价是字体样式表排在 Vite 注入的 JS/CSS 之后。
 */
export default function MovkFontPlugin(options: MovkUIOptions): UnpluginOptions {
  const source = options.theme?.enabled === false ? undefined : resolveFontSource(options.theme?.font)
  const links = resolveFontLinks(source)

  if (source && !links.length) {
    console.warn(`[movk] ${resolveFontWarning(source.name)}`)
  }

  const tags = links.map(link => ({ tag: 'link', attrs: link, injectTo: 'head' as const }))

  return {
    name: 'movk:font',
    vite: { transformIndexHtml: () => tags }
  } satisfies UnpluginOptions
}
