import { describe, expect, it } from 'vitest'

import { computeDefaultExpandedKeys } from '../../../src/runtime/domains/data-table/default-expand'

interface Node {
  id?: string
  name?: string
  children?: Node[]
}

// a:0 ─ a1:1 ─ a1x:2(leaf)
//      └ a2:1(leaf)
// b:0(空 children，不可展开)
// c:0(leaf)
const tree: Node[] = [
  {
    id: 'a',
    children: [
      { id: 'a1', children: [{ id: 'a1x' }] },
      { id: 'a2' }
    ]
  },
  { id: 'b', children: [] },
  { id: 'c' }
]

describe('computeDefaultExpandedKeys', () => {
  it('空数据返回 {}', () => {
    expect(computeDefaultExpandedKeys([], { defaultExpanded: true, childrenKey: 'children', rowKey: 'id' })).toEqual({})
  })

  it('未提供 childrenKey 返回 {}', () => {
    expect(computeDefaultExpandedKeys(tree, { defaultExpanded: true, rowKey: 'id' })).toEqual({})
  })

  it('defaultExpanded 为 false 返回 {}', () => {
    expect(computeDefaultExpandedKeys(tree, { defaultExpanded: false, childrenKey: 'children', rowKey: 'id' })).toEqual({})
  })

  it('true 展开全部父级行，排除叶子与空 children', () => {
    expect(computeDefaultExpandedKeys(tree, { defaultExpanded: true, childrenKey: 'children', rowKey: 'id' }))
      .toEqual({ a: true, a1: true })
  })

  it('number 1 仅展开 depth < 1 的父级行', () => {
    expect(computeDefaultExpandedKeys(tree, { defaultExpanded: 1, childrenKey: 'children', rowKey: 'id' }))
      .toEqual({ a: true })
  })

  it('number 2 展开 depth < 2 的父级行', () => {
    expect(computeDefaultExpandedKeys(tree, { defaultExpanded: 2, childrenKey: 'children', rowKey: 'id' }))
      .toEqual({ a: true, a1: true })
  })

  it('函数谓词按行与深度判定', () => {
    expect(computeDefaultExpandedKeys(tree, {
      defaultExpanded: (_row, depth) => depth === 0,
      childrenKey: 'children',
      rowKey: 'id'
    })).toEqual({ a: true })

    expect(computeDefaultExpandedKeys(tree, {
      defaultExpanded: row => row.id === 'a1',
      childrenKey: 'children',
      rowKey: 'id'
    })).toEqual({ a1: true })
  })

  it('无 rowKey 时按 TanStack 默认 id 路径派生', () => {
    // 根节点 index 0 → '0'；其第 1 个子节点(含 children) → '0.1'
    const indexed: Node[] = [
      {
        children: [
          { name: 'leaf' },
          { children: [{ name: 'deep-leaf' }] }
        ]
      }
    ]
    expect(computeDefaultExpandedKeys(indexed, { defaultExpanded: true, childrenKey: 'children' }))
      .toEqual({ 0: true, 0.1: true })
  })
})
