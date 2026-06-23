import { describe, expect, it } from 'vitest'

import { matchLabel } from '../../../src/runtime/domains/tree/tree-search'

describe('matchLabel', () => {
  it('不区分大小写包含匹配', () => {
    expect(matchLabel('Apple', 'app')).toBe(true)
    expect(matchLabel('apple', 'PP')).toBe(true)
  })

  it('未命中返回 false', () => {
    expect(matchLabel('banana', 'app')).toBe(false)
  })

  it('空关键字视为全部命中', () => {
    expect(matchLabel('anything', '')).toBe(true)
    expect(matchLabel(undefined, '   ')).toBe(true)
  })

  it('label 为空且关键字非空时不命中', () => {
    expect(matchLabel(undefined, 'app')).toBe(false)
  })
})
