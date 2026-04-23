<script setup lang="ts" generic="T extends TableData">
import type {
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  Row,
  RowPinningState,
  RowSelectionState,
  SortingState,
  Table,
  TableMeta,
  VisibilityState
} from '@tanstack/vue-table'
import type { DataTableProps } from '../types/data-table'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { UTable } from '#components'
import { computed, useAttrs, useTemplateRef } from 'vue'
import {
  createPaginationSnapshot,
  expandedToKeys,
  keysToExpanded,
  keysToRowSelection,
  keysToVisibility,
  keysToVisibilityExclude,
  resolvePaginationViewState,
  resolveTableResetKey,
  resolveCallbackValue,
  resolveSelectedCount,
  rowSelectionToKeys,
  useEffectiveModel,
  useSyncKeys,
  visibilityToExcludeKeys,
  visibilityToKeys
} from '../utils/data-table-utils'
import { resolveColumns } from './data-table/column-helpers'
import DataTablePagination from './data-table/DataTablePagination.vue'
import type { TableData, TableProps } from '@nuxt/ui'

interface UTableExpose<TData extends TableData> {
  tableApi: Table<TData>
  tableRef: HTMLTableElement | null
}

interface PaginationSlotProps<TData extends TableData> {
  tableApi: Table<TData>
  pagination: PaginationState
  page: number
  rowCount: number
  pageCount: number
  currentPageRowCount: number
  from: number
  to: number
  show: boolean
  selectedCount: number
}

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  emptyCell: '-',
  indentSize: '1rem',
  truncate: true,
  columnResizeMode: 'onChange'
})

const paginationState = defineModel<PaginationState>('pagination')
const columnVisibilityState = defineModel<VisibilityState>('columnVisibility')
const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
const rowSelectionState = defineModel<RowSelectionState>('rowSelection')
const rowPinningState = defineModel<RowPinningState>('rowPinning', { default: () => ({ top: [], bottom: [] }) })
const sortingState = defineModel<SortingState>('sorting', { default: () => [] })
const expandedState = defineModel<ExpandedState>('expanded')
const columnVisibilityKeysState = defineModel<string[]>('columnVisibilityKeys')
const columnVisibilityExcludeKeysState = defineModel<string[]>('columnVisibilityExcludeKeys')
const rowSelectionKeysState = defineModel<string[]>('rowSelectionKeys')
const expandedKeysState = defineModel<string[]>('expandedKeys')

const resolved = computed(() => resolveColumns<T>(props.columns || [], props))

function hasEntries(v: unknown): boolean {
  return typeof v === 'object' && v !== null && Object.keys(v).length > 0
}

const effectiveVisibility = useEffectiveModel(
  columnVisibilityState,
  () => {
    if (columnVisibilityKeysState.value !== undefined) {
      return keysToVisibility(columnVisibilityKeysState.value, resolved.value.allColumnIds)
    }
    if (columnVisibilityExcludeKeysState.value !== undefined) {
      return keysToVisibilityExclude(columnVisibilityExcludeKeysState.value, resolved.value.allColumnIds)
    }
    return { ...resolved.value.initialVisibility }
  },
  hasEntries
)

const effectivePinning = useEffectiveModel(
  columnPinningState,
  () => ({
    left: [...(resolved.value.initialPinning.left ?? [])],
    right: [...(resolved.value.initialPinning.right ?? [])]
  }),
  v => (v.left?.length ?? 0) + (v.right?.length ?? 0) > 0
)

const effectiveSizing = useEffectiveModel(
  columnSizingState,
  () => ({ ...resolved.value.initialSizing }),
  hasEntries
)

const effectiveRowSelection = useEffectiveModel(
  rowSelectionState,
  () => {
    if (rowSelectionKeysState.value !== undefined) return keysToRowSelection(rowSelectionKeysState.value)
    return {}
  },
  hasEntries
)

const effectiveExpanded = useEffectiveModel(
  expandedState,
  () => {
    if (expandedKeysState.value !== undefined) return keysToExpanded(expandedKeysState.value)
    return {}
  },
  hasEntries
)

useSyncKeys(
  columnVisibilityKeysState,
  columnVisibilityState,
  keys => keysToVisibility(keys, resolved.value.allColumnIds),
  state => visibilityToKeys(state, resolved.value.allColumnIds)
)
useSyncKeys(
  columnVisibilityExcludeKeysState,
  columnVisibilityState,
  keys => keysToVisibilityExclude(keys, resolved.value.allColumnIds),
  state => visibilityToExcludeKeys(state, resolved.value.allColumnIds)
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

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const tableRef = useTemplateRef<UTableExpose<T>>('tableRef')

const isTreeMode = computed(() => Boolean(props.childrenKey))
const isManualPagination = computed(() => props.paginationOptions?.manualPagination === true)

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
          ...(resolved.value.subRowSelection === false && { enableSubRowSelection: false }),
          ...props.rowSelectionOptions
        }
      : {
          ...(resolved.value.subRowSelection === false && { enableSubRowSelection: false }),
          ...props.rowSelectionOptions
        },
    expandedOptions: {
      ...(resolved.value.hasExpandColumn && { enableExpanding: true }),
      ...props.expandedOptions
    },
    paginationOptions: {
      ...(!isManualPagination.value && {
        getPaginationRowModel: getPaginationRowModel()
      }),
      ...props.paginationOptions
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

const tableApi = computed<Table<T> | null>(() => tableRef.value?.tableApi ?? null)
const selectedCount = computed(() => resolveSelectedCount(
  rowSelectionKeysState.value,
  rowSelectionState.value
))
const paginationView = computed(() =>
  resolvePaginationViewState(
    createPaginationSnapshot(tableApi.value, props.paginationOptions),
    props.paginationUi
  )
)
const paginationSlotProps = computed<PaginationSlotProps<T> | null>(() => {
  if (!tableApi.value) return null

  return {
    tableApi: tableApi.value,
    selectedCount: selectedCount.value,
    ...paginationView.value
  }
})
const showPagination = computed(() => paginationSlotProps.value?.show ?? false)

function clearSelection() {
  rowSelectionState.value = {}

  if (rowSelectionKeysState.value !== undefined) {
    rowSelectionKeysState.value = []
  }
}

const tableResetKey = computed(() => resolveTableResetKey({
  columnResizeMode: props.columnResizeMode,
  resizable: !!props.resizable,
  sortable: !!props.sortable,
  pinable: !!props.pinable,
  hasColumnPinning: resolved.value.hasColumnPinning,
  hasColumnResizing: resolved.value.hasColumnResizing,
  hasColumnSort: resolved.value.hasColumnSort,
  manualPagination: isManualPagination.value
}))

defineExpose({
  tableRef: computed(() => tableRef.value?.tableRef ?? null),
  tableApi,
  clearSelection
})
</script>

<template>
  <div
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
    <UTable
      :key="tableResetKey"
      ref="tableRef"
      v-model:pagination="paginationState"
      v-model:column-visibility="effectiveVisibility"
      v-model:column-pinning="effectivePinning"
      v-model:column-sizing="effectiveSizing"
      v-model:row-selection="effectiveRowSelection"
      v-model:row-pinning="rowPinningState"
      v-model:sorting="sortingState"
      v-model:expanded="effectiveExpanded"
      v-bind="uTableProps"
    >
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
    </UTable>

    <template v-if="showPagination && paginationSlotProps">
      <slot v-if="$slots.pagination" name="pagination" v-bind="paginationSlotProps" />

      <DataTablePagination
        v-else
        :table-api="paginationSlotProps.tableApi"
        :pagination="paginationSlotProps.pagination"
        :page="paginationSlotProps.page"
        :row-count="paginationSlotProps.rowCount"
        :page-count="paginationSlotProps.pageCount"
        :from="paginationSlotProps.from"
        :to="paginationSlotProps.to"
        :selected-count="paginationSlotProps.selectedCount"
        :page-sizes="props.paginationUi?.pageSizes"
        :show-selected-count="props.paginationUi?.showSelectedCount"
        :show-row-range="props.paginationUi?.showRowRange"
        :pagination-props="props.paginationUi?.paginationProps"
        :page-size-select-props="props.paginationUi?.pageSizeSelectProps"
        :text="props.paginationUi?.text"
        :ui="props.paginationUi?.ui"
      >
        <template
          v-if="$slots['pagination-summary']"
          #summary="slotProps"
        >
          <slot name="pagination-summary" v-bind="slotProps" />
        </template>

        <template
          v-if="$slots['pagination-actions']"
          #actions="slotProps"
        >
          <slot name="pagination-actions" v-bind="slotProps" />
        </template>
      </DataTablePagination>
    </template>
  </div>
</template>
