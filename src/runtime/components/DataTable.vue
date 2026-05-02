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
import type { DataTableActionButtonContext, DataTableColumn, DataTableDataColumn, DataTableDensityPreset, DataTableDynamic, DataTablePaginationUi, DataTablePinButtonContext, DataTableSortButtonContext } from '../types/data-table'

type DataTable = ComponentConfig<typeof tableTheme & typeof theme, AppConfig, 'dataTable'>

interface DataTableBorderedOptions {
  /**
   * 边框颜色，支持 CSS 颜色值或 CSS var
   * @defaultValue 'var(--ui-border)'
   */
  color?: string
  /**
   * 边框宽度
   * @defaultValue '1px'
   */
  width?: string
  /**
   * 边框样式
   * @defaultValue 'solid'
   */
  style?: 'solid' | 'dashed' | 'dotted' | 'double'
}

type DataTableInheritedTableProps<T extends TableData> = OmitByKey<
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
>

export interface DataTableProps<T extends TableData> extends /* @vue-ignore */ DataTableInheritedTableProps<T> {
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
   * @defaultValue false
   */
  bordered?: boolean | DataTableBorderedOptions
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
   * 排序配置，默认：`{ enableSorting: !!sortable }`
   */
  sortingOptions?: TableProps<T>['sortingOptions']
  /**
   * 列尺寸配置， 默认：`{ enableColumnResizing: !!resizable, columnResizeMode }`
   */
  columnSizingOptions?: TableProps<T>['columnSizingOptions']
  /**
   * 列固定配置，默认：`{ enableColumnPinning: !!pinable }`
   */
  columnPinningOptions?: TableProps<T>['columnPinningOptions']
  /**
   * 行选择配置，默认：`{ enableMultiRowSelection: true }`
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
  /**
   * 分页栏展示配置，不承载分页状态
   */
  paginationUi?: DataTablePaginationUi
  /** 表格 UI 配置 */
  ui?: DataTable['ui']
}

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
</script>

<script lang="ts" setup generic="T extends TableData">
import { getPaginationRowModel } from '@tanstack/vue-table'
import { UTable } from '#components'
import { useAppConfig } from '#imports'
import { computed, useAttrs, useTemplateRef } from 'vue'
import { useExtendedTv } from '../utils/extend-theme'
import {
  resolveCallbackValue,
  resolveTableResetKey,
  useEffectiveModel,
  useSyncKeys
} from '../domains/data-table/state/models'
import {
  createPaginationSnapshot,
  expandedToKeys,
  keysToExpanded,
  resolvePaginationViewState
} from '../domains/data-table/state/pagination'
import {
  keysToRowSelection,
  resolveSelectedCount,
  rowSelectionToKeys
} from '../domains/data-table/state/selection'
import {
  keysToVisibility,
  keysToVisibilityExclude,
  visibilityToExcludeKeys,
  visibilityToKeys
} from '../domains/data-table/state/visibility'
import { resolveColumns } from '../domains/data-table/columns/resolve-columns'
import DataTablePagination from './data-table-renderer/DataTableRendererPagination.vue'

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
const appConfig = useAppConfig() as DataTable['AppConfig']
const tableRef = useTemplateRef<UTableExpose<T>>('tableRef')

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

const { baseUi, extraUi } = useExtendedTv(
  tableTheme,
  theme,
  () => appConfig.movk?.dataTable,
  () => ({ ui: props.ui, variants: { fitContent: !!props.fitContent } })
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
