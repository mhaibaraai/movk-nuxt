<script lang="ts" setup generic="T extends TableData">
import { getPaginationRowModel } from '@tanstack/vue-table'
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
import type { TableData, TableProps, ComponentConfig } from '@nuxt/ui'
import { UTable } from '#components'
import { useAppConfig } from '#imports'
import type { Ref, WritableComputedRef } from 'vue'
import { computed, onMounted, ref, useAttrs, useTemplateRef, watch } from 'vue'
import { useExtendedTv } from '../utils/extend-theme'
import { resolveColumns } from '../domains/data-table/columns/resolve-columns'
import { resolveCallbackValue } from '../domains/data-table/columns/utils'
import { computeTreeRowSelection } from '../domains/data-table/tree-selection'
import { useInfiniteScrollBinding } from '../domains/data-table/composables/useInfiniteScrollBinding'
import theme from '#build/movk-ui/data-table'
import tableTheme from '#build/ui/table'
import type paginationTheme from '#build/movk-ui/data-table-pagination'
import DataTablePagination from '../domains/data-table/components/Pagination.vue'
import type { AppConfig } from 'nuxt/schema'
import type { DataTableExposed, DataTableProps } from '../types/data-table/component'
import type { TreeSelectionResult } from '../types/data-table/columns'
import type { DataTablePaginationUi } from '../types/data-table/pagination'

interface Props extends DataTableProps<T> {
  ui?: ComponentConfig<typeof tableTheme & typeof theme, AppConfig, 'dataTable'>['slots']
  paginationUi?: DataTablePaginationUi & {
    ui?: ComponentConfig<typeof paginationTheme, AppConfig, 'dataTablePagination'>['slots']
  }
}

const props = withDefaults(defineProps<Props>(), {
  emptyCell: '-',
  indentSize: '1rem',
  truncate: true,
  sticky: true,
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

function keysToVisibility(keys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(keys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) state[id] = set.has(id)
  return state
}

function visibilityToKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] !== false)
}

function keysToVisibilityExclude(excludeKeys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(excludeKeys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) state[id] = !set.has(id)
  return state
}

function visibilityToExcludeKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] === false)
}

function keysToRowSelection(keys: string[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) state[key] = true
  return state
}

function rowSelectionToKeys(state: RowSelectionState): string[] {
  return Object.entries(state).filter(([, s]) => s).map(([k]) => k)
}

function keysToExpanded(keys: string[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const key of keys) state[key] = true
  return state
}

function expandedToKeys(state: ExpandedState): string[] {
  if (state === true) return []
  return Object.entries(state).filter(([, e]) => e).map(([k]) => k)
}

function areSameKeys(a: readonly (string | number)[], b: readonly (string | number)[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a.map(String))
  for (const key of b) if (!set.has(String(key))) return false
  return true
}

function useEffectiveModel<V>(
  model: Ref<V | undefined>,
  getDefault: () => V,
  syncBack?: (value: V) => boolean
): WritableComputedRef<V> {
  const effective = computed<V>({
    get: () => model.value !== undefined ? model.value : getDefault(),
    set: (value) => { model.value = value }
  })

  if (syncBack !== undefined) {
    onMounted(() => {
      if (model.value !== undefined) return
      const defaults = getDefault()
      if (syncBack(defaults)) model.value = defaults
    })
  }

  return effective
}

function useSyncKeys<R>(
  keys: Ref<string[] | undefined>,
  record: Ref<R | undefined>,
  toRecord: (keys: string[]) => R,
  toKeys: (record: R) => string[]
): void {
  let updating = false

  watch(keys, (next) => {
    if (updating) return
    const current = record.value !== undefined ? toKeys(record.value) : []
    if (areSameKeys(current, next ?? [])) return
    updating = true
    record.value = toRecord(next ?? [])
    updating = false
  }, { deep: true })

  watch(record, (next) => {
    if (updating) return
    if (next === undefined) return
    const derived = toKeys(next)
    if (areSameKeys(derived, keys.value ?? [])) return
    updating = true
    keys.value = derived
    updating = false
  }, { deep: true })
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
  () => rowSelectionKeysState.value !== undefined
    ? keysToRowSelection(rowSelectionKeysState.value)
    : {},
  hasEntries
)

const effectiveExpanded = useEffectiveModel(
  expandedState,
  () => expandedKeysState.value !== undefined
    ? keysToExpanded(expandedKeysState.value)
    : {},
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
  keysToRowSelection,
  rowSelectionToKeys
)
useSyncKeys(
  expandedKeysState,
  expandedState,
  keysToExpanded,
  expandedToKeys
)

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { dataTable?: unknown } }
const tableRef = useTemplateRef<{
  $el: HTMLElement | null
  tableApi: Table<T>
  tableRef: HTMLTableElement | null
}>('tableRef')

const internalLoading = ref(false)

async function invokeLoadMore() {
  if (!props.loadMore) return
  const ret = props.loadMore()
  if (ret && typeof (ret as Promise<void>).then === 'function') {
    internalLoading.value = true
    try {
      await ret
    } finally {
      internalLoading.value = false
    }
  }
}

useInfiniteScrollBinding(
  () => tableRef.value?.$el ?? null,
  {
    distance: () => props.loadMoreDistance ?? 100,
    canLoadMore: () => !!props.loadMore && props.canLoadMore !== false && !internalLoading.value,
    onLoadMore: invokeLoadMore
  }
)

onMounted(() => {
  if (props.loadMore && props.loadMoreImmediate) invokeLoadMore()
})

function scrollToTop(options: ScrollToOptions = { top: 0, behavior: 'smooth' }) {
  tableRef.value?.$el?.scrollTo({ top: 0, ...options })
}

const tableApi = computed<Table<T> | null>(() => tableRef.value?.tableApi ?? null)
const isColumnResizing = computed(() => Boolean(tableApi.value?.getState().columnSizingInfo.isResizingColumn))

const isTreeMode = computed(() => Boolean(props.childrenKey))
const isManualPagination = computed(() => props.paginationOptions?.manualPagination === true)
const hasPaginationIntent = computed(() =>
  !props.loadMore && (
    props.paginationOptions !== undefined
    || paginationState.value !== undefined
    || (props.paginationUi?.pageSizes?.length ?? 0) > 0
    || props.paginationUi?.show === true
  )
)

const tableMeta = computed((): TableMeta<T> => ({
  ...((props.stripe || props.rowClass || props.meta?.class?.tr) && {
    class: {
      tr: row => [
        props.rowClass && resolveCallbackValue(props.rowClass, row.original),
        props.meta?.class?.tr && resolveCallbackValue(props.meta.class.tr, row)
      ].filter(Boolean).join(' ')
    }
  }),
  ...((props.rowStyle || props.meta?.style?.tr) && {
    style: {
      tr: props.rowStyle && props.meta?.style?.tr
        ? (row) => {
            const a = resolveCallbackValue(props.rowStyle!, row.original)
            const b = resolveCallbackValue(props.meta!.style!.tr!, row)
            return typeof a === 'object' && typeof b === 'object' ? { ...a, ...b } : b
          }
        : props.rowStyle
          ? row => resolveCallbackValue(props.rowStyle!, row.original)
          : props.meta!.style!.tr!
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

const { baseUi, extraUi } = useExtendedTv(
  tableTheme,
  theme,
  () => appConfig.movk?.dataTable,
  () => ({
    ui: props.ui,
    variants: {
      fitContent: !!props.fitContent,
      bordered: !!props.bordered,
      striped: !!props.stripe,
      tree: isTreeMode.value,
      resizing: isColumnResizing.value
    }
  })
)

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
    sticky: props.sticky,
    loading: Boolean(props.loading) || internalLoading.value,
    columns: resolved.value.columnDefs,
    meta: tableMeta.value,
    ui: baseUi.value,
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
      ...(hasPaginationIntent.value && !isManualPagination.value && {
        getPaginationRowModel: getPaginationRowModel()
      }),
      ...props.paginationOptions
    },
    ...(hasRowClickBehavior && {
      onSelect: (e: Event, row: Row<T>) => {
        if (props.expandOnRowClick && row.getCanExpand()) row.toggleExpanded()
        if (props.selectOnRowClick) row.toggleSelected()
        ;(props.onSelect as Props['onSelect'])?.(e, row)
      }
    })
  }
})

const selectedCount = computed(() => {
  if (rowSelectionKeysState.value !== undefined) return rowSelectionKeysState.value.length
  return Object.keys(rowSelectionState.value ?? {}).length
})

const paginationView = computed(() => {
  const api = tableApi.value
  if (!api || !hasPaginationIntent.value) return null

  const manual = isManualPagination.value
  const explicitRowCount = props.paginationOptions?.rowCount
  const explicitPageCount = props.paginationOptions?.pageCount
  const pagination = api.getState().pagination
  const pageIndex = pagination?.pageIndex ?? 0
  const pageSize = pagination?.pageSize ?? 10
  const currentPageRowCount = api.getRowModel().rows.length

  const rowCount = manual
    ? Math.max(0, explicitRowCount ?? api.getRowCount())
    : api.getRowCount()

  const fallbackManualPageCount = explicitRowCount !== undefined
    ? Math.ceil(Math.max(0, explicitRowCount) / pageSize)
    : api.getPageCount()
  const pageCount = manual
    ? Math.max(0, explicitPageCount ?? fallbackManualPageCount)
    : api.getPageCount()

  const from = rowCount > 0 && currentPageRowCount > 0 ? pageIndex * pageSize + 1 : 0
  const to = rowCount > 0 && currentPageRowCount > 0 ? Math.min(rowCount, from + currentPageRowCount - 1) : 0
  const show = props.paginationUi?.show
    ?? (pageCount > 1 || (props.paginationUi?.pageSizes?.length ?? 0) > 1)

  return {
    tableApi: api,
    pagination: { pageIndex, pageSize },
    page: pageIndex + 1,
    rowCount,
    pageCount,
    currentPageRowCount,
    from,
    to,
    show
  }
})

const paginationRendererProps = computed(() => {
  const v = paginationView.value
  if (!v) return null
  return {
    tableApi: v.tableApi,
    pagination: v.pagination,
    page: v.page,
    rowCount: v.rowCount,
    pageCount: v.pageCount,
    from: v.from,
    to: v.to,
    selectedCount: selectedCount.value
  }
})

const showPagination = computed(() => paginationView.value?.show ?? false)

const treeSelection = computed<TreeSelectionResult<T>>(() => {
  const data = ((attrs as { data?: T[] }).data ?? []) as T[]
  const keys = rowSelectionKeysState.value
    ?? Object.keys(effectiveRowSelection.value).filter(k => effectiveRowSelection.value[k])
  return computeTreeRowSelection(data, keys, {
    rowKey: props.rowKey,
    childrenKey: props.childrenKey,
    strategy: resolved.value.selectionStrategy
  })
})

function clearSelection() {
  rowSelectionState.value = {}
  if (rowSelectionKeysState.value !== undefined) rowSelectionKeysState.value = []
}

const tableResetKey = computed(() => {
  const flags = [
    !!props.resizable,
    !!props.sortable,
    !!props.pinable,
    resolved.value.hasColumnPinning,
    resolved.value.hasColumnResizing,
    resolved.value.hasColumnSort,
    isManualPagination.value
  ].reduce((mask, enabled, index) => mask | ((enabled ? 1 : 0) << index), 0)

  return `${props.columnResizeMode === 'onEnd' ? 'e' : 'c'}${flags.toString(36)}`
})

defineExpose<DataTableExposed<T>>({
  get tableRef() { return tableRef.value?.tableRef ?? null },
  get tableApi() { return tableApi.value },
  get el() { return tableRef.value?.$el ?? null },
  scrollToTop,
  clearSelection,
  get treeSelection() { return treeSelection.value }
})
</script>

<template>
  <div :class="extraUi.wrapper">
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
      :style="borderedStyle"
      v-bind="uTableProps"
    >
      <template v-if="$slots.expanded" #expanded="{ row }">
        <slot name="expanded" :row="row" />
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
    </UTable>

    <template v-if="showPagination && paginationView && paginationRendererProps">
      <slot
        v-if="$slots.pagination"
        name="pagination"
        v-bind="{ ...paginationView, selectedCount }"
      />

      <DataTablePagination
        v-else
        v-bind="paginationRendererProps"
        :ui-config="props.paginationUi"
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
