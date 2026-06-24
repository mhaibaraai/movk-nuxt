import { describe, expect, it } from 'vitest'

import { collectDisabledKeys } from '../../../src/runtime/domains/tree/tree-disabled'

interface Node {
  label: string
  disabled?: boolean
  children?: Node[]
}

const getKey = (n: Node) => n.label

describe('collectDisabledKeys', () => {
  it('无 disabled 节点返回空集', () => {
    const tree: Node[] = [{ label: 'a', children: [{ label: 'b' }] }]
    expect(collectDisabledKeys(tree, getKey).size).toBe(0)
  })

  it('disabled 节点自身入集', () => {
    const tree: Node[] = [{ label: 'a', disabled: true }, { label: 'b' }]
    expect([...collectDisabledKeys(tree, getKey)]).toEqual(['a'])
  })

  it('子节点随父 disabled 级联入集', () => {
    const tree: Node[] = [
      { label: 'p', disabled: true, children: [{ label: 'c1' }, { label: 'c2', children: [{ label: 'c3' }] }] }
    ]
    expect([...collectDisabledKeys(tree, getKey)].sort()).toEqual(['c1', 'c2', 'c3', 'p'])
  })

  it('仅 disabled 子树纳入，兄弟子树不受影响', () => {
    const tree: Node[] = [
      { label: 'a', disabled: true, children: [{ label: 'a1' }] },
      { label: 'b', children: [{ label: 'b1' }] }
    ]
    expect([...collectDisabledKeys(tree, getKey)].sort()).toEqual(['a', 'a1'])
  })
})
