import { describe, expect, it } from 'vitest'

import { computeTreeSelection, selectionSummary } from '../../src/runtime/utils/tree-selection'

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

describe('selectionSummary', () => {
  it('全空时既非全选也非半选', () => {
    expect(selectionSummary(0, 5)).toEqual({
      checkedCount: 0,
      total: 5,
      allChecked: false,
      indeterminate: false
    })
  })

  it('部分选中为半选', () => {
    expect(selectionSummary(2, 5)).toMatchObject({ allChecked: false, indeterminate: true })
  })

  it('全选时 allChecked 为真且非半选', () => {
    expect(selectionSummary(5, 5)).toMatchObject({ allChecked: true, indeterminate: false })
  })

  it('已选超过总数仍视为全选', () => {
    expect(selectionSummary(6, 5)).toMatchObject({ allChecked: true, indeterminate: false })
  })

  it('无可选节点时既非全选也非半选', () => {
    expect(selectionSummary(0, 0)).toMatchObject({ allChecked: false, indeterminate: false })
  })
})

describe('computeTreeSelection', () => {
  const labels = (nodes: Node[]) => nodes.map(getKey).sort()

  it('某父级叶子全选计入 parents，其上层因兄弟未选计入 halfSelected', () => {
    const r = computeTreeSelection(tree, new Set(['a1', 'a2']), { getKey })
    expect(labels(r.leaves)).toEqual(['a1', 'a2'])
    expect(labels(r.parents)).toEqual(['a'])
    expect(labels(r.halfSelected)).toEqual(['root'])
  })

  it('某父级全部子孙叶子选中时该父级及上层均计入 parents', () => {
    const r = computeTreeSelection(tree, new Set(['a1', 'a2', 'b']), { getKey })
    expect(labels(r.parents)).toEqual(['a', 'root'])
    expect(r.halfSelected).toHaveLength(0)
  })

  it('叶子部分选中时父节点计入 halfSelected', () => {
    const r = computeTreeSelection(tree, new Set(['a1']), { getKey })
    expect(labels(r.halfSelected)).toEqual(['a', 'root'])
    expect(r.parents).toHaveLength(0)
  })

  it('cascade 下随父级联的子节点不计入 strictlyChecked', () => {
    const r = computeTreeSelection(tree, new Set(['a', 'a1', 'a2']), { getKey, strategy: 'cascade' })
    expect(labels(r.strictlyChecked)).toEqual(['a'])
  })

  it('isolated 下每个选中节点都计入 strictlyChecked', () => {
    const r = computeTreeSelection(tree, new Set(['a', 'a1', 'a2']), { getKey, strategy: 'isolated' })
    expect(labels(r.strictlyChecked)).toEqual(['a', 'a1', 'a2'])
  })

  it('级联下中间节点连同其叶子选中时祖先计入 halfSelected', () => {
    // 勾选 a 父级会级联其叶子 a1/a2，祖先 root 因兄弟 b 未选呈半选
    const r = computeTreeSelection(tree, new Set(['a', 'a1', 'a2']), { getKey })
    expect(labels(r.parents)).toEqual(['a'])
    expect(labels(r.halfSelected)).toEqual(['root'])
  })

  it('单选只产出一个叶子', () => {
    const r = computeTreeSelection(tree, new Set(['c']), { getKey })
    expect(labels(r.selected)).toEqual(['c'])
    expect(labels(r.leaves)).toEqual(['c'])
  })

  it('空选返回空分类', () => {
    const r = computeTreeSelection(tree, new Set<string>(), { getKey })
    expect(r).toEqual({ selected: [], leaves: [], parents: [], halfSelected: [], strictlyChecked: [] })
  })

  it('数组形式的 keys 与 number key 自动归一化为字符串', () => {
    const r = computeTreeSelection(tree, ['a1', 'a2'], { getKey })
    expect(labels(r.parents)).toEqual(['a'])
  })

  it('自定义 getChildren 适配非 children 字段', () => {
    interface DeptNode { name: string, nodes?: DeptNode[] }
    const dept: DeptNode[] = [
      { name: 'tech', nodes: [{ name: 'fe', nodes: [{ name: 'lib' }, { name: 'viz' }] }] }
    ]
    const r = computeTreeSelection(dept, new Set(['lib', 'viz']), {
      getKey: n => n.name,
      getChildren: n => n.nodes
    })
    expect(r.parents.map(n => n.name).sort()).toEqual(['fe', 'tech'])
  })

  it('无子节点访问器（全视作叶子）逐行计入 leaves', () => {
    const r = computeTreeSelection(tree, new Set(['root', 'c']), {
      getKey,
      getChildren: () => undefined
    })
    expect(labels(r.leaves)).toEqual(['c', 'root'])
    expect(r.parents).toHaveLength(0)
  })
})
