import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { filterResolvableIcons, formatMissingCollections, resolveMovkIcons, scanMovkIcons } from '../../src/utils/icons'

/** 仿 runtime 目录结构：组件字面量与 theme 域各占一处，便于验证 theme 开关 */
function createRuntime() {
  const dir = mkdtempSync(join(tmpdir(), 'movk-icons-'))

  mkdirSync(join(dir, 'components/theme-picker'), { recursive: true })
  mkdirSync(join(dir, 'domains/theme'), { recursive: true })

  writeFileSync(join(dir, 'components/SlideVerify.vue'), '<template><UIcon name="i-lucide-chevrons-right" /></template>')
  writeFileSync(join(dir, 'components/theme-picker/ThemePicker.vue'), 'icon="i-lucide-swatch-book"')
  writeFileSync(join(dir, 'domains/theme/theme-icons.ts'), `export const themeIcons = {
    lucide: { check: 'i-lucide-check' },
    phosphor: { check: 'i-ph-check' },
    tabler: { check: 'i-tabler-check' }
  }`)
  writeFileSync(join(dir, 'domains/theme/theme.css'), '.foo { --icon: i-lucide-not-scanned }')

  return dir
}

describe('scanMovkIcons', () => {
  it('从 .vue 与 .ts 提取三套图标集并归一化为 prefix:name', () => {
    expect(scanMovkIcons(createRuntime())).toEqual([
      'lucide:check',
      'lucide:chevrons-right',
      'lucide:swatch-book',
      'ph:check',
      'tabler:check'
    ])
  })

  it('只认 vue/ts/js/mjs，其余文件类型不参与扫描', () => {
    expect(scanMovkIcons(createRuntime())).not.toContain('lucide:not-scanned')
  })

  it('theme 关闭时排除 theme 域与 ThemePicker 的图标', () => {
    expect(scanMovkIcons(createRuntime(), { theme: false })).toEqual(['lucide:chevrons-right'])
  })
})

describe('filterResolvableIcons', () => {
  const icons = ['lucide:check', 'ph:check', 'tabler:check']

  it('保留能解析到 @iconify-json/* 的图标集', () => {
    expect(filterResolvableIcons(icons, [process.cwd()])).toEqual({ icons, missing: [] })
  })

  it('剔除未安装的图标集并在 missing 中报告，不重复计数', () => {
    const nowhere = mkdtempSync(join(tmpdir(), 'movk-empty-'))
    const result = filterResolvableIcons([...icons, 'lucide:x'], [nowhere])

    expect(result.icons).toEqual([])
    expect(result.missing).toEqual(['lucide', 'ph', 'tabler'])
  })
})

describe('resolveMovkIcons', () => {
  it('扫描与过滤串联，产出可直接下发的图标清单', () => {
    const result = resolveMovkIcons(createRuntime(), { paths: [process.cwd()] })

    expect(result.icons).toContain('lucide:swatch-book')
    expect(result.icons).toContain('tabler:check')
    expect(result.missing).toEqual([])
  })
})

describe('formatMissingCollections', () => {
  it('默认图标集缺失走 warn，其余走 debug', () => {
    const both = formatMissingCollections(['lucide', 'ph'])

    expect(both.warn).toContain('@iconify-json/lucide')
    expect(both.debug).toContain('@iconify-json/ph')
    expect(both.debug).not.toContain('@iconify-json/lucide')
  })

  it('只缺可选图标集时不产出 warn', () => {
    expect(formatMissingCollections(['ph', 'tabler']).warn).toBeUndefined()
  })

  it('无缺失时两级提示都为空', () => {
    expect(formatMissingCollections([])).toEqual({ warn: undefined, debug: undefined })
  })
})
