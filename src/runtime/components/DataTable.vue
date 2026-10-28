<script lang="ts" setup generic="T extends TableData">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type {
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  HeaderContext,
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
import type { VNode } from 'vue'
import { computed, ref, toRaw, useAttrs, useTemplateRef, watch } from 'vue'
import { useResizeObserver, useScroll } from '@vueuse/core'
import { useExtendedTv } from '../utils/extend-theme'
import { useMovkLocale } from '../composables/useMovkLocale'
import { resolveColumns } from '../domains/data-table/columns/resolve-columns'
import {
  areSameKeys,
  hasEntries,
  keysToExpanded,
  keysToRowSelection,
  keysToVisibility,
  keysToVisibilityExclude,
  rowSelectionToKeys,
  expandedToKeys,
  visibilityToExcludeKeys,
  visibilityToKeys
} from '../domains/data-table/state/keys'
import { useEffectiveModel, useSyncKeys } from '../domains/data-table/state/models'
import { buildPaginationView } from '../domains/data-table/pagination'
import { useExpandColumnAutoSize } from '../domains/data-table/tree-layout'
import { runLoadMore } from '../domains/data-table/load-more'
import type { HeaderSlotMap } from '../domains/data-table/columns/constants'
import { resolveCallbackValue } from '../domains/data-table/columns/utils'
import { computeTreeSelection } from '../utils/tree-selection'
import { resolveDefaultExpandedKeys } from '../utils/tree-expand'
import { useInfiniteScrollBinding, separate } from '@movk/core'
import theme from '#build/movk-ui/data-table'
import tableTheme from '#build/ui/table'
import type paginationTheme from '#build/movk-ui/data-table-pagination'
import DataTablePagination from '../domains/data-table/components/Pagination.vue'
import type { AppConfig } from 'nuxt/schema'
import type { DataTableExposed, DataTableProps, DataTableSlots } from '../types/data-table/component'
import type { TreeSelectionResult } from '../types/data-table/columns'
import type { DataTablePaginationUi } from '../types/data-table/pagination'

type DataTable = ComponentConfig<(typeof theme & typeof tableTheme), AppConfig, 'dataTable'>
type Pagination = ComponentConfig<typeof paginationTheme, AppConfig, 'dataTablePagination'>

const HEADER_SLOT_SUFFIX = '-header'
const PAGINATION_SLOTS = ['pagination', 'pagination-summary', 'pagination-actions']

const props = withDefaults(defineProps<DataTableProps<T> & {
  ui?: DataTable['slots']
  paginationUi?: DataTablePaginationUi & {
    ui?: Pagination['slots']
  }
}>(), {
  emptyCell: '-',
  indentSize: '1rem',
  canLoadMore: true,
  loadMoreDistance: 100,
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

const slots = defineSlots<DataTableSlots<T>>()

// 表头插槽交由列解析注入标签位，其余插槽原样转发给 UTable
const slotRecord = slots as unknown as Record<string, ((ctx: unknown) => VNode[]) | undefined>
const headerSlots = Object.fromEntries(
  Object.keys(slots)
    .filter(name => name.endsWith(HEADER_SLOT_SUFFIX))
    // 包一层而非直接引用，父组件重渲染后仍取到最新的插槽函数
    .map(name => [name, (ctx: HeaderContext<T, unknown>) => slotRecord[name]?.(ctx) ?? []])
) as HeaderSlotMap<T>

const { t } = useMovkLocale()
const resolved = computed(() => resolveColumns<T>(props.columns || [], props, t, headerSlots))

const forwardSlots = computed(() => Object.keys(slots).filter((name) => {
  if (PAGINATION_SLOTS.includes(name)) return false
  // 已被列解析消费的表头插槽不能再转发：UTable 的同名插槽会赢过 columnDef.header，包裹层会丢失
  if (!name.endsWith(HEADER_SLOT_SUFFIX)) return true
  return !resolved.value.allColumnIds.includes(name.slice(0, -HEADER_SLOT_SUFFIX.length))
}) as (keyof DataTableSlots<T>)[])

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

const defaultExpandedRecord = computed<Record<string, boolean>>(() => {
  if (!props.childrenKey || !props.defaultExpanded) return {}
  const data = ((attrs as { data?: T[] }).data ?? []) as T[]
  const childrenKey = props.childrenKey
  const rowKey = props.rowKey
  // 复刻 TanStack getRowId：有 rowKey 取 String(row[rowKey])，否则根层 index、子层 parentId.index
  const keys = resolveDefaultExpandedKeys(data, props.defaultExpanded, {
    getChildren: row => (row as Record<string, unknown>)[childrenKey],
    getKey: (row, { index, parentKey }) => rowKey !== undefined
      ? String((row as Record<string, unknown>)[rowKey])
      : parentKey !== undefined ? `${parentKey}.${index}` : `${index}`
  })
  return keysToExpanded(keys)
})

const effectiveExpanded = useEffectiveModel(
  expandedState,
  () => expandedKeysState.value !== undefined
    ? keysToExpanded(expandedKeysState.value)
    : defaultExpandedRecord.value,
  hasEntries,
  // 运行时 Vue 把未绑定的布尔型 expanded 模型降级为 false，类型层不体现，故断言比较
  value => value === undefined || (value as unknown) === false
)

// 列集合变化时按 key 形式重新生成可见性记录，使新增列遵守白名单 / 黑名单
watch(() => resolved.value.allColumnIds, (ids, previous) => {
  if (!previous || areSameKeys(ids, previous)) return
  if (columnVisibilityKeysState.value !== undefined) {
    columnVisibilityState.value = keysToVisibility(columnVisibilityKeysState.value, ids)
  }
  else if (columnVisibilityExcludeKeysState.value !== undefined) {
    columnVisibilityState.value = keysToVisibilityExclude(columnVisibilityExcludeKeysState.value, ids)
  }
})

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

// 横向滚动感知:固定列浮于滚动内容之上时显隐边界阴影(tableRef.$el 为 UTable 的 overflow-auto 滚动根)
const scrollTarget = () => tableRef.value?.$el ?? null
const { arrivedState, measure } = useScroll(scrollTarget, { offset: { left: 1, right: 1 } })
const pinStart = computed(() => !arrivedState.left)
const pinEnd = computed(() => !arrivedState.right)
useResizeObserver(scrollTarget, () => measure())

const internalLoading = ref(false)

function invokeLoadMore() {
  return runLoadMore(props.loadMore, {
    setLoading: (value) => { internalLoading.value = value },
    onError: props.onLoadMoreError
  })
}

useInfiniteScrollBinding(
  () => tableRef.value?.$el ?? null,
  {
    distance: () => props.loadMoreDistance,
    canLoadMore: () => !!props.loadMore && props.canLoadMore !== false && !internalLoading.value,
    onLoadMore: invokeLoadMore
  }
)

function scrollToTop(options: ScrollToOptions = { top: 0, behavior: 'smooth' }) {
  tableRef.value?.$el?.scrollTo({ top: 0, ...options })
}

const tableApi = computed<Table<T> | null>(() => tableRef.value?.tableApi ?? null)
const isColumnResizing = computed(() => Boolean(tableApi.value?.getState().columnSizingInfo.isResizingColumn))

const isTreeMode = computed(() => Boolean(props.childrenKey))

useExpandColumnAutoSize({
  data: () => ((attrs as { data?: readonly unknown[] }).data ?? []) as unknown[],
  childrenKey: () => props.childrenKey,
  hasExpandColumn: () => resolved.value.hasExpandColumn,
  indentSize: () => props.indentSize,
  sizing: effectiveSizing
})

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
    ui: {
      ...props.ui,
      wrapper: [props.ui?.wrapper, props.class]
    },
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
    // pageCount / rowCount 由 MDataTable 自管，不灌进 TanStack，避免 setPageIndex 的 clamp 副作用
    paginationOptions: {
      ...(hasPaginationIntent.value && !isManualPagination.value && {
        getPaginationRowModel: getPaginationRowModel()
      }),
      ...separate(props.paginationOptions ?? {}, ['pageCount', 'rowCount']).omitted
    },
    ...(hasRowClickBehavior && {
      onSelect: (e: Event, row: Row<T>) => {
        if (props.expandOnRowClick) {
          const canToggle = isTreeMode.value ? row.getCanExpand() : true
          if (canToggle) row.toggleExpanded()
        }
        if (props.selectOnRowClick) row.toggleSelected()
        ;(props.onSelect as DataTableProps<T>['onSelect'])?.(e, row)
      }
    }),
    ...(props.onHover && { onHover: props.onHover }),
    ...(props.onRowContextmenu && { onContextmenu: props.onRowContextmenu })
  }
})

const selectedCount = computed(() => rowSelectionToKeys(effectiveRowSelection.value).length)

const paginationView = computed(() => {
  const api = tableApi.value
  if (!api || !hasPaginationIntent.value) return null
  return buildPaginationView(api, {
    manual: isManualPagination.value,
    rowCount: props.paginationOptions?.rowCount,
    pageCount: props.paginationOptions?.pageCount,
    show: props.paginationUi?.show,
    pageSizes: props.paginationUi?.pageSizes
  })
})

const paginationRendererProps = computed(() => {
  const v = paginationView.value
  if (!v) return null
  return {
    tableApi: v.tableApi,
    pagination: v.pagination,
    page: v.page,
    rowCount: v.rowCount,
    rowCountKnown: v.rowCountKnown,
    pageCount: v.pageCount,
    from: v.from,
    to: v.to,
    setPage: v.setPage,
    setPageSize: v.setPageSize,
    selectedCount: selectedCount.value
  }
})

const showPagination = computed(() => paginationView.value?.show ?? false)

const treeSelection = computed<TreeSelectionResult<T>>(() => {
  const data = ((attrs as { data?: T[] }).data ?? []) as T[]
  const keys = rowSelectionKeysState.value
    ?? Object.keys(effectiveRowSelection.value).filter(k => effectiveRowSelection.value[k])
  const rowKey = props.rowKey
  const childrenKey = props.childrenKey
  // 未设 rowKey 时 TanStack 以下标路径作 row id，借助行模型反查
  const rowIds = rowKey === undefined
    ? new Map((tableApi.value?.getCoreRowModel().flatRows ?? []).map(row => [toRaw(row.original), row.id]))
    : undefined
  return computeTreeSelection(data, keys, {
    getKey: row => rowIds ? rowIds.get(toRaw(row)) ?? '' : String((row as Record<string, unknown>)[rowKey!]),
    getChildren: childrenKey
      ? row => (row as Record<string, unknown>)[childrenKey] as T[] | undefined
      : () => undefined,
    strategy: resolved.value.selectionStrategy
  })
})

function clearSelection() {
  rowSelectionState.value = {}
  if (rowSelectionKeysState.value !== undefined) rowSelectionKeysState.value = []
}

function expandToDepth(depth: number) {
  const api = tableApi.value
  if (!api) return
  const next: Record<string, boolean> = {}
  for (const row of api.getPrePaginationRowModel().flatRows) {
    if (row.getCanExpand() && row.depth < depth) next[row.id] = true
  }
  effectiveExpanded.value = next
}

function collapseAll() {
  effectiveExpanded.value = {}
}

const tableResetKey = computed(() => {
  const flags = [
    !!props.resizable,
    !!props.sortable,
    !!props.pinable,
    resolved.value.hasColumnPinning,
    resolved.value.hasColumnResizing,
    resolved.value.hasColumnSort,
    isManualPagination.value,
    resolved.value.selectionMode === 'single',
    resolved.value.subRowSelection === false
  ].reduce((mask, enabled, index) => mask | ((enabled ? 1 : 0) << index), 0)

  return `${props.columnResizeMode === 'onEnd' ? 'e' : 'c'}${flags.toString(36)}`
})

defineExpose<DataTableExposed<T>>({
  get tableRef() { return tableRef.value?.tableRef ?? null },
  get tableApi() { return tableApi.value },
  get el() { return tableRef.value?.$el ?? null },
  scrollToTop,
  clearSelection,
  expandToDepth,
  collapseAll,
  get treeSelection() { return treeSelection.value }
})
</script>

<template>
  <div
    :class="extraUi.wrapper"
    data-slot="wrapper"
    :data-pin-start="pinStart || undefined"
    :data-pin-end="pinEnd || undefined"
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
      data-slot="table"
      :style="borderedStyle"
      v-bind="uTableProps"
    >
      <!-- 插槽名是联合类型，vue-tsc 会把作用域参数收敛成全部插槽 props 的交叉类型，转发时只能绕过 -->
      <template v-for="name in forwardSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="(slotProps ?? {}) as any" />
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
