import type { RowSelectionState } from '@tanstack/vue-table'

/**
 * 从 selectedKeys 构建 RowSelectionState
 *
 * TanStack 的 RowSelectionState 是 { [rowId: string]: boolean }
 * 当使用 getRowId 时，rowId 就是我们的 key
 */
export function keysToRowSelection(keys: (string | number)[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) {
    state[String(key)] = true
  }
  return state
}

/**
 * 从 RowSelectionState 提取 selectedKeys
 *
 * @param state TanStack 选择状态
 * @param idMap rowId -> 原始 key 的映射，用于保留 number key 等原始类型
 */
export function rowSelectionToKeys(
  state: RowSelectionState,
  idMap?: ReadonlyMap<string, string | number>
): (string | number)[] {
  return Object.entries(state)
    .filter(([, selected]) => selected)
    .map(([key]) => {
      if (!idMap) return key
      return idMap.get(key)
    })
    .filter((key): key is string | number => key !== undefined)
}

/**
 * 比较两个 key 列表是否表示同一集合（忽略顺序）
 */
export function areSameKeys(
  a: (string | number)[],
  b: (string | number)[]
): boolean {
  if (a.length !== b.length) return false

  const aSet = new Set(a.map(String))
  for (const key of b) {
    if (!aSet.has(String(key))) {
      return false
    }
  }

  return true
}
