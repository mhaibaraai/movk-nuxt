import { describe, expect, it } from 'vitest'
import { computeTreeRowSelection } from '../../../src/runtime/domains/data-table/state/tree-selection'

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
    const result = computeTreeRowSelection(flat, ['1', '3'], { rowKey: 'id' })
    expect(result.selected.map(x => x.id)).toEqual(['1', '3'])
    expect(result.leaves.map(x => x.id)).toEqual(['1', '3'])
    expect(result.strictlyChecked.map(x => x.id)).toEqual(['1', '3'])
    expect(result.parents).toEqual([])
    expect(result.halfSelected).toEqual([])
  })

  it('树形 leaves 只包含没有子节点的已选行', () => {
    const result = computeTreeRowSelection(tree, ['a', 'a1', 'a3a', 'c'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(result.leaves.map(x => x.id).sort()).toEqual(['a1', 'a3a', 'c'])
  })

  it('树形 parents 包含所有子孙叶子均选中的父节点', () => {
    const result = computeTreeRowSelection(tree, ['a1', 'a2', 'a3a', 'a3b'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(result.parents.map(x => x.id).sort()).toEqual(['a', 'a3'])
  })

  it('树形 halfSelected 标记部分子孙叶子选中的父节点', () => {
    const result = computeTreeRowSelection(tree, ['a1'], {
      rowKey: 'id',
      childrenKey: 'children'
    })
    expect(result.halfSelected.map(x => x.id)).toEqual(['a'])
  })

  it('strictlyChecked 在 cascade 下剔除父级联子节点', () => {
    const result = computeTreeRowSelection(tree, ['a', 'a1', 'a2', 'b'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'cascade'
    })
    expect(result.strictlyChecked.map(x => x.id).sort()).toEqual(['a', 'b'])
  })

  it('strictlyChecked 在 isolated 与 leaf 下等价于 selected', () => {
    expect(computeTreeRowSelection(tree, ['a', 'a1'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'isolated'
    }).strictlyChecked.map(x => x.id).sort()).toEqual(['a', 'a1'])

    expect(computeTreeRowSelection(tree, ['a1', 'a3b'], {
      rowKey: 'id',
      childrenKey: 'children',
      strategy: 'leaf'
    }).strictlyChecked.map(x => x.id).sort()).toEqual(['a1', 'a3b'])
  })
})
