import { describe, expect, it } from 'vitest'

import { createGetKey, normalizeChildren } from '../../../src/runtime/domains/tree/resolve-tree'

interface Node {
  label?: string
  name?: string
  id?: string
  value?: unknown
  key?: string
  children?: Node[]
  nodes?: Node[]
  meta?: { title?: string, id?: number }
}

describe('createGetKey', () => {
  it('缺少 value 时回退 label 字段', () => {
    expect(createGetKey<Node>()({ label: 'a' })).toBe('a')
  })

  it('自定义 labelKey 取对应字段', () => {
    expect(createGetKey<Node>(undefined, 'name')({ name: 'foo' })).toBe('foo')
  })

  it('labelKey 支持点路径深取', () => {
    expect(createGetKey<Node>(undefined, 'meta.title')({ meta: { title: 'deep' } })).toBe('deep')
  })

  it('提供 getKey 时优先使用其返回值', () => {
    expect(createGetKey<Node>(n => n.id ?? '')({ id: '7', value: 'value', label: 'a' })).toBe('7')
  })

  it('getKey 返回空值时回退到 label', () => {
    expect(createGetKey<Node>(() => '')({ label: 'fallback' })).toBe('fallback')
  })

  it('缺省优先按 value 字段取键，同 label 不同 value 的节点互不冲突', () => {
    const key = createGetKey<Node>()
    expect([key({ label: 'a', value: 'x' }), key({ label: 'a', value: 'y' })]).toEqual(['x', 'y'])
  })

  it('数字 value 转为字符串，非字符串 / 数字的 value 回退 label', () => {
    const key = createGetKey<Node>()
    expect(key({ label: 'a', value: 42 })).toBe('42')
    expect(key({ label: 'a', value: { id: 1 } })).toBe('a')
  })

  it.each([
    [0, '0'],
    ['', ''],
    [false, 'fallback'],
    [null, 'fallback'],
    [undefined, 'fallback']
  ])('value 为 %s 时取键为 %s', (value, expected) => {
    expect(createGetKey<Node>()({ label: 'fallback', value })).toBe(expected)
  })

  it('valueKey 支持点路径，并保留数字零', () => {
    expect(createGetKey<Node>(undefined, 'label', 'meta.id')({ label: 'a', meta: { id: 0 } })).toBe('0')
  })

  it('自定义 valueKey，getKey 返回空值时按 valueKey 回退', () => {
    expect(createGetKey<Node>(undefined, 'label', 'key')({ label: 'a', key: 'k' })).toBe('k')
    expect(createGetKey<Node>(() => '', 'label', 'key')({ label: 'a', key: 'k' })).toBe('k')
  })
})

describe('normalizeChildren', () => {
  it('childrenKey 为默认 children 时原样返回', () => {
    const tree: Node[] = [{ label: 'a', children: [{ label: 'b' }] }]
    expect(normalizeChildren(tree)).toBe(tree)
  })

  it('自定义 childrenKey 归一化为 children 并移除原字段', () => {
    const src: Node[] = [{ label: 'a', nodes: [{ label: 'b', nodes: [{ label: 'c' }] }] }]
    const out = normalizeChildren(src, 'nodes')
    expect(out).toEqual([{ label: 'a', children: [{ label: 'b', children: [{ label: 'c' }] }] }])
    expect((out[0] as Node).nodes).toBeUndefined()
  })

  it('归一化不修改原数组', () => {
    const src: Node[] = [{ label: 'a', nodes: [{ label: 'b' }] }]
    normalizeChildren(src, 'nodes')
    expect(src[0]!.nodes).toEqual([{ label: 'b' }])
  })

  it('无子节点的节点不新增 children 字段', () => {
    const out = normalizeChildren([{ label: 'leaf' }], 'nodes') as Node[]
    expect('children' in out[0]!).toBe(false)
  })
})
