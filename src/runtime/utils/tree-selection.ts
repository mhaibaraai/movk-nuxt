import type { TreeSelectionResult } from '../types/shared'

type AnyNode = Record<string, any>

/** 父子勾选策略，仅 cascade 会在 strictlyChecked 中剔除随父级联的子节点 */
export type TreeSelectionStrategy = 'cascade' | 'isolated' | 'leaf'

/** 工具栏选中态摘要 */
export interface TreeSelectionSummary {
  /** 已选节点数 */
  checkedCount: number
  /** 可选节点总数 */
  total: number
  /** 是否全部选中 */
  allChecked: boolean
  /** 是否处于半选态 */
  indeterminate: boolean
}

/**
 * 由已选数量与可选总数推导工具栏选中态摘要
 *
 * 供三态全选复选框与选中计数复用：全空与无可选节点时既非全选也非半选。
 */
export function selectionSummary(checkedCount: number, total: number): TreeSelectionSummary {
  const allChecked = total > 0 && checkedCount >= total
  return {
    checkedCount,
    total,
    allChecked,
    indeterminate: checkedCount > 0 && !allChecked
  }
}

interface SelectionOptions<T> {
  /** 取节点唯一 key */
  getKey: (node: T) => string
  /** 取子节点数组，缺省读 node.children */
  getChildren?: (node: T) => T[] | undefined
  /** 勾选策略 */
  strategy?: TreeSelectionStrategy
}

interface Entry<T> {
  node: T
  parent: Entry<T> | null
  children: Entry<T>[]
  selfSelected: boolean
  leafTotal: number
  leafSelected: number
}

/**
 * 由选中 key 集合派生选中结果分类（Tree 与 DataTable 共用）
 *
 * 统计每节点子孙叶子总数与已选数，得 selected / leaves / parents（满选父）/
 * halfSelected（半选父）/ strictlyChecked（cascade 下剔除随父级联的子节点）。
 * 通过 getKey / getChildren 适配不同数据形态。
 */
export function computeTreeSelection<T>(
  items: T[],
  selectedKeys: Iterable<string | number>,
  options: SelectionOptions<T>
): TreeSelectionResult<T> {
  const { getKey, strategy = 'cascade' } = options
  const getChildren = options.getChildren ?? ((node: T) => (node as AnyNode).children as T[] | undefined)
  const keySet = new Set<string>()
  for (const key of selectedKeys) keySet.add(String(key))

  const selected: T[] = []
  const leaves: T[] = []
  const parents: T[] = []
  const halfSelected: T[] = []
  const strictlyChecked: T[] = []

  const build = (nodes: T[], parent: Entry<T> | null): Entry<T>[] =>
    nodes.map((node) => {
      const entry: Entry<T> = {
        node,
        parent,
        children: [],
        selfSelected: keySet.has(getKey(node)),
        leafTotal: 0,
        leafSelected: 0
      }
      const children = getChildren(node)
      if (Array.isArray(children) && children.length > 0) {
        entry.children = build(children, entry)
        for (const child of entry.children) {
          entry.leafTotal += child.leafTotal
          entry.leafSelected += child.leafSelected
        }
      }
      else {
        entry.leafTotal = 1
        entry.leafSelected = entry.selfSelected ? 1 : 0
      }
      return entry
    })

  const visit = (entry: Entry<T>): void => {
    const isLeaf = entry.children.length === 0

    if (entry.selfSelected) {
      selected.push(entry.node)
      if (isLeaf) leaves.push(entry.node)
      if (strategy !== 'cascade' || !entry.parent?.selfSelected) {
        strictlyChecked.push(entry.node)
      }
    }

    if (!isLeaf) {
      if (entry.leafTotal > 0 && entry.leafSelected === entry.leafTotal) parents.push(entry.node)
      else if (entry.leafSelected > 0) halfSelected.push(entry.node)
    }

    for (const child of entry.children) visit(child)
  }
  for (const root of build(items, null)) visit(root)

  return { selected, leaves, parents, halfSelected, strictlyChecked }
}
