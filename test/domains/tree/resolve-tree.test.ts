import { describe, expect, it } from 'vitest'

import { createGetKey, getByPath, normalizeChildren } from '../../../src/runtime/domains/tree/resolve-tree'

interface Node {
  label?: string
  name?: string
  id?: string
  children?: Node[]
  nodes?: Node[]
  meta?: { title?: string }
}

describe('getByPath', () => {
  it('无点路径直接取字段', () => {
    expect(getByPath({ label: 'a' }, 'label')).toBe('a')
  })

  it('点路径按段深取', () => {
    expect(getByPath({ meta: { title: 't' } }, 'meta.title')).toBe('t')
  })

  it('中间层缺失时返回 undefined 而非抛错', () => {
    expect(getByPath({}, 'meta.title')).toBeUndefined()
  })
})

describe('createGetKey', () => {
  it('缺省按 label 字段取键', () => {
    expect(createGetKey<Node>()({ label: 'a' })).toBe('a')
  })

  it('自定义 labelKey 取对应字段', () => {
    expect(createGetKey<Node>(undefined, 'name')({ name: 'foo' })).toBe('foo')
  })

  it('labelKey 支持点路径深取', () => {
    expect(createGetKey<Node>(undefined, 'meta.title')({ meta: { title: 'deep' } })).toBe('deep')
  })

  it('提供 getKey 时优先使用其返回值', () => {
    expect(createGetKey<Node>(n => n.id ?? '')({ id: '7', label: 'a' })).toBe('7')
  })

  it('getKey 返回空值时回退到 label', () => {
    expect(createGetKey<Node>(() => '')({ label: 'fallback' })).toBe('fallback')
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
