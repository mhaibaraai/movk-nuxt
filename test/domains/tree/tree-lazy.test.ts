import { describe, expect, it } from 'vitest'

import { isPlaceholder, markLazyPlaceholders } from '../../../src/runtime/domains/tree/tree-lazy'

interface Node {
  label?: string
  children?: Node[]
  isLeaf?: boolean
  __movkLazyPlaceholder?: boolean
}

const getKey = (node: Node) => String(node.label)

describe('isPlaceholder', () => {
  it('识别占位节点', () => {
    expect(isPlaceholder({ __movkLazyPlaceholder: true })).toBe(true)
    expect(isPlaceholder({ label: 'a' })).toBe(false)
  })
})

describe('markLazyPlaceholders', () => {
  it('无 children 且非叶子的节点注入占位子节点', () => {
    const out = markLazyPlaceholders<Node>([{ label: 'a' }], getKey)
    expect(out[0]!.children).toHaveLength(1)
    expect(isPlaceholder(out[0]!.children![0]!)).toBe(true)
  })

  it('isLeaf 节点不注入占位', () => {
    const out = markLazyPlaceholders<Node>([{ label: 'a', isLeaf: true }], getKey)
    expect(out[0]!.children).toBeUndefined()
  })

  it('children 为空数组视为已加载，不注入占位', () => {
    const out = markLazyPlaceholders<Node>([{ label: 'a', children: [] }], getKey)
    expect(out[0]!.children).toEqual([])
  })

  it('递归处理已加载子节点中的懒父节点', () => {
    const out = markLazyPlaceholders<Node>([{ label: 'a', children: [{ label: 'b' }] }], getKey)
    expect(isPlaceholder(out[0]!.children![0]!.children![0]!)).toBe(true)
  })

  it('占位节点键唯一', () => {
    const out = markLazyPlaceholders<Node>([{ label: 'a' }, { label: 'b' }], getKey)
    expect(getKey(out[0]!.children![0]!)).not.toBe(getKey(out[1]!.children![0]!))
  })

  it('不修改原数组', () => {
    const src: Node[] = [{ label: 'a' }]
    markLazyPlaceholders<Node>(src, getKey)
    expect(src[0]!.children).toBeUndefined()
  })
})
