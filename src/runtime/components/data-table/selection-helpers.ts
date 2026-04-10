import type { ColumnDef, RowSelectionState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { computed, watch } from 'vue'

// ---------------------------------------------------------------------------
// Create selection column definition
// ---------------------------------------------------------------------------

export function createSelectionColumnDef<T>(
  id: string,
  size: number,
  mode: 'single' | 'multiple'
): ColumnDef<T, unknown> {
  return {
    id,
    size,
    enableSorting: false,
    enableResizing: false,
    header: mode === 'multiple'
      ? ({ table }) => ({
          component: 'selection-header',
          checked: table.getIsAllPageRowsSelected(),
          indeterminate: table.getIsSomePageRowsSelected(),
          onChange: () => table.toggleAllPageRowsSelected()
        })
      : '',
    cell: ({ row, table }) => ({
      component: mode === 'multiple' ? 'selection-cell' : 'selection-cell-radio',
      checked: row.getIsSelected(),
      disabled: !row.getCanSelect(),
      onChange: () => {
        if (mode === 'single') {
          if (row.getIsSelected()) {
            row.toggleSelected(false)
          }
          else {
            table.resetRowSelection()
            row.toggleSelected(true)
          }
        }
        else {
          row.toggleSelected()
        }
      }
    }),
    meta: {
      class: {
        td: 'text-center',
        th: 'text-center'
      }
    }
  } as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Key ↔ RowSelectionState mapping
// ---------------------------------------------------------------------------

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
 */
export function rowSelectionToKeys(state: RowSelectionState): (string | number)[] {
  return Object.entries(state)
    .filter(([, selected]) => selected)
    .map(([key]) => key)
}

// ---------------------------------------------------------------------------
// Bidirectional sync composable
// ---------------------------------------------------------------------------

/**
 * 建立 selectedKeys ↔ RowSelectionState 双向同步
 */
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

/**
 * 从 data + rowSelection 提取选中的行对象
 */
export function useSelectedRows<T extends Record<string, unknown>>(
  data: Ref<T[]> | (() => T[]),
  selectedKeys: Ref<(string | number)[]>,
  rowKey: string
) {
  return computed(() => {
    const rows = typeof data === 'function' ? data() : data.value
    const keySet = new Set(selectedKeys.value.map(String))
    return rows.filter(row => keySet.has(String(row[rowKey])))
  })
}
