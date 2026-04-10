<script setup lang="ts" generic="T extends Record<string, unknown>">
import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
  SortingState,
  VisibilityState
} from '@tanstack/vue-table'
import type {
  DataTableAction,
  DataTableColumn,
  DataTablePaginationPassthrough
} from '../types/data-table'
import { UButton, UCheckbox, UDropdownMenu, UTable, UTooltip } from '#components'
import { computed, h, ref, useTemplateRef, watch } from 'vue'
import { isFunction } from '@movk/core'
import { DATA_TABLE_DEFAULTS } from '../constants/data-table'
import { resolveCallbackValue, collectTreeKeys } from '../utils/data-table-utils'
import { resolveColumns } from './data-table/column-helpers'
import {
  keysToRowSelection,
  rowSelectionToKeys,
  useSelectedRows
} from './data-table/selection-helpers'
import DataTableCellTooltip from './data-table/DataTableCellTooltip.vue'
import DataTableColumnToggle from './data-table/DataTableColumnToggle.vue'
import DataTablePagination from './data-table/DataTablePagination.vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = withDefaults(defineProps<{
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey?: keyof T & string
  loading?: boolean
  empty?: string
  sticky?: boolean | 'header' | 'footer'
  virtualize?: boolean | { estimateSize?: number, overscan?: number }
  stripe?: boolean
  bordered?: boolean
  resizable?: boolean
  emptyCell?: string | false
  rowClass?: string | ((row: T) => string)
  rowStyle?: string | Record<string, string> | ((row: T) => string | Record<string, string>)
  childrenKey?: keyof T & string
  defaultExpandAll?: boolean
  indentSize?: number
  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  showPagination?: boolean
  paginationProps?: DataTablePaginationPassthrough
  columnToggle?: boolean
  onRowClick?: (row: T, index: number) => void
  onRowContextmenu?: (e: Event, row: T) => void
  ui?: Record<string, unknown>
}>(), {
  rowKey: 'id' as never,
  emptyCell: DATA_TABLE_DEFAULTS.emptyCell,
  indentSize: DATA_TABLE_DEFAULTS.indentSize,
  resizable: false,
  stripe: false,
  bordered: false,
  defaultExpandAll: false,
  columnToggle: false
})

// ---------------------------------------------------------------------------
// v-model
// ---------------------------------------------------------------------------

const selectedKeys = defineModel<(string | number)[]>('selectedKeys', { default: () => [] })
const sortingModel = defineModel<SortingState>('sorting', { default: () => [] })
const columnVisibilityModel = defineModel<VisibilityState>('columnVisibility', { default: () => ({}) })
const expandedModel = defineModel<ExpandedState>('expanded', { default: () => ({}) })
const pageModel = defineModel<number>('page', { default: 1 })
const pageSizeModel = defineModel<number>('pageSize', { default: 20 })

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

const emit = defineEmits<{
  'selection-change': [rows: T[]]
  'sort-change': [column: string, order: 'asc' | 'desc' | false]
}>()

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------

const tableRef = useTemplateRef('tableRef')

// ---------------------------------------------------------------------------
// Row selection state (internal TanStack format)
// ---------------------------------------------------------------------------

const rowSelection = ref<RowSelectionState>(keysToRowSelection(selectedKeys.value))

let updatingSelection = false
watch(selectedKeys, (keys) => {
  if (updatingSelection) return
  updatingSelection = true
  rowSelection.value = keysToRowSelection(keys)
  updatingSelection = false
}, { deep: true })

watch(rowSelection, (state) => {
  if (updatingSelection) return
  updatingSelection = true
  selectedKeys.value = rowSelectionToKeys(state)
  updatingSelection = false
}, { deep: true })

const selectedRowsComputed = useSelectedRows(
  () => props.data,
  selectedKeys,
  props.rowKey as string
)

watch(selectedKeys, () => {
  emit('selection-change', selectedRowsComputed.value)
})

function clearSelection() {
  selectedKeys.value = []
  rowSelection.value = {}
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

watch(sortingModel, (state) => {
  if (state.length > 0) {
    const s = state[0]!
    emit('sort-change', s.id, s.desc ? 'desc' : 'asc')
  }
  else {
    emit('sort-change', '', false)
  }
})

// ---------------------------------------------------------------------------
// Column resolution
// ---------------------------------------------------------------------------

const pageOffset = computed(() => {
  const p = pageModel.value ?? 1
  const s = pageSizeModel.value ?? 20
  return (p - 1) * s
})

const resolved = computed(() =>
  resolveColumns<T>(props.columns, {
    rowKey: props.rowKey as string,
    pageOffset: pageOffset.value,
    emptyCell: props.emptyCell,
    resizable: props.resizable
  })
)

const columnDefs = computed(() => resolved.value.columnDefs)

// Apply initial states on first resolve
const initialStatesApplied = ref(false)
watch(resolved, (r) => {
  if (initialStatesApplied.value) return
  initialStatesApplied.value = true

  // Merge initial pinning/visibility/sizing (don't overwrite user-provided v-model values)
  if (Object.keys(columnVisibilityModel.value).length === 0) {
    columnVisibilityModel.value = r.initialVisibility
  }
}, { immediate: true })

// ---------------------------------------------------------------------------
// Column labels for toggle
// ---------------------------------------------------------------------------

const columnLabels = computed(() => {
  const labels: Record<string, string> = {}
  for (const col of props.columns) {
    if ('key' in col && !('type' in col) && !('children' in col)) {
      labels[col.key as string] = col.label ?? (col.key as string)
    }
  }
  return labels
})

// ---------------------------------------------------------------------------
// Tree support
// ---------------------------------------------------------------------------

const getSubRows = computed(() => {
  if (!props.childrenKey) return undefined
  const key = props.childrenKey as string
  return (row: T) => (row[key] as T[] | undefined)
})

// Default expand all
watch(() => props.data, (data) => {
  if (props.defaultExpandAll && props.childrenKey && data.length > 0) {
    const allKeys = collectTreeKeys(data, props.childrenKey as string, props.rowKey as string)
    const expanded: Record<string, boolean> = {}
    for (const key of allKeys) {
      expanded[String(key)] = true
    }
    expandedModel.value = expanded
  }
}, { immediate: true })

// ---------------------------------------------------------------------------
// UTable meta (row class/style + stripe + border)
// ---------------------------------------------------------------------------

const tableMeta = computed(() => ({
  class: {
    tr: (context: { original: T }) => {
      const classes: string[] = []
      if (props.stripe) classes.push('even:bg-elevated/30')
      if (props.rowClass) {
        const resolved = resolveCallbackValue(
          props.rowClass,
          context.original
        )
        if (resolved) classes.push(resolved as string)
      }
      return classes.join(' ')
    }
  }
}))

// ---------------------------------------------------------------------------
// UTable props passthrough
// ---------------------------------------------------------------------------

const uTableProps = computed(() => ({
  'data': props.data,
  'columns': columnDefs.value as ColumnDef<T, unknown>[],
  'loading': props.loading,
  'empty': props.empty,
  'sticky': props.sticky,
  'virtualize': props.virtualize,
  'meta': tableMeta.value,
  'ui': props.ui,
  'sorting': sortingModel.value,
  'onUpdate:sorting': (v: SortingState | undefined) => { if (v) sortingModel.value = v },
  'columnVisibility': columnVisibilityModel.value,
  'onUpdate:columnVisibility': (v: VisibilityState | undefined) => { if (v) columnVisibilityModel.value = v },
  'columnPinning': resolved.value.initialPinning,
  'columnSizing': resolved.value.initialSizing,
  'rowSelection': rowSelection.value,
  'onUpdate:rowSelection': (v: RowSelectionState | undefined) => { if (v) rowSelection.value = v },
  'expanded': expandedModel.value,
  'onUpdate:expanded': (v: ExpandedState | undefined) => { if (v) expandedModel.value = v },
  ...(getSubRows.value && { getSubRows: getSubRows.value }),
  ...(props.rowKey && {
    getRowId: (row: T) => String(row[props.rowKey!])
  }),
  ...(props.onRowClick && {
    onSelect: (_e: Event, row: { original: T }) => {
      const idx = props.data.indexOf(row.original)
      props.onRowClick!(row.original, idx)
    }
  }),
  ...(props.onRowContextmenu && {
    onContextmenu: (e: Event, row: { original: T }) => {
      props.onRowContextmenu!(e, row.original)
    }
  }),
  ...(props.resizable && {
    columnSizingOptions: {
      enableColumnResizing: true
    }
  }),
  'sortingOptions': {
    enableSorting: true
  }
}))

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

const showPagination = computed(() => {
  if (props.showPagination != null) return props.showPagination
  return (props.total ?? 0) > 0
})

// ---------------------------------------------------------------------------
// Expose
// ---------------------------------------------------------------------------

defineExpose({
  get tableRef() {
    return tableRef.value?.tableRef ?? null
  },
  get tableApi() {
    return tableRef.value?.tableApi ?? null
  },
  clearSelection
})
</script>

<template>
  <div
    class="data-table"
    :class="{
      'data-table--bordered': bordered
    }"
  >
    <div
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
    </div>

    <UTable
      ref="tableRef"
      v-bind="uTableProps"
    >
      <template v-if="$slots.expanded" #expanded="slotProps">
        <slot name="expanded" :row="slotProps.row.original as T" />
      </template>

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

      <!-- Forward dynamic column slots -->
      <template
        v-for="(_, slotName) in $slots"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </UTable>

    <slot name="table-footer" :data="data" />

    <DataTablePagination
      v-if="showPagination"
      v-model:page="pageModel"
      v-model:page-size="pageSizeModel"
      :total="total ?? 0"
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
    </DataTablePagination>
  </div>
</template>
