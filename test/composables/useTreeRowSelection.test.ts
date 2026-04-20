import { describe, it, expect } from 'vitest'
import { computeTreeRowSelection } from '../../src/runtime/utils/tree-row-selection'

interface Row {
  id: string
  name: string
  children?: Row[]
  [k: string]: unknown
}

const tree: Row[] = [
  {
    id: 'a',
    name: 'A',
    children: [
      { id: 'a1', name: 'A1' },
      { id: 'a2', name: 'A2' },
      {
        id: 'a3',
        name: 'A3',
        children: [
          { id: 'a3a', name: 'A3a' },
          { id: 'a3b', name: 'A3b' }
        ]
      }
    ]
  },
  {
    id: 'b',
    name: 'B',
    children: [{ id: 'b1', name: 'B1' }]
  },
  { id: 'c', name: 'C' }
]

describe('computeTreeRowSelection', () => {
  it('扁平数据：selected = leaves = strictlyChecked，parents/halfSelected 为空', () => {
    const flat: Row[] = [
      { id: '1', name: '1' },
      { id: '2', name: '2' },
      { id: '3', name: '3' }
    ]
    const r = computeTreeRowSelection(flat, ['1', '3'], { rowKey: 'id' })
    expect(r.selected.map(x => x.id)).toEqual(['1', '3'])
    expect(r.leaves.map(x => x.id)).toEqual(['1', '3'])
    expect(r.strictlyChecked.map(x => x.id)).toEqual(['1', '3'])
    expect(r.parents).toEqual([])
    expect(r.halfSelected).toEqual([])
  })

  it('树形 leaves：只包含没有子节点的已选行', () => {
    const r = computeTreeRowSelection(tree, ['a', 'a1', 'a3a', 'c'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(r.leaves.map(x => x.id).sort()).toEqual(['a1', 'a3a', 'c'])
  })

  it('树形 parents：所有子孙叶子均选中的父节点', () => {
    const r = computeTreeRowSelection(tree, ['a1', 'a2', 'a3a', 'a3b'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(r.parents.map(x => x.id).sort()).toEqual(['a', 'a3'])
  })

  it('树形 halfSelected：部分子孙叶子选中', () => {
    const r = computeTreeRowSelection(tree, ['a1'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(r.halfSelected.map(x => x.id)).toEqual(['a'])
  })

  it('strictlyChecked (cascade)：父被选时剔除其直接子节点', () => {
    const r = computeTreeRowSelection(tree, ['a', 'a1', 'a2', 'b'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'cascade'
    })
    expect(r.strictlyChecked.map(x => x.id).sort()).toEqual(['a', 'b'])
  })

  it('strictlyChecked (isolated)：等价于 selected', () => {
    const r = computeTreeRowSelection(tree, ['a', 'a1'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'isolated'
    })
    expect(r.strictlyChecked.map(x => x.id).sort()).toEqual(['a', 'a1'])
  })

  it('strictlyChecked (leaf)：等价于 selected', () => {
    const r = computeTreeRowSelection(tree, ['a1', 'a3b'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'leaf'
    })
    expect(r.strictlyChecked.map(x => x.id).sort()).toEqual(['a1', 'a3b'])
  })

  it('空 keys：所有分类都是空数组', () => {
    const r = computeTreeRowSelection(tree, [], { rowKey: 'id', childrenKey: 'children' })
    expect(r.selected).toEqual([])
    expect(r.leaves).toEqual([])
    expect(r.parents).toEqual([])
    expect(r.halfSelected).toEqual([])
    expect(r.strictlyChecked).toEqual([])
  })

  it('数值 key 也能正确匹配（Set 内部按 String 归一化）', () => {
    const flat: Row[] = [
      { id: '1', name: '1' },
      { id: '2', name: '2' }
    ]
    const r = computeTreeRowSelection(flat, [1 as unknown as string], { rowKey: 'id' })
    expect(r.selected.map(x => x.id)).toEqual(['1'])
  })
})
