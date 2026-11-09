import type { MovkUIOptions } from '../../src/unplugin'
import { isAbsolute } from 'pathe'
import { describe, expect, it } from 'vitest'
import MovkAppConfigPlugin from '../../src/plugins/app-config'
import { getDefaultConfig } from '../../src/runtime/utils/theme-defaults'

/** 对 @nuxt/ui 的 app-config 虚拟模块执行 transform，返回注入后的代码 */
function transformAppConfig(code: string) {
  const plugin = MovkAppConfigPlugin({} as MovkUIOptions)
  const transform = plugin.transform as (code: string, id: string) => { code: string } | undefined
  return transform(code, 'virtual:nuxt-ui-app-config')?.code
}

describe('MovkAppConfigPlugin 的 app-config 注入', () => {
  it('defu 以包内 ESM 绝对路径导入，不依赖消费方安装', () => {
    const code = transformAppConfig('export default {"ui":{}}')
    const specifier = code?.match(/import \{ defu as __movkDefu \} from (".*")/)?.[1]

    expect(code).not.toContain(`from 'defu'`)
    expect(specifier).toBeDefined()

    const path = JSON.parse(specifier!) as string
    expect(isAbsolute(path)).toBe(true)
    expect(path).toMatch(/defu\.mjs$/)
  })

  it('仅注入 movk 与 movkSite 键，色板交由 CSS 的 @nuxt/ui/colors 声明', () => {
    const code = transformAppConfig('export default {"ui":{}}')
    expect(code).toContain(`movk: ${JSON.stringify(getDefaultConfig())}`)
    expect(code).toContain('movkSite:')
    expect(code).not.toMatch(/ui: __movkDefu\(/)
    expect(code).not.toMatch(/"colors"|\bcolors:/)
  })

  it('非 app-config 模块不做处理', () => {
    const plugin = MovkAppConfigPlugin({} as MovkUIOptions)
    const transform = plugin.transform as (code: string, id: string) => unknown
    expect(transform('export default {}', '/src/main.ts')).toBeUndefined()
  })
})
