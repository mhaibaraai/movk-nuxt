import { describe, expect, it } from 'vitest'

import { resolveActiveRadius, resolveRadiusStyle } from '../../../src/runtime/domains/theme/theme-radius'

describe('resolveActiveRadius', () => {
  it('用户选择优先于配置的默认圆角', () => {
    expect(resolveActiveRadius(0.5, 0.125)).toBe(0.5)
  })

  it('未选择时使用配置的默认圆角', () => {
    expect(resolveActiveRadius(null, 0.125)).toBe(0.125)
    expect(resolveActiveRadius(undefined, 0.125)).toBe(0.125)
  })

  it('两者都缺省时返回 undefined，交由项目 CSS 决定', () => {
    expect(resolveActiveRadius(null, undefined)).toBeUndefined()
  })

  // 0 是合法档位，不能被 ?? 之外的假值判断吞掉
  it('圆角 0 是有效选择，不回落到默认值', () => {
    expect(resolveActiveRadius(0, 0.25)).toBe(0)
    expect(resolveActiveRadius(null, 0)).toBe(0)
  })
})

describe('resolveRadiusStyle', () => {
  it('缺省时输出空规则，把 --ui-radius 留给项目 CSS', () => {
    expect(resolveRadiusStyle(undefined)).toBe(':root {}')
  })

  it('指定时输出 --ui-radius 声明', () => {
    expect(resolveRadiusStyle(0.5)).toBe(':root { --ui-radius: 0.5rem; }')
  })

  it('圆角 0 正常输出而非被当作缺省', () => {
    expect(resolveRadiusStyle(0)).toBe(':root { --ui-radius: 0rem; }')
  })
})
