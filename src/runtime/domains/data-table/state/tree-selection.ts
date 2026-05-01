import type { TreeRowSelectionOptions, TreeSelectionResult } from '../../../types/data-table/selection'

export type { TreeRowSelectionOptions, TreeSelectionResult }

interface Node<T> {
  row: T
  id: string
  parent: Node<T> | null
  children: Node<T>[]
  selfSelected: boolean
  leafTotal: number
  leafSelected: number
}

/**
 * 纯函数派生：给定数据 + 选中 keys + 选项，返回树形选择分类结果。
 *
 * 算法为一次 DFS：构建阶段后序归并 leafTotal/leafSelected，访问阶段前序
 * 收集 selected/leaves/parents/halfSelected/strictlyChecked，整体 O(n)。
 */
export function computeTreeRowSelection<T extends object>(
  rows: T[],
  keys: readonly (string | number)[],
  options: TreeRowSelectionOptions = {}
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
