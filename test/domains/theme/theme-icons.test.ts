import { describe, expect, it } from 'vitest'

import { resolveThemeIcons, themeIcons } from '../../../src/runtime/domains/theme/theme-icons'

describe('themeIcons', () => {
  const sets = Object.keys(themeIcons) as Array<keyof typeof themeIcons>

  it('各图标集键集合保持一致', () => {
    const [first, ...rest] = sets
    const expected = Object.keys(themeIcons[first!]).sort()

    for (const set of rest) {
      expect(Object.keys(themeIcons[set]).sort(), `${set} 与 ${first} 的键集合不一致`).toEqual(expected)
    }
  })

  it('各图标集均提供 star（InputRating 依赖）', () => {
    for (const set of sets) {
      expect(themeIcons[set], `${set} 缺少 star`).toHaveProperty('star')
      expect(themeIcons[set].star).toBeTruthy()
    }
  })
})

describe('resolveThemeIcons', () => {
  it('图标集覆盖同名键，未覆盖的键回退当前值', () => {
    const current = { check: 'i-default-check', star: 'i-default-star', extra: 'i-default-extra' }
    const result = resolveThemeIcons('phosphor', current)

    expect(result.check).toBe(themeIcons.phosphor.check)
    // @nuxt/ui 新增而图标集未覆盖的键不应丢失
    expect(result.extra).toBe('i-default-extra')
  })

  it('未知图标集时原样返回当前值', () => {
    const current = { check: 'i-default-check' }

    expect(resolveThemeIcons('not-exist', current)).toEqual(current)
  })

  it('不修改入参', () => {
    const current = { check: 'i-default-check' }
    resolveThemeIcons('lucide', current)

    expect(current).toEqual({ check: 'i-default-check' })
  })
})
