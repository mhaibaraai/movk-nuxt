<script lang="ts">
import type {
  CellContext,
  ColumnDefTemplate,
  ColumnMeta,
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
import type { ButtonProps, ComponentConfig, TableData, TableProps, TooltipProps } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/data-table'
import tableTheme from '#build/ui/table'
import type { OmitByKey, Suggest } from '@movk/core'
import type {
  DataTableActionButtonContext,
  DataTableColumn,
  DataTableDataColumn,
  DataTableDensityPreset,
  DataTableDynamic,
  DataTablePinButtonContext,
  DataTableSortButtonContext,
  TreeSelectionResult
} from '../types/data-table'

type DataTable = ComponentConfig<typeof tableTheme & typeof theme, AppConfig, 'dataTable'>

export interface DataTableProps<T extends TableData> extends /* @vue-ignore */ OmitByKey<
  TableProps<T>,
  'columns'
  | 'meta'
  | 'ui'
  | 'columnSizingOptions'
  | 'columnPinningOptions'
  | 'rowSelectionOptions'
  | 'sortingOptions'
  | 'expandedOptions'
  | 'paginationOptions'
  | 'onSelect'
> {
  /**
   * 行唯一标识字段
   *
   * 提供后自动派生 `getRowId: (row) => String(row[rowKey])`；
   * 同时传入 `getRowId` 时后者优先。未提供且未传入 `getRowId` 时，
   * TanStack Table 默认使用行索引作为 ID。
   *
   * @example 'id'
   */
  rowKey?: Suggest<keyof T & string>
  /** 列定义 */
  columns?: DataTableColumn<T>[]
  /**
   * 是否为斑马纹、（默认 'even:bg-elevated/30'）
   * @defaultValue false
   */
  stripe?: boolean
  /**
   * 是否带有纵向边框，传 true 使用默认样式，传对象可定制颜色/粗细/线型
   * - color: 边框颜色，支持 CSS 颜色值或 CSS var，默认 'var(--ui-border)'
   * - width: 边框宽度，默认 '1px'
   * - style: 边框样式，默认 'solid'
   * @defaultValue false
   */
  bordered?: boolean | {
    color?: string
    width?: string
    style?: 'solid' | 'dashed' | 'dotted' | 'double'
  }
  /**
   * 表格宽度由列宽内容决定（w-fit），关闭后表格撑满容器
   * @defaultValue false
   */
  fitContent?: boolean
  /**
   * 空值占位符，null/undefined/'' 时显示
   * @defaultValue '-'
   */
  emptyCell?: false | string | ColumnDefTemplate<CellContext<T, unknown>>
  /**
   * 全局启用数据列 pin 按钮，传函数可按列定义动态决定
   * @defaultValue false
   */
  pinable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /** 固定列按钮 props 透传 */
  pinButtonProps?: DataTableDynamic<ButtonProps, DataTablePinButtonContext<T>>
  /**
   * 全局数据列可排序，传函数可按列定义动态决定
   * @defaultValue false
   */
  sortable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /** 排序按钮 props 透传 */
  sortButtonProps?: DataTableDynamic<ButtonProps, DataTableSortButtonContext<T>>
  /** 全局 action 按钮 props，与列级 action.buttonProps 深度合并，列级优先 */
  actionButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
  /**
   * 全局溢出阈值
   * @defaultValue 3
   */
  actionsMaxInline?: number
  /** 全局溢出按钮样式 */
  actionsOverflowTrigger?: DataTableDynamic<ButtonProps, CellContext<T, unknown>>
  /**
   * 启用列拖拽调整宽度，传函数可按列定义动态决定
   * @defaultValue false
   */
  resizable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /**
   * 列宽拖动模式
   * - 'onChange' = 拖动中实时重排
   * - 'onEnd' = 释放鼠标后才更新
   * @defaultValue 'onChange'
   */
  columnResizeMode?: 'onChange' | 'onEnd'
  /**
   * 表格密度，控制单元格与表头内边距
   */
  density?: DataTableDensityPreset | ColumnMeta<T, unknown>['class']
  /** 表格元数据 */
  meta?: TableMeta<T>
  /** 行条件 class */
  rowClass?: string | ((row: T) => string)
  /** 行条件 style */
  rowStyle?: string | Record<string, string> | ((row: T) => string | Record<string, string>)
  /**
   * 全局数据列溢出 Tooltip，传函数可按 cell 上下文动态决定
   * - true = 溢出时显示（单行截断）
   * - number = 溢出时显示（多行截断行数）
   * - false = 禁用
   * - 函数 = 按 cell 上下文动态决定
   * @defaultValue false
   */
  tooltip?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  /** 全局 Tooltip 透传 props（tooltip 启用时生效） */
  tooltipProps?: Omit<TooltipProps, 'text'>
  /**
   * 全局单元格文本溢出截断，传函数可按 cell 上下文动态决定
   * - true = 单行截断
   * - number > 1 = 多行截断行数
   * - false = 禁用
   * - 函数 = 按 cell 上下文动态决定
   * @defaultValue true
   */
  truncate?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  /**
   * 排序配置
   * @defaultValue `{ enableSorting: !!sortable }`
   */
  sortingOptions?: TableProps<T>['sortingOptions']
  /**
   * 列尺寸配置
   * @defaultValue `{ enableColumnResizing: !!resizable, columnResizeMode }`
   */
  columnSizingOptions?: TableProps<T>['columnSizingOptions']
  /**
   * 列固定配置
   * @defaultValue `{ enableColumnPinning: !!pinable }`
   */
  columnPinningOptions?: TableProps<T>['columnPinningOptions']
  /**
   * 行选择配置
   * @defaultValue `{ enableMultiRowSelection: true }`
   */
  rowSelectionOptions?: TableProps<T>['rowSelectionOptions']
  /**
   * 子行字段名，设置后启用树形模式
   * @example 'children'
   */
  childrenKey?: Suggest<keyof T & string>
  /**
   * 树形缩进宽度，传函数可按行/深度动态计算
   * - number = 每层缩进量（px），乘以 depth 得到实际 marginLeft
   * - string = 直接作为 CSS 值（调用方自行处理深度逻辑）
   * - 函数 = 按 cell 上下文动态计算，返回 CSS 字符串（如 '24px'）
   * @defaultValue '1rem'
   */
  indentSize?: number | string | ((ctx: CellContext<T, unknown>) => string)
  /** 展开行配置 */
  expandedOptions?: TableProps<T>['expandedOptions']
  /** 行选择回调 */
  onSelect?: TableProps<T>['onSelect']
  /**
   * 点击行时切换树形展开状态
   * @defaultValue false
   */
  expandOnRowClick?: boolean
  /**
   * 点击行时切换行选择状态
   * @defaultValue false
   */
  selectOnRowClick?: boolean
  /** 数组形可见列白名单 */
  columnVisibilityKeys?: string[]
  /** 数组形隐藏列黑名单，与 columnVisibilityKeys 互斥，同时传入时 columnVisibilityKeys 优先 */
  columnVisibilityExcludeKeys?: string[]
  /** 数组形选中行 id 列表 */
  rowSelectionKeys?: string[]
  /** 数组形展开行 id 列表 */
  expandedKeys?: string[]
  /**
   * 分页配置，直接透传给 TanStack / UTable
   * - 客户端分页：默认注入 `getPaginationRowModel()`
   * - 服务端分页：设置 `manualPagination: true`，并提供 `rowCount` 或 `pageCount`
   */
  paginationOptions?: TableProps<T>['paginationOptions']
  paginationUi?: DataTablePaginationUi
  ui?: DataTable['slots']
}
</script>

<script lang="ts" setup generic="T extends TableData">
import { getPaginationRowModel } from '@tanstack/vue-table'
import { UTable } from '#components'
import { useAppConfig } from '#imports'
import type { Ref, WritableComputedRef } from 'vue'
import { computed, onMounted, useAttrs, useTemplateRef, watch } from 'vue'
import { useExtendedTv } from '../utils/extend-theme'
import { resolveColumns } from '../domains/data-table/columns/resolve-columns'
import { resolveCallbackValue } from '../domains/data-table/columns/utils'
import { computeTreeRowSelection } from '../domains/data-table/tree-selection'
import DataTablePagination, { type DataTablePaginationUi } from './data-table-renderer/DataTableRendererPagination.vue'

const DEFAULT_PAGE_SIZE = 10

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
const appConfig = useAppConfig() as DataTable['AppConfig']
const tableRef = useTemplateRef<{
  tableApi: Table<T>
  tableRef: HTMLTableElement | null
}>('tableRef')

const isTreeMode = computed(() => Boolean(props.childrenKey))
const isManualPagination = computed(() => props.paginationOptions?.manualPagination === true)

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

const { baseUi, ui } = useExtendedTv(
  tableTheme,
  theme,
  () => appConfig.movk?.dataTable,
  () => ({
    ui: props.ui,
    variants: {
      fitContent: !!props.fitContent,
      bordered: !!props.bordered,
      striped: !!props.stripe,
      tree: isTreeMode.value
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

const selectedCount = computed(() => {
  if (rowSelectionKeysState.value !== undefined) return rowSelectionKeysState.value.length
  return Object.keys(rowSelectionState.value ?? {}).length
})

const paginationView = computed(() => {
  const api = tableApi.value
  if (!api) return null

  const manual = isManualPagination.value
  const explicitRowCount = props.paginationOptions?.rowCount
  const explicitPageCount = props.paginationOptions?.pageCount
  const pagination = api.getState().pagination
  const pageIndex = pagination?.pageIndex ?? 0
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
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

defineExpose({
  tableRef: computed(() => tableRef.value?.tableRef ?? null),
  tableApi,
  clearSelection,
  treeSelection
})
</script>

<template>
  <div :class="ui.root">
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
