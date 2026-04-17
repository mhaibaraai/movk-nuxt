<script setup lang="ts" generic="T extends TableData">
import type {
  ColumnPinningState,
  ColumnSizingState,
  Row,
  RowPinningState,
  SortingState,
  VisibilityState,
  TableMeta,
  RowSelectionState,
  ExpandedState
} from '@tanstack/vue-table'
import type { DataTableProps } from '../types/data-table'
import { UTable } from '#components'
import { computed, nextTick, useAttrs, useTemplateRef, watchEffect } from 'vue'
import { resolveCallbackValue } from '../utils/data-table-utils'
import { resolveColumns } from './data-table/column-helpers'
// import { useScroll } from '@vueuse/core'
// import {
//   areSameKeys,
//   keysToRowSelection,
//   rowSelectionToKeys,
//   useSelectedRows
// } from './data-table/selection-helpers'
// import DataTableColumnToggle from './data-table/DataTableColumnToggle.vue'
// import DataTablePagination from './data-table/DataTablePagination.vue'
import type { TableData, TableProps } from '@nuxt/ui'

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  fitContent: true,
  emptyCell: '-',
  indentSize: '1rem',
  truncate: true,
  columnResizeMode: 'onChange'
})

// const globalFilterState = defineModel<string>('globalFilter')
// const columnFiltersState = defineModel<ColumnFiltersState>('columnFilters')
// const columnOrderState = defineModel<ColumnOrderState>('columnOrder')
// const columnVisibilityState = defineModel<VisibilityState>('columnVisibility')
// const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
// const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
// const columnSizingInfoState = defineModel<ColumnSizingInfoState>('columnSizingInfo')
// const rowSelectionState = defineModel<RowSelectionState>('rowSelection')
// const rowPinningState = defineModel<RowPinningState>('rowPinning')
// const sortingState = defineModel<SortingState>('sorting')
// const groupingState = defineModel<GroupingState>('grouping')
// const expandedState = defineModel<ExpandedState>('expanded')
// const paginationState = defineModel<PaginationState>('pagination')

const columnVisibilityState = defineModel<VisibilityState>('columnVisibility')
const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
const rowSelectionState = defineModel<RowSelectionState>('rowSelection')
const rowPinningState = defineModel<RowPinningState>('rowPinning')
const sortingState = defineModel<SortingState>('sorting')
// TODO: 需要 v-model 的分页状态、tree 展开状态、分组状态等
// const selectedKeys = defineModel<(string | number)[]>('selectedKeys')
const expandedState = defineModel<ExpandedState>('expanded')
// const pageModel = defineModel<number>('page', { default: 1 })
// const pageSizeModel = defineModel<number>('pageSize', { default: 20 })

// const emit = defineEmits<{
//   'selection-change': [rows: T[]]
//   'sort-change': [column: string, order: 'asc' | 'desc' | false]
//   'load-more': []
// }>()

defineSlots<{
  'toolbar': (props: {
    selectedRows: T[]
    selectedKeys: (string | number)[]
    clearSelection: () => void
  }) => unknown
  'expand-icon': (props: { expanded: boolean, depth: number, row: T }) => unknown
  'pagination-left': (props: { total: number, selectedCount: number }) => unknown
  'pagination-right': (props: { total: number }) => unknown
  'table-footer': (props: { data: T[] }) => unknown
  'expanded': (props: { row: T }) => unknown
  'empty': () => unknown
  'loading': () => unknown
  'caption': () => unknown
  'body-top': () => unknown
  'body-bottom': () => unknown
  [key: string]: unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const tableRef = useTemplateRef('tableRef')
const wrapperRef = useTemplateRef('wrapperRef')

// const infiniteLoadingTriggered = ref(false)

// const rowIdToKeyMap = computed(() => {
//   const map = new Map<string, string | number>()
//   const rowKey = props.rowKey as string
//   const childrenKey = props.childrenKey as string | undefined

//   const walk = (rows: T[]) => {
//     for (const row of rows) {
//       const keyValue = row[rowKey]
//       if (typeof keyValue === 'string' || typeof keyValue === 'number') {
//         map.set(String(keyValue), keyValue)
//       }

//       if (!childrenKey) continue
//       const children = row[childrenKey]
//       if (Array.isArray(children) && children.length > 0) {
//         walk(children as T[])
//       }
//     }
//   }

//   walk(props.data)
//   return map
// })

// function updateSelectedKeysFromRowSelection(state: RowSelectionState | undefined) {
//   if (!state) return

//   const nextKeys = rowSelectionToKeys(state, rowIdToKeyMap.value)
//   if (areSameKeys(nextKeys, selectedKeys.value)) return

//   selectedKeys.value = nextKeys
// }

// const selectedRowsComputed = useSelectedRows(
//   () => props.data,
//   selectedKeys,
//   props.rowKey as string,
//   props.childrenKey as string | undefined
// )

// watch(selectedKeys, () => {
//   emit('selection-change', selectedRowsComputed.value)
// })

// function clearSelection() {
//   selectedKeys.value = []
// }

// const pageOffset = computed(() => {
//   const p = pageModel.value ?? 1
//   const s = pageSizeModel.value ?? 20
//   return (p - 1) * s
// })

// const effectiveTotal = computed(() => props.total ?? props.data.length)

// const useClientPagination = computed(() => props.total == null && !props.infiniteScroll)

// const tableData = computed(() => {
//   if (!useClientPagination.value) return props.data

//   const size = Math.max(1, pageSizeModel.value ?? 20)
//   return props.data.slice(pageOffset.value, pageOffset.value + size)
// })

const resolved = computed(() => resolveColumns<T>(props.columns || [], props))

function isColumnPinningEmpty(state: ColumnPinningState | undefined): boolean {
  if (!state) return true
  return (state.left?.length ?? 0) === 0 && (state.right?.length ?? 0) === 0
}

const stopInitWatcher = watchEffect(() => {
  const r = resolved.value

  if (!columnVisibilityState.value || Object.keys(columnVisibilityState.value).length === 0) {
    columnVisibilityState.value = { ...r.initialVisibility }
  }

  if (isColumnPinningEmpty(columnPinningState.value)) {
    columnPinningState.value = {
      left: [...(r.initialPinning.left ?? [])],
      right: [...(r.initialPinning.right ?? [])]
    }
  }

  if (!columnSizingState.value || Object.keys(columnSizingState.value).length === 0) {
    columnSizingState.value = { ...r.initialSizing }
  }

  nextTick(() => stopInitWatcher())
})

// const columnLabels = computed(() => {
//   const labels: Record<string, string> = {}
//   for (const col of props.columns) {
//     if ('key' in col && !('type' in col) && !('children' in col)) {
//       labels[col.key as string] = col.label ?? (col.key as string)
//     }
//   }
//   return labels
// })

// const getSubRows = computed(() => {
//   if (!props.childrenKey) return undefined
//   const key = props.childrenKey as string
//   return (row: T) => {
//     const children = row[key]
//     return Array.isArray(children) && children.length > 0
//       ? (children as T[])
//       : undefined
//   }
// })

const isTreeMode = computed(() => Boolean(props.childrenKey))

// const enableExpandedSlot = computed(() => Boolean(slots.expanded) && !isTreeMode.value)

// watch(() => props.data, (data) => {
//   if (!props.preserveSelectionOnDataChange) {
//     const validIds = new Set(rowIdToKeyMap.value.keys())
//     const nextSelected = selectedKeys.value.filter(key => validIds.has(String(key)))

//     if (!areSameKeys(nextSelected, selectedKeys.value)) {
//       selectedKeys.value = nextSelected
//     }
//   }

//   if (props.defaultExpandAll && props.childrenKey && data.length > 0) {
//     const allKeys = collectTreeKeys(
//       data,
//       props.childrenKey as string,
//       props.rowKey as string,
//       true
//     )
//     const expanded: Record<string, boolean> = {}
//     for (const key of allKeys) {
//       expanded[String(key)] = true
//     }
//     expandedModel.value = expanded
//   }
// }, { immediate: true })

// watch([effectiveTotal, pageSizeModel], () => {
//   const currentPageSize = Math.max(1, pageSizeModel.value ?? 20)
//   const maxPage = Math.max(1, Math.ceil(effectiveTotal.value / currentPageSize))
//   if (pageModel.value > maxPage) {
//     pageModel.value = maxPage
//   }
// }, { immediate: true })

// watch(() => props.loading, (loading) => {
//   if (!loading) {
//     infiniteLoadingTriggered.value = false
//   }
// })

// function handleTableScroll(event: Event) {
//   if (!props.infiniteScroll || !props.canLoadMore || props.loading || infiniteLoadingTriggered.value) {
//     return
//   }

//   const target = event.target
//   if (!(target instanceof HTMLElement)) return

//   const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
//   if (distanceToBottom > props.infiniteScrollDistance) return

//   infiniteLoadingTriggered.value = true
//   emit('load-more')
// }

// function hasSubRows(row: T): boolean {
//   if (!props.childrenKey) return false
//   const children = row[props.childrenKey as string]
//   return Array.isArray(children) && children.length > 0
// }

// function toggleExpandedByRow(row: T) {
//   if (!hasSubRows(row)) return

//   const rowIdValue = row[props.rowKey as string]
//   if (rowIdValue == null) return

//   const rowId = String(rowIdValue)
//   const current = expandedModel.value

//   if (current === true) return

//   const nextExpanded = typeof current === 'object' && current
//     ? { ...(current as Record<string, boolean>) }
//     : {}

//   nextExpanded[rowId] = !nextExpanded[rowId]
//   expandedModel.value = nextExpanded
// }

// const forwardedSlotNames = computed(() => {
//   return Object.keys(slots).filter(name => /-(?:cell|header|footer)$/.test(name))
// })

const tableMeta = computed((): TableMeta<T> => ({
  ...((props.stripe || props.rowClass || props.meta?.class?.tr) && {
    class: {
      tr: row => [
        props.rowClass && resolveCallbackValue(props.rowClass, row),
        props.meta?.class?.tr && resolveCallbackValue(props.meta.class.tr, row)
      ].filter(Boolean).join(' ')
    }
  }),
  ...((props.rowStyle || props.meta?.style?.tr) && {
    style: {
      tr: props.rowStyle && props.meta?.style?.tr
        ? (row) => {
            const a = resolveCallbackValue(props.rowStyle!, row)
            const b = resolveCallbackValue(props.meta!.style!.tr!, row)
            return typeof a === 'object' && typeof b === 'object' ? { ...a, ...b } : b
          }
        : (props.rowStyle ?? props.meta!.style!.tr!)
    }
  })
}))

const borderedStyle = computed(() => {
  if (!props.bordered || typeof props.bordered === 'boolean') return undefined
  return {
    '--m-dt-border-color': props.bordered.color,
    '--m-dt-border-width': props.bordered.width,
    '--m-dt-border-style': props.bordered.style
  }
})

// const tableContainerStyle = computed(() => {
//   if (!props.infiniteScroll) return undefined

//   return {
//     maxHeight: props.infiniteScrollHeight,
//     overflowY: 'auto'
//   }
// })

const uTableProps = computed(() => {
  const hasRowClickBehavior = props.expandOnRowClick || props.selectOnRowClick || !!props.onSelect

  return {
    ...(props.rowKey && {
      getRowId: (row => String(row[props.rowKey as keyof T])) as TableProps<T>['getRowId']
    }),
    ...(props.childrenKey && {
      getSubRows: (row: T) => {
        const children = row[props.childrenKey as keyof T]
        return Array.isArray(children) && children.length > 0
          ? (children as T[])
          : undefined
      }
    }),
    ...attrs,
    columns: resolved.value.columnDefs,
    meta: tableMeta.value,
    ui: {
      ...props.ui,
      ...(props.fitContent && { base: ['w-fit min-w-0', props.ui?.base].filter(Boolean).join(' ') }),
      tbody: ['divide-y-0', props.ui?.tbody].filter(Boolean).join(' ')
    },
    columnSizingOptions: {
      enableColumnResizing: !!props.resizable || resolved.value.hasColumnResizing,
      ...(props.columnResizeMode && { columnResizeMode: props.columnResizeMode }),
      ...props.columnSizingOptions
    },
    sortingOptions: {
      enableSorting: !!props.sortable || resolved.value.hasColumnSort,
      ...props.sortingOptions
    },
    columnPinningOptions: {
      enableColumnPinning: !!props.pinable || resolved.value.hasColumnPinning,
      ...props.columnPinningOptions
    },
    rowSelectionOptions: resolved.value.selectionMode
      ? {
          ...(resolved.value.selectionMode === 'single' && { enableMultiRowSelection: false }),
          ...props.rowSelectionOptions
        }
      : props.rowSelectionOptions,
    expandedOptions: {
      ...(resolved.value.hasExpandColumn && { enableExpanding: true }),
      ...props.expandedOptions
    },
    ...(hasRowClickBehavior && {
      onSelect: (e: Event, row: Row<T>) => {
        if (props.expandOnRowClick && row.getCanExpand()) row.toggleExpanded()
        if (props.selectOnRowClick) row.toggleSelected()
        ;(props.onSelect as DataTableProps<T>['onSelect'])?.(e, row)
      }
    })
  }
})

const tableResetKey = computed(() =>
  `${props.columnResizeMode}|${!!props.resizable}|${!!props.sortable}|${!!props.pinable}|${resolved.value.hasColumnPinning}|${resolved.value.hasColumnResizing}|${resolved.value.hasColumnSort}`
)

// const showPagination = computed(() => {
//   if (props.infiniteScroll) return false
//   if (props.showPagination != null) return props.showPagination
//   return effectiveTotal.value > Math.max(1, pageSizeModel.value ?? 20)
// })

// defineExpose({
//   get tableRef() {
//     return tableRef.value?.tableRef ?? null
//   },
//   get tableApi() {
//     return tableRef.value?.tableApi ?? null
//   },
//   clearSelection
// })
</script>

<template>
  <div
    ref="wrapperRef"
    class="data-table"
    :class="[
      {
        'data-table--bordered': !!bordered,
        'data-table--striped': !!stripe,
        'data-table--tree': isTreeMode
      }
    ]"
    :style="borderedStyle"
  >
    <!-- <div
      v-if="$slots.toolbar || columnToggle"
      class="flex items-center justify-between mb-3"
    >
      <div class="flex items-center gap-2">
        <slot
          name="toolbar"
          :selected-rows="selectedRowsComputed"
          :selected-keys="selectedKeys"
          :clear-selection="clearSelection"
        />
      </div>

      <div v-if="columnToggle" class="flex items-center gap-1">
        <DataTableColumnToggle
          v-model="columnVisibilityModel"
          :column-labels="columnLabels"
        />
      </div>
    </div> -->
    <!-- <div :style="tableContainerStyle" @scroll.passive="handleTableScroll"> -->
    <UTable
      :key="tableResetKey"
      ref="tableRef"
      v-model:column-visibility="columnVisibilityState"
      v-model:column-pinning="columnPinningState"
      v-model:column-sizing="columnSizingState"
      v-model:row-selection="rowSelectionState"
      v-model:row-pinning="rowPinningState"
      v-model:sorting="sortingState"
      v-model:expanded="expandedState"
      v-bind="uTableProps"
    >
      <!-- <template v-if="enableExpandedSlot" #expanded="slotProps">
        <slot name="expanded" :row="slotProps.row.original as T" />
      </template> -->

      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>

      <template v-if="$slots.loading" #loading>
        <slot name="loading" />
      </template>

      <template v-if="$slots.caption" #caption>
        <slot name="caption" />
      </template>

      <template v-if="$slots['body-top']" #body-top>
        <slot name="body-top" />
      </template>

      <template v-if="$slots['body-bottom']" #body-bottom>
        <slot name="body-bottom" />
      </template>

      <!-- <template
        v-for="slotName in forwardedSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps" />
      </template> -->
    </UTable>
    <!-- </div> -->

    <!-- <slot name="table-footer" :data="data" /> -->

    <!-- <DataTablePagination
      v-if="showPagination"
      v-model:page="pageModel"
      v-model:page-size="pageSizeModel"
      :total="effectiveTotal"
      :page-sizes="pageSizes"
      :pagination-props="paginationProps"
      :selected-count="selectedKeys.length"
    >
      <template v-if="$slots['pagination-left']" #left="paginationSlotProps">
        <slot name="pagination-left" v-bind="paginationSlotProps" />
      </template>
      <template v-if="$slots['pagination-right']" #right="paginationSlotProps">
        <slot name="pagination-right" v-bind="paginationSlotProps" />
      </template>
    </DataTablePagination> -->
  </div>
</template>
