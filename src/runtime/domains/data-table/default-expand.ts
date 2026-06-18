import type { DataTableProps } from '../../types/data-table'

interface DefaultExpandOptions<T> {
  defaultExpanded: DataTableProps<T>['defaultExpanded']
  childrenKey?: string
  rowKey?: string
}

/**
 * 由 `defaultExpanded` 推导初始展开记录（id → true），用于树形模式默认展开
 *
 * 仅命中「有非空 children 数组」的父级行（对齐 TanStack `getCanExpand`）；
 * id 派生复刻 TanStack 默认 `getRowId`：有 `rowKey` 取 `String(row[rowKey])`，
 * 否则根层为 `index`、子层为 `parentId.index`。
 */
export function computeDefaultExpandedKeys<T>(
  data: readonly T[],
  options: DefaultExpandOptions<T>
): Record<string, boolean> {
  const { defaultExpanded, childrenKey, rowKey } = options
  if (!defaultExpanded || !childrenKey) return {}

  const predicate = typeof defaultExpanded === 'function'
    ? defaultExpanded
    : typeof defaultExpanded === 'number'
      ? (_row: T, depth: number) => depth < defaultExpanded
      : () => true

  const result: Record<string, boolean> = {}

  const walk = (rows: readonly T[], depth: number, parentId?: string): void => {
    rows.forEach((row, index) => {
      const children = (row as Record<string, unknown>)[childrenKey]
      if (!Array.isArray(children) || children.length === 0) return
      const id = rowKey !== undefined
        ? String((row as Record<string, unknown>)[rowKey])
        : parentId !== undefined ? `${parentId}.${index}` : `${index}`
      if (predicate(row, depth)) result[id] = true
      walk(children as T[], depth + 1, id)
    })
  }

  walk(data, 0)
  return result
}
