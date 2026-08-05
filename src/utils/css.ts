import type { Nuxt } from '@nuxt/schema'
import { readFile } from 'node:fs/promises'
import { resolveAlias, useLogger } from '@nuxt/kit'

/** `@import "@movk/nuxt"` 的各种引号与结尾写法 */
const MOVK_CSS_IMPORT = /@import\s+["']@movk\/nuxt["']/

/**
 * 模块样式由项目 CSS 显式引入（对齐 `@nuxt/ui`），模块不自动注册到 `nuxt.options.css`：
 * 自动注册会形成第二个 Tailwind root，其默认主题转储会覆盖模块注入的 `--font-sans` 等内置主题变量。
 * 漏写时样式整体失效，故在构建期显式告警而非静默。
 */
export async function checkMovkCss(nuxt: Nuxt) {
  for (const entry of nuxt.options.css || []) {
    if (entry === '@movk/nuxt') return

    try {
      if (MOVK_CSS_IMPORT.test(await readFile(resolveAlias(entry), 'utf-8'))) return
    } catch {
      // 裸包名等无法按路径读取的入口交由其余入口判定
    }
  }

  useLogger('movk').warn(
    'Movk styles are not imported. Add `@import "@movk/nuxt";` after `@import "tailwindcss";` '
    + 'in your main CSS file, and register that file in `nuxt.config.ts` under `css`.'
  )
}
