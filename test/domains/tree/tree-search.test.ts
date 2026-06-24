import { describe, expect, it } from 'vitest'

import { matchLabel, matchNode } from '../../../src/runtime/domains/tree/tree-search'

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

describe('matchNode', () => {
  it('顶层 labelKey 正常匹配', () => {
    expect(matchNode({ label: 'Cherry' }, 'label', 'err')).toBe(true)
  })

  it('按点路径 labelKey 取值匹配', () => {
    expect(matchNode({ meta: { title: 'Apple' } }, 'meta.title', 'app')).toBe(true)
    expect(matchNode({ meta: { title: 'Banana' } }, 'meta.title', 'app')).toBe(false)
  })

  it('点路径取值缺失视为不命中', () => {
    expect(matchNode({}, 'meta.title', 'x')).toBe(false)
  })
})
