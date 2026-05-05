import type { DataTableTreeSelectionStrategy } from '../../types/data-table'
import type { TreeSelectionResult } from '../../types/data-table/selection'

interface ComputeOptions {
  rowKey?: string
  childrenKey?: string
  strategy?: DataTableTreeSelectionStrategy
}

interface Node<T> {
  row: T
  id: string
  parent: Node<T> | null
  children: Node<T>[]
  selfSelected: boolean
  leafTotal: number
  leafSelected: number
}

export function computeTreeRowSelection<T>(
  rows: T[],
  keys: readonly (string | number)[],
  options: ComputeOptions = {}
): TreeSelectionResult<T> {
  const rowKey = options.rowKey ?? 'id'
  const childrenKey = options.childrenKey
  const strategy = options.strategy ?? 'cascade'
  const keySet = new Set(keys.map(String))

  const selected: T[] = []
  const leaves: T[] = []
  const parents: T[] = []
  const halfSelected: T[] = []
  const strictlyChecked: T[] = []

  const readKey = (row: T, key: string): unknown => (row as Record<string, unknown>)[key]

  if (!childrenKey) {
    for (const row of rows) {
      if (keySet.has(String(readKey(row, rowKey)))) {
        selected.push(row)
        leaves.push(row)
        strictlyChecked.push(row)
      }
    }
    return { selected, leaves, parents, halfSelected, strictlyChecked }
  }

  const build = (items: T[], parent: Node<T> | null): Node<T>[] => {
    const list: Node<T>[] = []
    for (const row of items) {
      const id = String(readKey(row, rowKey))
      const selfSelected = keySet.has(id)
      const node: Node<T> = {
        row,
        id,
        parent,
        children: [],
        selfSelected,
        leafTotal: 0,
        leafSelected: 0
      }
      const childArr = readKey(row, childrenKey)
      if (Array.isArray(childArr) && childArr.length > 0) {
        node.children = build(childArr as T[], node)
        for (const c of node.children) {
          node.leafTotal += c.leafTotal
          node.leafSelected += c.leafSelected
        }
      }
      else {
        node.leafTotal = 1
        node.leafSelected = selfSelected ? 1 : 0
      }
      list.push(node)
    }
    return list
  }
  const roots = build(rows, null)

  const visit = (node: Node<T>): void => {
    const isLeaf = node.children.length === 0

    if (node.selfSelected) {
      selected.push(node.row)
      if (isLeaf) leaves.push(node.row)

      if (strategy === 'cascade') {
        if (!node.parent || !node.parent.selfSelected) {
          strictlyChecked.push(node.row)
        }
      }
      else {
        strictlyChecked.push(node.row)
      }
    }

    if (!isLeaf) {
      if (node.leafTotal > 0 && node.leafSelected === node.leafTotal) {
        parents.push(node.row)
      }
      else if (node.leafSelected > 0) {
        halfSelected.push(node.row)
      }
    }

    for (const child of node.children) visit(child)
  }
  for (const root of roots) visit(root)

  return { selected, leaves, parents, halfSelected, strictlyChecked }
}
