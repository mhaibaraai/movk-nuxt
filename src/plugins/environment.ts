import MagicString from 'magic-string'
import { basename, dirname, normalize } from 'pathe'
import { resolvePathSync } from 'mlly'
import { globSync } from 'tinyglobby'
import type { UnpluginOptions } from 'unplugin'
import { runtimeDir, UI_COMPONENTS } from '../unplugin'
import type { MovkUIOptions } from '../unplugin'

function resolveRouterMode(options: MovkUIOptions): 'vue-router' | 'inertia' | 'none' {
  if (options.router === false) return 'none'
  if (options.router === 'inertia') return 'inertia'
  return 'vue-router'
}

/**
 * 构建 @nuxt/ui Vue 覆盖组件的「文件名 → 覆盖文件绝对路径」映射。
 * 复刻 @nuxt/ui 在 Vue 模式下用 Vue 兼容版替换 Nuxt 版（Icon / Link / LinkBase / color-mode）的语义；
 * Nuxt 版会引用 `#build/nuxt-icon-client-bundle`、`NuxtLink` 等 Nuxt 专属物，在纯 Vite 下无效。
 */
function buildUiOverrideMap(routerMode: 'vue-router' | 'inertia' | 'none'): Map<string, string> {
  const map = new Map<string, string>()
  const overridesLink = resolvePathSync(`@nuxt/ui/runtime/vue/overrides/${routerMode}/Link.vue`, {
    extensions: ['.vue'],
    url: import.meta.url
  })
  const componentsIcon = resolvePathSync('@nuxt/ui/runtime/vue/components/Icon.vue', {
    extensions: ['.vue'],
    url: import.meta.url
  })
  // 路由覆盖优先级高于通用覆盖
  for (const dir of [dirname(overridesLink), dirname(componentsIcon)]) {
    for (const file of globSync('**/*.vue', { cwd: dir, absolute: true })) {
      const name = basename(file, '.vue')
      if (!map.has(name)) map.set(name, file)
    }
  }
  return map
}

const MOVK_COMPONENTS_VIRTUAL = 'virtual:movk-components'

/**
 * 规整 movk 组件的 Nuxt 环境：
 * - `#imports` → movk vue 桩（@nuxt/ui 同模式桩 + useSiteConfig/useOverlay）
 * - `#components` → movk shim（U* → @nuxt/ui/components、LazyMMessageBox → 本地 MessageBox）
 * - movk runtime 内的 `import.meta.client` 替换为 true
 */
export default function MovkEnvironmentPlugin(options: MovkUIOptions): UnpluginOptions {
  const routerMode = resolveRouterMode(options)
  const stubPath = resolvePathSync(`../runtime/vue/stubs/${routerMode}`, {
    extensions: ['.ts', '.mjs', '.js'],
    url: import.meta.url
  })
  const messageBoxPath = resolvePathSync('../runtime/components/MessageBox', {
    extensions: ['.vue'],
    url: import.meta.url
  })
  const uiOverrides = buildUiOverrideMap(routerMode)

  return {
    name: 'movk:environment',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === '#imports') return stubPath
      if (id === '#components') return MOVK_COMPONENTS_VIRTUAL
      // 把 @nuxt/ui runtime 内相对 *.vue 导入按文件名重定向到 Vue 覆盖版
      if (importer && /^\.{1,2}\/(?:.*\/)?[^/]+\.vue$/.test(id)) {
        const ni = normalize(importer)
        if (ni.includes('/@nuxt/ui/') && ni.includes('/runtime/')) {
          const override = uiOverrides.get(basename(id, '.vue'))
          if (override) return override
        }
      }
    },
    loadInclude: id => id === MOVK_COMPONENTS_VIRTUAL,
    load(id) {
      if (id !== MOVK_COMPONENTS_VIRTUAL) return
      const iconOverride = uiOverrides.get('Icon')
      const reExports = UI_COMPONENTS.map((name) => {
        // UIcon 用 @nuxt/ui 的 Vue 覆盖版（Nuxt 版 Icon.vue 会拉入 @nuxt/icon 的 #build 虚拟模块）
        const from = name === 'UIcon' && iconOverride
          ? iconOverride
          : `@nuxt/ui/components/${name.slice(1)}.vue`
        return `export { default as ${name} } from ${JSON.stringify(from)}`
      })
      return [
        `import LazyMMessageBoxComponent from ${JSON.stringify(messageBoxPath)}`,
        ...reExports,
        `export const LazyMMessageBox = LazyMMessageBoxComponent`
      ].join('\n')
    },
    transformInclude(id) {
      return normalize(id).includes(runtimeDir)
    },
    transform(code) {
      if (code.includes('import.meta.client')) {
        const s = new MagicString(code)
        s.replaceAll('import.meta.client', 'true')
        if (s.hasChanged()) {
          return { code: s.toString(), map: s.generateMap({ hires: true }) }
        }
      }
    }
  } satisfies UnpluginOptions
}
