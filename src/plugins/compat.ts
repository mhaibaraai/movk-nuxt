import type { UnpluginOptions } from 'unplugin'

const DOCS_URL = 'https://nuxt.mhaibaraai.cn/docs/getting-started/vue'

/** 通配或表单元素 reset 选择器（presetWind3/4、presetUno 的 preflight 均以此开头） */
const RESET_SELECTOR_RE = /(?:^|[}\s])(?:\*\s*,\s*::?(?:before|after)|button\s*,\s*input)\b/

/** 剔除所有 `@layer ... { }` 块，只保留非 layer 的 CSS */
function stripLayerBlocks(css: string): string {
  let out = ''
  let i = 0
  while (i < css.length) {
    const start = css.indexOf('@layer', i)
    if (start === -1) {
      out += css.slice(i)
      break
    }
    out += css.slice(i, start)
    const open = css.indexOf('{', start)
    const semi = css.indexOf(';', start)
    // `@layer a, b;` 仅声明顺序，无块体
    if (open === -1 || (semi !== -1 && semi < open)) {
      i = semi === -1 ? css.length : semi + 1
      continue
    }
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    i = j
  }
  return out
}

/** CSS 中是否存在不在 `@layer` 内的全局 reset */
export function hasUnlayeredReset(css: string): boolean {
  return RESET_SELECTOR_RE.test(stripLayerBlocks(css))
}

interface UnoApiPlugin {
  name: string
  api?: {
    getContext: () => {
      ready: Promise<unknown>
      uno: {
        config: { outputToCssLayers?: unknown }
        generate: (input: string, options: { preflights: boolean }) => Promise<{ css: string }>
      }
    }
  }
}

const WARNING = [
  'UnoCSS 输出了未分层的 reset（preflights），会覆盖 Nuxt UI 位于 @layer utilities 的样式（背景、内边距、圆角等失效）。',
  '请在 uno.config 中关闭：presetWind4({ preflights: { reset: false } })，Tailwind 的 @layer base 已提供等价 reset。',
  `详见 ${DOCS_URL}`
].join('\n')

/**
 * Vue 模式下与既有样式方案的兼容检测（仅 dev，不改变任何行为）。
 * 未分层的样式无视选择器优先级压过 `@layer` 内样式，UnoCSS 默认 preflight 即属此类。
 */
export default function MovkCompatPlugin(): UnpluginOptions {
  return {
    name: 'movk:compat',
    vite: {
      apply: 'serve',
      async configResolved(config) {
        const unoApi = (config.plugins as readonly UnoApiPlugin[]).find(p => p.name === 'unocss:api')?.api
        if (!unoApi) return

        try {
          const ctx = unoApi.getContext()
          await ctx.ready
          if (ctx.uno.config.outputToCssLayers) return

          const { css } = await ctx.uno.generate('', { preflights: true })
          if (hasUnlayeredReset(css)) console.warn(`[movk] ${WARNING}`)
        }
        catch {
          // 检测仅为提示，UnoCSS 内部 API 变动时静默跳过
        }
      }
    }
  } satisfies UnpluginOptions
}
