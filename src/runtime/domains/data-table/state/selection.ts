import type { RowSelectionState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { computed } from 'vue'

export function keysToRowSelection(keys: (string | number)[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) {
    state[String(key)] = true
  }
  return state
}

export function rowSelectionToKeys(
  state: RowSelectionState,
  idMap?: ReadonlyMap<string, string | number>
): (string | number)[] {
  return Object.entries(state)
    .filter(([, selected]) => selected)
    .map(([key]) => (idMap ? idMap.get(key) : key))
    .filter((key): key is string | number => key !== undefined)
}

export function useSelectedRows<T extends Record<string, unknown>>(
  data: Ref<T[]> | (() => T[]),
  selectedKeys: Ref<(string | number)[]>,
  rowKey: string,
  childrenKey?: string
) {
  return computed(() => {
    const rows = typeof data === 'function' ? data() : data.value
    const keySet = new Set(selectedKeys.value.map(String))

    if (!childrenKey) {
      return rows.filter(row => keySet.has(String(row[rowKey])))
    }

    const selectedRows: T[] = []
    const walk = (items: T[]) => {
      for (const item of items) {
        if (keySet.has(String(item[rowKey]))) {
          selectedRows.push(item)
        }
        const children = item[childrenKey]
        if (Array.isArray(children) && children.length > 0) {
          walk(children as T[])
        }
      }
    }
    walk(rows)
    return selectedRows
  })
}

export function resolveSelectedCount(
  rowSelectionKeys?: string[],
  rowSelectionState?: RowSelectionState
): number {
  if (rowSelectionKeys !== undefined) {
    return rowSelectionKeys.length
  }

  return Object.keys(rowSelectionState ?? {}).length
}
