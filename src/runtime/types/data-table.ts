import type { PaginationProps } from '@nuxt/ui'
import type {
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  RowSelectionState,
  SortingState,
  VisibilityState
} from '@tanstack/vue-table'

// ---------------------------------------------------------------------------
// Size Presets
// ---------------------------------------------------------------------------

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ---------------------------------------------------------------------------
// Base Column
// ---------------------------------------------------------------------------

export interface DataTableBaseColumn {
  /** 表头文本 */
  label?: string
  /** 固定到左/右侧 */
  fixed?: 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 列宽（TanStack size），支持数值或预设 */
  size?: number | DataTableSizePreset
  /** 最小宽度（TanStack minSize） */
  minSize?: number
  /** 最大宽度（TanStack maxSize） */
  maxSize?: number
}

// ---------------------------------------------------------------------------
// Data Column
// ---------------------------------------------------------------------------

export interface DataTableDataColumn<T> extends DataTableBaseColumn {
  /** 对应行数据的 key */
  key: keyof T & string
  /** 启用排序 */
  sortable?: boolean
  /** 溢出时自动显示 Tooltip。true = 单行截断，number = 多行截断行数 */
  tooltip?: boolean | number
  /** 默认是否可见 */
  visible?: boolean
  /** 是否可拖拽调整宽度，默认跟随全局 resizable */
  resizable?: boolean
  /** 单元格值格式化 */
  formatter?: (value: T[keyof T & string], row: T, index: number) => string
  /** 空值占位文本（覆盖全局 emptyCell），false 禁用 */
  emptyText?: string | false
  /** TanStack ColumnDef 透传（逃生舱） */
  _raw?: Partial<ColumnDef<T, unknown>>
}

// ---------------------------------------------------------------------------
// Group Column (Multi-level Header)
// ---------------------------------------------------------------------------

export interface DataTableGroupColumn<T> extends DataTableBaseColumn {
  /** 子列 */
  children: (DataTableDataColumn<T> | DataTableGroupColumn<T>)[]
}

// ---------------------------------------------------------------------------
// Special Columns
// ---------------------------------------------------------------------------

export interface DataTableSelectionColumn {
  type: 'selection'
  /** 单选/多选，默认 'multiple' */
  mode?: 'single' | 'multiple'
  fixed?: 'left' | 'right'
  /** 列宽，默认 48 */
  size?: number
}

export interface DataTableIndexColumn {
  type: 'index'
  /** 表头文本，默认 '#' */
  label?: string
  fixed?: 'left' | 'right'
  /** 列宽，默认 60 */
  size?: number
}

export interface DataTableExpandColumn {
  type: 'expand'
  fixed?: 'left' | 'right'
  /** 列宽，默认 48 */
  size?: number
}

export interface DataTableActionsColumn<T> {
  type: 'actions'
  /** 表头文本，默认 '操作' */
  label?: string
  fixed?: 'left' | 'right'
  /** 列宽 */
  size?: number
  /** 操作按钮列表 */
  actions: DataTableAction<T>[] | ((row: T) => DataTableAction<T>[])
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export interface DataTableAction<T> {
  label: string
  icon?: string
  color?: string
  /** 点击回调 */
  onClick: (row: T, index: number) => void
  /** 动态禁用 */
  disabled?: boolean | ((row: T) => boolean)
  /** 动态隐藏 */
  hidden?: boolean | ((row: T) => boolean)
  /** 需要确认（字符串为简单确认文案，对象可自定义标题/描述） */
  confirm?: string | { title: string, description?: string }
}

// ---------------------------------------------------------------------------
// Column Union
// ---------------------------------------------------------------------------

export type DataTableColumn<T>
  = | DataTableDataColumn<T>
    | DataTableGroupColumn<T>
    | DataTableSelectionColumn
    | DataTableIndexColumn
    | DataTableExpandColumn
    | DataTableActionsColumn<T>

// ---------------------------------------------------------------------------
// Column type guards
// ---------------------------------------------------------------------------

export function isDataColumn<T>(col: DataTableColumn<T>): col is DataTableDataColumn<T> {
  return 'key' in col && !('children' in col) && !('type' in col)
}

export function isGroupColumn<T>(col: DataTableColumn<T>): col is DataTableGroupColumn<T> {
  return 'children' in col && !('type' in col)
}

export function isSpecialColumn<T>(col: DataTableColumn<T>): col is
  | DataTableSelectionColumn
  | DataTableIndexColumn
  | DataTableExpandColumn
  | DataTableActionsColumn<T> {
  return 'type' in col
}

// ---------------------------------------------------------------------------
// Resolved Column State (output of column-helpers)
// ---------------------------------------------------------------------------

export interface ResolvedColumnState<T> {
  columnDefs: ColumnDef<T, unknown>[]
  initialPinning: ColumnPinningState
  initialVisibility: VisibilityState
  initialSizing: ColumnSizingState
}

// ---------------------------------------------------------------------------
// DataTable Pagination Props
// ---------------------------------------------------------------------------

export type DataTablePaginationPassthrough = Partial<
  Omit<PaginationProps, 'total' | 'page' | 'itemsPerPage'>
>

// ---------------------------------------------------------------------------
// DataTable Expose
// ---------------------------------------------------------------------------

export interface DataTableExpose<T = unknown> {
  /** UTable 的 DOM 引用 */
  tableRef: HTMLTableElement | null
  /** TanStack Table 实例 */
  tableApi: import('@tanstack/vue-table').Table<T> | null
  /** 清空选择 */
  clearSelection: () => void
}

// ---------------------------------------------------------------------------
// Re-export TanStack types used in public API
// ---------------------------------------------------------------------------

export type {
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  RowSelectionState,
  SortingState,
  VisibilityState
}
