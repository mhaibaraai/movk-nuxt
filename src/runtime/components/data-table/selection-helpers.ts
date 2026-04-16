import type { RowSelectionState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { computed, watch } from 'vue'

function keysToRowSelection(keys: (string | number)[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) {
    state[String(key)] = true
  }
  return state
}

function rowSelectionToKeys(
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

function _areSameKeys(
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

export function useSyncSelection(
  selectedKeys: Ref<(string | number)[]>,
  rowSelection: Ref<RowSelectionState>
): void {
  let updating = false

  watch(selectedKeys, (keys) => {
    if (updating) return
    updating = true
    rowSelection.value = keysToRowSelection(keys)
    updating = false
  }, { deep: true })

  watch(rowSelection, (state) => {
    if (updating) return
    updating = true
    selectedKeys.value = rowSelectionToKeys(state)
    updating = false
  }, { deep: true })
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
