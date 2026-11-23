import { describe, expect, it } from 'vitest'
import colors from 'tailwindcss/colors'

import { resolveThemeColor } from '../../../src/runtime/domains/theme/theme-color'

describe('resolveThemeColor', () => {
  it('浅色模式为白色', () => {
    expect(resolveThemeColor('slate', 'light')).toBe('white')
  })

  it('深色模式取中性色 900 色阶', () => {
    expect(resolveThemeColor('slate', 'dark')).toBe(colors.slate[900])
  })

  it('自定义中性色（非 Tailwind 内置色板）回退到 neutral 色板', () => {
    expect(resolveThemeColor('paper', 'dark')).toBe(colors.neutral[900])
  })
})
