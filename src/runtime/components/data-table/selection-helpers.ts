import type { ColumnDef, RowSelectionState } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { resolveComponent, computed, h, watch } from 'vue'
import {
  keysToRowSelection,
  rowSelectionToKeys
} from './selection-state'

export {
  areSameKeys,
  keysToRowSelection,
  rowSelectionToKeys
} from './selection-state'

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
      ? ({ table }) => h(resolveComponent('UCheckbox'), {
          'modelValue': table.getIsAllPageRowsSelected(),
          'indeterminate': table.getIsSomePageRowsSelected(),
          'onUpdate:modelValue': () => table.toggleAllPageRowsSelected()
        })
      : '',
    cell: ({ row, table }) => h(resolveComponent('UCheckbox'), {
      'modelValue': row.getIsSelected(),
      'disabled': !row.getCanSelect(),
      'onUpdate:modelValue': () => {
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
      },
      style: {
        th: (ctx: { column: { getSize: () => number } }) => ({ width: `${ctx.column.getSize()}px` }),
        td: (ctx: { column: { getSize: () => number } }) => ({ width: `${ctx.column.getSize()}px` })
      }
    }
  } as ColumnDef<T, unknown>
}

/**
 * 建立 selectedKeys <-> RowSelectionState 双向同步
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
