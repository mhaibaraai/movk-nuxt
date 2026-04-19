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
import { computed, useAttrs } from 'vue'
import {
  expandedToKeys,
  keysToExpanded,
  keysToRowSelection,
  keysToVisibility,
  resolveCallbackValue,
  rowSelectionToKeys,
  useSyncKeys,
  visibilityToKeys
} from '../utils/data-table-utils'
import { resolveColumns } from './data-table/column-helpers'
// import { useScroll } from '@vueuse/core'
// import DataTableColumnToggle from './data-table/DataTableColumnToggle.vue'
// import DataTablePagination from './data-table/DataTablePagination.vue'
import type { TableData, TableProps } from '@nuxt/ui'

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  emptyCell: '-',
  indentSize: '1rem',
  truncate: true,
  columnResizeMode: 'onChange'
})

// const globalFilterState = defineModel<string>('globalFilter')
// const columnFiltersState = defineModel<ColumnFiltersState>('columnFilters')
// const columnOrderState = defineModel<ColumnOrderState>('columnOrder')
// const columnSizingInfoState = defineModel<ColumnSizingInfoState>('columnSizingInfo')
// const groupingState = defineModel<GroupingState>('grouping')
// const paginationState = defineModel<PaginationState>('pagination')

const columnVisibilityState = defineModel<VisibilityState>('columnVisibility')
const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
const rowSelectionState = defineModel<RowSelectionState>('rowSelection')
const rowPinningState = defineModel<RowPinningState>('rowPinning', { default: () => ({ top: [], bottom: [] }) })
const sortingState = defineModel<SortingState>('sorting', { default: () => [] })
const expandedState = defineModel<ExpandedState>('expanded')

const columnVisibilityKeysState = defineModel<string[]>('columnVisibilityKeys')
const rowSelectionKeysState = defineModel<string[]>('rowSelectionKeys')
const expandedKeysState = defineModel<string[]>('expandedKeys')

const resolved = computed(() => resolveColumns<T>(props.columns || [], props))

const effectiveVisibility = computed<VisibilityState>({
  get: () => {
    if (columnVisibilityState.value !== undefined) return columnVisibilityState.value
    if (columnVisibilityKeysState.value !== undefined) {
      return keysToVisibility(columnVisibilityKeysState.value, resolved.value.allColumnIds)
    }
    return { ...resolved.value.initialVisibility }
  },
  set: (v) => { columnVisibilityState.value = v }
})

const effectivePinning = computed<ColumnPinningState>({
  get: () => columnPinningState.value ?? {
    left: [...(resolved.value.initialPinning.left ?? [])],
    right: [...(resolved.value.initialPinning.right ?? [])]
  },
  set: (v) => { columnPinningState.value = v }
})

const effectiveSizing = computed<ColumnSizingState>({
  get: () => columnSizingState.value ?? { ...resolved.value.initialSizing },
  set: (v) => { columnSizingState.value = v }
})

const effectiveRowSelection = computed<RowSelectionState>({
  get: () => {
    if (rowSelectionState.value !== undefined) return rowSelectionState.value
    if (rowSelectionKeysState.value !== undefined) return keysToRowSelection(rowSelectionKeysState.value)
    return {}
  },
  set: (v) => { rowSelectionState.value = v }
})

const effectiveExpanded = computed<ExpandedState>({
  get: () => {
    if (expandedState.value !== undefined) return expandedState.value
    if (expandedKeysState.value !== undefined) return keysToExpanded(expandedKeysState.value)
    return {}
  },
  set: (v) => { expandedState.value = v }
})

// useSyncKeys 的 watch 默认 immediate: false，在 onMounted 后首次触发，不参与 SSR hydration
useSyncKeys(
  columnVisibilityKeysState,
  columnVisibilityState,
  keys => keysToVisibility(keys, resolved.value.allColumnIds),
  state => visibilityToKeys(state, resolved.value.allColumnIds)
)
useSyncKeys(
  rowSelectionKeysState,
  rowSelectionState,
  keys => keysToRowSelection(keys) as RowSelectionState,
  state => rowSelectionToKeys(state).map(String)
)
useSyncKeys(
  expandedKeysState,
  expandedState,
  keys => keysToExpanded(keys),
  state => expandedToKeys(state)
)
// const pageModel = defineModel<number>('page', { default: 1 })
// const pageSizeModel = defineModel<number>('pageSize', { default: 20 })

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const isTreeMode = computed(() => Boolean(props.childrenKey))

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
      v-model:column-visibility="effectiveVisibility"
      v-model:column-pinning="effectivePinning"
      v-model:column-sizing="effectiveSizing"
      v-model:row-selection="effectiveRowSelection"
      v-model:row-pinning="rowPinningState"
      v-model:sorting="sortingState"
      v-model:expanded="effectiveExpanded"
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
