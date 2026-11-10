<script lang="ts" setup generic="T extends TableData">
import { createPaginatedRowModel, rowPaginationFeature } from '@tanstack/vue-table'
import type {
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnVisibilityState,
  ExpandedState,
  HeaderContext,
  PaginationState,
  RowPinningState,
  RowSelectionState,
  SortingState,
  Table,
  TableMeta
} from '@tanstack/vue-table'
import type { TableData, TableFeatures, TableProps, TableRow, ComponentConfig } from '@nuxt/ui'
import { USkeleton, UTable } from '#components'
import type { VNode } from 'vue'
import { computed, shallowRef, ref, toRaw, useAttrs, useTemplateRef, watch } from 'vue'
import { useResizeObserver, useScroll } from '@vueuse/core'
import { useExtendedTv } from '../utils/extend-theme'
import { useComponentProps } from '@nuxt/ui/composables/useComponentProps'
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
import { useTablePersistence } from '../domains/data-table/persist'
import { downloadCsv, getPrePaginatedRows } from '../domains/data-table/export'
import type { DataTableExportOptions } from '../domains/data-table/export'
import ColumnSettings from '../domains/data-table/components/ColumnSettings.vue'
import type { ColumnSettingsItem } from '../domains/data-table/components/ColumnSettings.vue'
import type { HeaderSlotMap } from '../domains/data-table/columns/constants'
import { resolveCallbackValue } from '../domains/data-table/columns/utils'
import { computeTreeSelection } from '../utils/tree-selection'
import { resolveDefaultExpandedKeys } from '../utils/tree-expand'
import { useInfiniteScrollBinding, separate } from '@movk/core'
import theme from '../themes/data-table'
import tableTheme from '#build/ui/table'
import type paginationTheme from '../themes/data-table-pagination'
import DataTablePagination from '../domains/data-table/components/Pagination.vue'
import type { AppConfig } from 'nuxt/schema'
import type { DataTableExposed, DataTableProps, DataTableSlots } from '../types/data-table/component'
import type { TreeSelectionResult } from '../types/data-table/columns'
import type { DataTablePaginationUi } from '../types/data-table/pagination'

type DataTable = ComponentConfig<(typeof theme & typeof tableTheme), AppConfig, 'movkDataTable'>
type Pagination = ComponentConfig<typeof paginationTheme, AppConfig, 'movkDataTablePagination'>

const HEADER_SLOT_SUFFIX = '-header'
const PAGINATION_SLOTS = ['pagination', 'pagination-summary', 'pagination-actions', 'toolbar']

const _props = withDefaults(defineProps<DataTableProps<T> & {
  ui?: DataTable['slots']
  paginationUi?: DataTablePaginationUi & {
    ui?: Pagination['slots']
  }
}>(), {
  emptyCell: '-',
  indentSize: '1rem',
  canLoadMore: true,
  loadMoreDistance: 100,
  skeletonRows: 5,
  truncate: true,
  sticky: true,
  columnResizeMode: 'onChange'
})
// 经 <UTheme :props> 与 app.config.ui.movkDataTable.defaultVariants 解析未显式传入的 prop
// 浅引用保留主题代理与泛型 props 类型，避免模板误判 Ref 或递归解包 schema。
const props = shallowRef(useComponentProps('movkDataTable', _props, theme))

const paginationState = defineModel<PaginationState>('pagination')
const columnVisibilityState = defineModel<ColumnVisibilityState>('columnVisibility')
const columnPinningState = defineModel<ColumnPinningState>('columnPinning')
const columnSizingState = defineModel<ColumnSizingState>('columnSizing')
const rowSelectionState = defineModel<RowSelectionState>('rowSelection')
const rowPinningState = defineModel<RowPinningState>('rowPinning', { default: () => ({ top: [], bottom: [] }) })
const sortingState = defineModel<SortingState>('sorting', { default: () => [] })
const columnOrderState = defineModel<ColumnOrderState>('columnOrder')
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
    .map(name => [name, (ctx: HeaderContext<TableFeatures, T, unknown>) => slotRecord[name]?.(ctx) ?? []])
) as HeaderSlotMap<T>

const { t } = useMovkLocale()
const resolved = computed(() => resolveColumns<T>(props.value.columns || [], props.value, t, headerSlots))

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

const initialPinning = (): ColumnPinningState => ({
  start: [...resolved.value.initialPinning.start],
  end: [...resolved.value.initialPinning.end]
})

const pinningModel = useEffectiveModel(
  columnPinningState,
  initialPinning,
  v => v.start.length + v.end.length > 0
)

// 持久化或外部写入的旧格式（left/right）缺少 start/end，补齐为空数组，避免 TanStack 读取时报错
const effectivePinning = computed<ColumnPinningState>({
  get: () => pinningModel.value,
  set: (value) => {
    pinningModel.value = { start: value?.start ?? [], end: value?.end ?? [] }
  }
})

const effectiveSizing = useEffectiveModel(
  columnSizingState,
  () => ({ ...resolved.value.initialSizing }),
  hasEntries
)

const effectiveColumnOrder = useEffectiveModel<ColumnOrderState>(columnOrderState, () => [])

const effectiveRowSelection = useEffectiveModel(
  rowSelectionState,
  () => rowSelectionKeysState.value !== undefined
    ? keysToRowSelection(rowSelectionKeysState.value)
    : {},
  hasEntries
)

const defaultExpandedRecord = computed<Record<string, boolean>>(() => {
  if (!props.value.childrenKey || !props.value.defaultExpanded) return {}
  const data = ((attrs as { data?: T[] }).data ?? []) as T[]
  const childrenKey = props.value.childrenKey
  const rowKey = props.value.rowKey
  // 复刻 TanStack getRowId：有 rowKey 取 String(row[rowKey])，否则根层 index、子层 parentId.index
  const keys = resolveDefaultExpandedKeys(data, props.value.defaultExpanded, {
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
const tableRef = useTemplateRef<{
  $el: HTMLElement | null
  tableApi: Table<TableFeatures, T>
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
  return runLoadMore(props.value.loadMore, {
    setLoading: (value) => { internalLoading.value = value },
    onError: props.value.onLoadMoreError
  })
}

useInfiniteScrollBinding(
  () => tableRef.value?.$el ?? null,
  {
    distance: () => props.value.loadMoreDistance,
    canLoadMore: () => !!props.value.loadMore && props.value.canLoadMore !== false && !internalLoading.value,
    onLoadMore: invokeLoadMore
  }
)

function scrollToTop(options: ScrollToOptions = { top: 0, behavior: 'smooth' }) {
  tableRef.value?.$el?.scrollTo({ top: 0, ...options })
}

const tableApi = computed<Table<TableFeatures, T> | null>(() => tableRef.value?.tableApi ?? null)
const isColumnResizing = computed(() => Boolean(tableApi.value?.atoms.columnResizing?.get().isResizingColumn))

const isTreeMode = computed(() => Boolean(props.value.childrenKey))

useExpandColumnAutoSize({
  data: () => ((attrs as { data?: readonly unknown[] }).data ?? []) as unknown[],
  childrenKey: () => props.value.childrenKey,
  hasExpandColumn: () => resolved.value.hasExpandColumn,
  indentSize: () => props.value.indentSize,
  sizing: effectiveSizing
})

const isManualPagination = computed(() => props.value.options?.manualPagination === true)
const hasPaginationIntent = computed(() =>
  !props.value.loadMore && (
    isManualPagination.value
    || paginationState.value !== undefined
    || (props.value.paginationUi?.pageSizes?.length ?? 0) > 0
    || props.value.paginationUi?.show === true
  )
)

// UTable 只在挂载时读取一次 features，分页意图变化经 tableResetKey 重建表格
const tableFeatures = computed((): TableProps<T>['features'] => {
  const pagination = hasPaginationIntent.value && {
    rowPaginationFeature,
    // 手动分页由调用方切片，只需分页状态，不注册分页行模型
    ...(!isManualPagination.value && { paginatedRowModel: createPaginatedRowModel() })
  }
  return pagination || props.value.features ? { ...pagination, ...props.value.features } : undefined
})

const tableMeta = computed((): TableMeta<TableFeatures, T> => ({
  ...((props.value.stripe || props.value.rowClass || props.value.meta?.class?.tr) && {
    class: {
      tr: row => [
        props.value.rowClass && resolveCallbackValue(props.value.rowClass, row.original),
        props.value.meta?.class?.tr && resolveCallbackValue(props.value.meta.class.tr, row)
      ].filter(Boolean).join(' ')
    }
  }),
  ...((props.value.rowStyle || props.value.meta?.style?.tr) && {
    style: {
      tr: props.value.rowStyle && props.value.meta?.style?.tr
        ? (row) => {
            const a = resolveCallbackValue(props.value.rowStyle!, row.original)
            const b = resolveCallbackValue(props.value.meta!.style!.tr!, row)
            return typeof a === 'object' && typeof b === 'object' ? { ...a, ...b } : b
          }
        : props.value.rowStyle
          ? row => resolveCallbackValue(props.value.rowStyle!, row.original)
          : props.value.meta!.style!.tr!
    }
  })
}))

const borderedStyle = computed(() => {
  if (!props.value.bordered || typeof props.value.bordered === 'boolean') return undefined
  return {
    '--m-dt-border-color': props.value.bordered.color,
    '--m-dt-border-width': props.value.bordered.width,
    '--m-dt-border-style': props.value.bordered.style
  }
})

const { baseUi, extraUi } = useExtendedTv(
  tableTheme,
  theme,
  'movkDataTable',
  () => ({
    ui: {
      ...props.value.ui,
      wrapper: [props.value.ui?.wrapper, props.value.class]
    },
    variants: {
      fitContent: !!props.value.fitContent,
      bordered: !!props.value.bordered,
      striped: !!props.value.stripe,
      resizing: isColumnResizing.value
    }
  })
)

const uTableProps = computed(() => {
  const hasRowClickBehavior = props.value.expandOnRowClick || props.value.selectOnRowClick || !!props.value.onSelect

  return {
    ...(props.value.rowKey && {
      getRowId: (row => String(row[props.value.rowKey as keyof T])) as TableProps<T>['getRowId']
    }),
    ...(props.value.childrenKey && {
      getSubRows: (row: T) => {
        const children = row[props.value.childrenKey as keyof T]
        return Array.isArray(children) && children.length > 0
          ? (children as T[])
          : undefined
      }
    }),
    ...attrs,
    sticky: props.value.sticky,
    loading: Boolean(props.value.loading) || internalLoading.value,
    columns: resolved.value.columnDefs,
    meta: tableMeta.value,
    ui: baseUi.value,
    features: tableFeatures.value,
    options: {
      ...(props.value.columnResizeMode && { columnResizeMode: props.value.columnResizeMode }),
      enableSorting: !!props.value.sortable || resolved.value.hasColumnSort,
      enableColumnPinning: !!props.value.pinable || resolved.value.hasColumnPinning,
      ...(resolved.value.selectionMode === 'single' && { enableMultiRowSelection: false }),
      ...(resolved.value.subRowSelection === false && { enableSubRowSelection: false }),
      ...(resolved.value.hasExpandColumn && { enableExpanding: true }),
      // pageCount / rowCount 由 MDataTable 自管，不灌进 TanStack，避免 setPageIndex 的 clamp 副作用
      ...separate(props.value.options ?? {}, ['pageCount', 'rowCount']).omitted
    },
    ...(hasRowClickBehavior && {
      onSelect: (e: Event, row: TableRow<T>) => {
        if (props.value.expandOnRowClick) {
          const canToggle = isTreeMode.value ? row.getCanExpand() : true
          if (canToggle) row.toggleExpanded()
        }
        if (props.value.selectOnRowClick) row.toggleSelected()
        ;(props.value.onSelect as DataTableProps<T>['onSelect'])?.(e, row)
      }
    }),
    ...(props.value.onHover && { onHover: props.value.onHover }),
    ...(props.value.onRowContextmenu && { onContextmenu: props.value.onRowContextmenu })
  }
})

const selectedCount = computed(() => rowSelectionToKeys(effectiveRowSelection.value).length)

const paginationView = computed(() => {
  const api = tableApi.value
  if (!api || !hasPaginationIntent.value) return null
  return buildPaginationView(api, {
    manual: isManualPagination.value,
    rowCount: props.value.options?.rowCount,
    pageCount: props.value.options?.pageCount,
    show: props.value.paginationUi?.show,
    pageSizes: props.value.paginationUi?.pageSizes
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
  const rowKey = props.value.rowKey
  const childrenKey = props.value.childrenKey
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
  for (const row of getPrePaginatedRows(api)) {
    if (row.getCanExpand() && row.depth < depth) next[row.id] = true
  }
  effectiveExpanded.value = next
}

function collapseAll() {
  effectiveExpanded.value = {}
}

function expandAll() {
  effectiveExpanded.value = true
}

function selectAll() {
  tableApi.value?.toggleAllRowsSelected(true)
}

function getSelectedRows(): T[] {
  return tableApi.value?.getSelectedRowModel().flatRows.map(row => row.original) ?? []
}

const pageSize = computed<number | undefined>({
  get: () => paginationState.value?.pageSize,
  set: (size) => {
    if (size) paginationState.value = { pageIndex: 0, pageSize: size }
  }
})

const persistence = useTablePersistence(() => props.value.persistKey, {
  columnVisibility: effectiveVisibility,
  columnOrder: effectiveColumnOrder,
  columnSizing: effectiveSizing,
  columnPinning: effectivePinning,
  pageSize
})

function resetColumns() {
  const { initialVisibility, initialPinning, initialSizing, allColumnIds } = resolved.value
  effectiveVisibility.value = columnVisibilityKeysState.value !== undefined
    ? keysToVisibility(columnVisibilityKeysState.value, allColumnIds)
    : { ...initialVisibility }
  effectiveColumnOrder.value = []
  effectiveSizing.value = { ...initialSizing }
  effectivePinning.value = { start: [...initialPinning.start], end: [...initialPinning.end] }
  persistence.clear()
}

function exportCsv(options?: DataTableExportOptions) {
  if (tableApi.value) downloadCsv(tableApi.value, options)
}

const settingsItems = computed<ColumnSettingsItem[]>(() => {
  const api = tableApi.value
  if (!api) return []
  // 读取 effective 状态建立依赖，tableApi 本身不随列状态变化重算
  void effectiveVisibility.value
  void effectiveColumnOrder.value
  return api.getAllLeafColumns()
    .filter(column => !column.id.startsWith('__'))
    .map(column => ({
      id: column.id,
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
      visible: column.getIsVisible(),
      hideable: column.getCanHide()
    }))
})

function toggleColumn(id: string, visible: boolean) {
  effectiveVisibility.value = { ...effectiveVisibility.value, [id]: visible }
}

function moveColumn(from: number, to: number) {
  const ids = settingsItems.value.map(item => item.id)
  const [moved] = ids.splice(from, 1)
  if (moved === undefined) return
  ids.splice(to, 0, moved)
  // 内置列保持原位：左侧内置列在前，其余内置列（如操作列）在后
  const special = resolved.value.allColumnIds.filter(id => id.startsWith('__'))
  const leading = special.filter(id => id !== '__actions')
  effectiveColumnOrder.value = [...leading, ...ids, ...special.filter(id => id === '__actions')]
}

const showToolbar = computed(() => props.value.columnSettings || !!slots.toolbar)

const tableResetKey = computed(() => {
  const flags = [
    !!props.value.resizable,
    !!props.value.sortable,
    !!props.value.pinable,
    resolved.value.hasColumnPinning,
    resolved.value.hasColumnResizing,
    resolved.value.hasColumnSort,
    isManualPagination.value,
    resolved.value.selectionMode === 'single',
    resolved.value.subRowSelection === false,
    hasPaginationIntent.value
  ].reduce((mask, enabled, index) => mask | ((enabled ? 1 : 0) << index), 0)

  return `${props.value.columnResizeMode === 'onEnd' ? 'e' : 'c'}${flags.toString(36)}`
})

defineExpose<DataTableExposed<T>>({
  get tableRef() { return tableRef.value?.tableRef ?? null },
  get tableApi() { return tableApi.value },
  get el() { return tableRef.value?.$el ?? null },
  scrollToTop,
  clearSelection,
  expandToDepth,
  collapseAll,
  expandAll,
  selectAll,
  getSelectedRows,
  resetColumns,
  exportCsv,
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
    <div v-if="showToolbar" :class="extraUi.toolbar" data-slot="toolbar">
      <slot name="toolbar" :table-api="tableApi" :reset-columns="resetColumns">
        <ColumnSettings
          v-if="props.columnSettings"
          :items="settingsItems"
          @toggle="toggleColumn"
          @move="moveColumn"
          @reset="resetColumns"
        />
      </slot>
    </div>

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
      v-model:column-order="effectiveColumnOrder"
      data-slot="table"
      :style="borderedStyle"
      v-bind="uTableProps"
    >
      <!-- 插槽名是联合类型，vue-tsc 会把作用域参数收敛成全部插槽 props 的交叉类型，转发时只能绕过 -->
      <template v-for="name in forwardSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="(slotProps ?? {}) as any" />
      </template>

      <template v-if="!$slots.loading && props.skeletonRows > 0" #loading>
        <div :class="extraUi.skeleton" data-slot="skeleton">
          <USkeleton v-for="index in props.skeletonRows" :key="index" :class="extraUi.skeletonRow" />
        </div>
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
