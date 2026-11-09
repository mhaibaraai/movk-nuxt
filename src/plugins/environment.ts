import MagicString from 'magic-string'
import { basename, dirname, normalize } from 'pathe'
import { resolvePathSync } from 'mlly'
import { globSync } from 'tinyglobby'
import type { UnpluginOptions } from 'unplugin'
import { runtimeDir, UI_COMPONENTS } from '../unplugin'
import type { MovkUIOptions } from '../unplugin'

function resolveRouterMode(options: MovkUIOptions): 'vue-router' | 'inertia' | 'none' {
  if (options.ui?.router === false) return 'none'
  if (options.ui?.router === 'inertia') return 'inertia'
  return 'vue-router'
}

/**
 * @nuxt/ui Vue 覆盖组件（Icon / Link / LinkBase 等）的「文件名 → 绝对路径」映射。
 * @nuxt/ui 自身的重定向只认它所在副本的 runtime；pnpm 按 peer 拆出多个副本时（如 monorepo 中
 * 项目与 movk 解析到不同副本），其余副本内的相对导入会落到 Nuxt 版组件，这里按文件名兜底
 */
function buildUiOverrideMap(routerMode: 'vue-router' | 'inertia' | 'none'): Map<string, string> {
  const map = new Map<string, string>()
  const dirs = [
    `@nuxt/ui/runtime/vue/overrides/${routerMode}/Link.vue`,
    '@nuxt/ui/runtime/vue/components/Icon.vue'
  ].map(id => dirname(resolvePathSync(id, { extensions: ['.vue'], url: import.meta.url })))
  // 路由覆盖优先级高于通用覆盖
  for (const dir of dirs) {
    for (const file of globSync('**/*.vue', { cwd: dir, absolute: true })) {
      const name = basename(file, '.vue')
      if (!map.has(name)) map.set(name, file)
    }
  }
  return map
}

const RELATIVE_VUE_IMPORT = /^\.{1,2}\/(?:.*\/)?[^/]+\.vue$/

const MOVK_COMPONENTS_VIRTUAL = 'virtual:movk-components'

/**
 * 规整 movk 组件的 Nuxt 环境：
 * - `#imports` → movk vue 桩（@nuxt/ui 同模式桩 + useSiteConfig/useOverlay）
 * - `#components` → movk shim（U* → @nuxt/ui/components，Vue 覆盖由 @nuxt/ui 解析）
 * - 任一 @nuxt/ui 副本 runtime 内的相对 *.vue 导入按文件名重定向到 Vue 覆盖版
 * - movk runtime 内的 `import.meta.client` / `import.meta.dev` 替换为浏览器端等价表达式（对齐 @nuxt/ui）
 */
export default function MovkEnvironmentPlugin(options: MovkUIOptions): UnpluginOptions {
  const routerMode = resolveRouterMode(options)
  const stubPath = resolvePathSync(`../runtime/vue/stubs/${routerMode}`, {
    extensions: ['.ts', '.mjs', '.js'],
    url: import.meta.url
  })
  const uiOverrides = buildUiOverrideMap(routerMode)

  return {
    name: 'movk:environment',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === '#imports') return stubPath
      if (id === '#components') return MOVK_COMPONENTS_VIRTUAL
      if (importer && RELATIVE_VUE_IMPORT.test(id)) {
        const normalized = normalize(importer)
        if (normalized.includes('/@nuxt/ui/') && normalized.includes('/runtime/')) {
          return uiOverrides.get(basename(id, '.vue'))
        }
      }
    },
    loadInclude: id => id === MOVK_COMPONENTS_VIRTUAL,
    load(id) {
      if (id !== MOVK_COMPONENTS_VIRTUAL) return
      // @nuxt/ui 的 nuxt:ui:components 会把包路径导入的 Icon / Link 等重定向到 Vue 覆盖版
      return UI_COMPONENTS
        .map(name => `export { default as ${name} } from ${JSON.stringify(`@nuxt/ui/components/${name.slice(1)}.vue`)}`)
        .join('\n')
    },
    transformInclude(id) {
      return normalize(id).includes(runtimeDir)
    },
    transform(code) {
      if (code.includes('import.meta.client') || code.includes('import.meta.dev')) {
        const s = new MagicString(code)
        s.replaceAll('import.meta.client', 'true')
        s.replaceAll('import.meta.dev', '(process.env.NODE_ENV !== \'production\')')
        if (s.hasChanged()) {
          return { code: s.toString(), map: s.generateMap({ hires: true }) }
        }
      }
    }
  } satisfies UnpluginOptions
}
