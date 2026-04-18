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

// defineModel 的 default 工厂函数会被 hoist 到 setup() 外，不能引用局部变量
// column 相关三个 model 不设 default，改用可写 computed 在本地提供 fallback
const columnVisibilityState = defineModel<VisibilityState>('columnVisibility')
const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
const rowSelectionState = defineModel<RowSelectionState>('rowSelection', {
  default: () => ({})
})
const rowPinningState = defineModel<RowPinningState>('rowPinning', {
  default: () => ({ top: [], bottom: [] })
})
const sortingState = defineModel<SortingState>('sorting', {
  default: () => []
})
// TODO: 需要 v-model 的分页状态、分组状态等
// const selectedKeys = defineModel<(string | number)[]>('selectedKeys')
const expandedState = defineModel<ExpandedState>('expanded', {
  default: () => ({})
})

const resolved = computed(() => resolveColumns<T>(props.columns || [], props))

const effectiveColumnVisibility = computed({
  get: () => columnVisibilityState.value ?? { ...resolved.value.initialVisibility },
  set: (v) => { columnVisibilityState.value = v }
})
const effectiveColumnPinning = computed({
  get: () => columnPinningState.value ?? {
    left: [...(resolved.value.initialPinning.left ?? [])],
    right: [...(resolved.value.initialPinning.right ?? [])]
  },
  set: (v) => { columnPinningState.value = v }
})
const effectiveColumnSizing = computed({
  get: () => columnSizingState.value ?? { ...resolved.value.initialSizing },
  set: (v) => { columnSizingState.value = v }
})
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
      v-model:column-visibility="effectiveColumnVisibility"
      v-model:column-pinning="effectiveColumnPinning"
      v-model:column-sizing="effectiveColumnSizing"
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
