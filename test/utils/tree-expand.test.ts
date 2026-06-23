import { describe, expect, it } from 'vitest'

import { resolveDefaultExpandedKeys } from '../../src/runtime/utils/tree-expand'

interface Node {
  label: string
  children?: Node[]
}

const getKey = (node: Node) => node.label

const tree: Node[] = [
  {
    label: 'root',
    children: [
      { label: 'a', children: [{ label: 'a1' }, { label: 'a2' }] },
      { label: 'b' }
    ]
  },
  { label: 'c' }
]

describe('resolveDefaultExpandedKeys（Tree 形态：getKey 取字段）', () => {
  it('true 展开全部父节点（忽略叶子）', () => {
    expect(resolveDefaultExpandedKeys(tree, true, { getKey }).sort()).toEqual(['a', 'root'])
  })

  it('number 仅展开 depth 小于该值的父节点', () => {
    expect(resolveDefaultExpandedKeys(tree, 1, { getKey })).toEqual(['root'])
    expect(resolveDefaultExpandedKeys(tree, 2, { getKey }).sort()).toEqual(['a', 'root'])
  })

  it('0 收起全部', () => {
    expect(resolveDefaultExpandedKeys(tree, 0, { getKey })).toEqual([])
  })

  it('false 不展开', () => {
    expect(resolveDefaultExpandedKeys(tree, false, { getKey })).toEqual([])
  })

  it('函数按节点与深度自定义', () => {
    const keys = resolveDefaultExpandedKeys(tree, node => node.label === 'a', { getKey })
    expect(keys).toEqual(['a'])
  })

  it('自定义 getChildren 适配非 children 字段', () => {
    interface DeptNode { name: string, nodes?: DeptNode[] }
    const dept: DeptNode[] = [
      { name: 'tech', nodes: [{ name: 'fe', nodes: [{ name: 'lib' }] }, { name: 'be' }] }
    ]
    const keys = resolveDefaultExpandedKeys(dept, true, {
      getKey: n => n.name,
      getChildren: n => n.nodes
    })
    expect(keys.sort()).toEqual(['fe', 'tech'])
  })
})

describe('resolveDefaultExpandedKeys（DataTable 形态：getKey 借 ctx 派生 id）', () => {
  interface Row { id?: string, name?: string, children?: Row[] }

  // a:0 ─ a1:1 ─ a1x:2(leaf)
  //      └ a2:1(leaf)
  // b:0(空 children，不可展开)
  // c:0(leaf)
  const rows: Row[] = [
    { id: 'a', children: [{ id: 'a1', children: [{ id: 'a1x' }] }, { id: 'a2' }] },
    { id: 'b', children: [] },
    { id: 'c' }
  ]

  const byRowKey = { getKey: (r: Row) => String(r.id), getChildren: (r: Row) => r.children }

  it('rowKey 形态：true 展开全部父级行，排除叶子与空 children', () => {
    expect(resolveDefaultExpandedKeys(rows, true, byRowKey).sort()).toEqual(['a', 'a1'])
  })

  it('rowKey 形态：number 限定 depth', () => {
    expect(resolveDefaultExpandedKeys(rows, 1, byRowKey)).toEqual(['a'])
    expect(resolveDefaultExpandedKeys(rows, 2, byRowKey).sort()).toEqual(['a', 'a1'])
  })

  it('rowKey 形态：函数谓词按行与深度判定', () => {
    expect(resolveDefaultExpandedKeys(rows, (_r, depth) => depth === 0, byRowKey)).toEqual(['a'])
    expect(resolveDefaultExpandedKeys(rows, r => r.id === 'a1', byRowKey)).toEqual(['a1'])
  })

  it('无 rowKey 时按 TanStack 默认 id 路径派生', () => {
    // 根 index 0 → '0'；其第 1 个含 children 的子节点 → '0.1'
    const indexed: Row[] = [
      { children: [{ name: 'leaf' }, { children: [{ name: 'deep-leaf' }] }] }
    ]
    const keys = resolveDefaultExpandedKeys(indexed, true, {
      getChildren: r => r.children,
      getKey: (_r, { index, parentKey }) => parentKey !== undefined ? `${parentKey}.${index}` : `${index}`
    })
    expect(keys).toEqual(['0', '0.1'])
  })
})
