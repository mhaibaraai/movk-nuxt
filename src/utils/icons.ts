import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'pathe'
import { globSync } from 'tinyglobby'

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'icon:clientBundleIcons'(icons: Set<string>): void
  }
}

/** 默认图标集缺失会让每个 movk 组件的图标都走运行时请求，值得一条显式告警 */
const DEFAULT_ICON_COLLECTION = 'lucide'

/** dist 保留 .vue，其余源码视构建形态产出 .ts / .js / .mjs，四种都扫 */
const ICON_SOURCE_GLOB = ['**/*.{vue,ts,js,mjs}']

/** movk 组件与 themeIcons 用到的图标集，前缀与 `@iconify-json/*` 包名一一对应 */
const ICON_RE = /i-(lucide|ph|tabler)-([a-z\d]+(?:-[a-z\d]+)*)/g

/**
 * 扫描 movk runtime 内的图标字面量，产出 `prefix:name` 形式。
 * 消费方的扫描器只扫自己的 layer 且排除 node_modules，movk 组件与 themeIcons 的图标
 * 一个都拿不到，必须由模块自己收集后交给 `@nuxt/icon`。
 */
export function scanMovkIcons(runtimeDir: string, options: { theme?: boolean } = {}): string[] {
  const ignore = options.theme === false
    ? ['domains/theme/**', 'components/theme-picker/**']
    : []

  const files = globSync(ICON_SOURCE_GLOB, { cwd: runtimeDir, ignore, absolute: true })
  const icons = new Set<string>()

  for (const file of files) {
    let code: string
    try {
      code = readFileSync(file, 'utf-8')
    } catch {
      continue
    }

    for (const match of code.matchAll(ICON_RE)) {
      icons.add(`${match[1]}:${match[2]}`)
    }
  }

  return [...icons].sort()
}

function isCollectionInstalled(prefix: string, paths: string[]): boolean {
  for (const dir of paths) {
    try {
      createRequire(join(dir, 'index.js')).resolve(`@iconify-json/${prefix}/icons.json`)
      return true
    } catch {
      // 换下一个解析根
    }
  }
  return false
}

/**
 * 只保留图标数据能从消费方项目解析到的图标集。
 * `@iconify-json/*` 是 movk 的开发依赖，pnpm 下对消费方不可见；未安装的图标集若照样下发，
 * Vue 模式会在 build 阶段直接抛错，Nuxt 模式则白跑一趟解析。
 */
export function filterResolvableIcons(icons: string[], paths: string[]): { icons: string[], missing: string[] } {
  const installed = new Map<string, boolean>()
  const missing = new Set<string>()
  const kept: string[] = []

  for (const icon of icons) {
    const prefix = icon.split(':')[0]!
    if (!installed.has(prefix)) {
      installed.set(prefix, isCollectionInstalled(prefix, paths))
    }

    if (installed.get(prefix)) {
      kept.push(icon)
    } else {
      missing.add(prefix)
    }
  }

  return { icons: kept, missing: [...missing] }
}

export interface MovkIconsResult {
  /** 可进构建期图标包的图标，`prefix:name` 形式 */
  icons: string[]
  /** 未安装 `@iconify-json/*` 因而被剔除的图标集，缺失即回退运行时按需加载 */
  missing: string[]
}

/** 收集 movk 自有图标并按消费方已安装的图标集过滤，两种模式共用 */
export function resolveMovkIcons(runtimeDir: string, options: { theme?: boolean, paths: string[] }): MovkIconsResult {
  return filterResolvableIcons(
    scanMovkIcons(runtimeDir, { theme: options.theme }),
    options.paths
  )
}

/** 缺失提示文案；仅默认图标集值得告警，其余（只有 ThemePicker 切换才用到）交由调用方降级 */
export function formatMissingCollections(missing: string[]) {
  const hint = (prefixes: string[]) => {
    const packages = prefixes.map(prefix => `@iconify-json/${prefix}`)
    return `Missing ${packages.map(pkg => `\`${pkg}\``).join(', ')}, so Movk icons from these collections are loaded at runtime. `
      + `Install to bundle them at build time: \`npx nypm add -D ${packages.join(' ')}\``
  }

  const required = missing.filter(prefix => prefix === DEFAULT_ICON_COLLECTION)
  const optional = missing.filter(prefix => prefix !== DEFAULT_ICON_COLLECTION)

  return {
    warn: required.length ? hint(required) : undefined,
    debug: optional.length ? hint(optional) : undefined
  }
}
