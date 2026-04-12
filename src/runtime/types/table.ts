import type { ButtonProps, PaginationProps, TableProps, TooltipProps } from '@nuxt/ui'
import type {
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  RowPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState
} from '@tanstack/vue-table'

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

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

export interface DataTableDataColumn<T> extends DataTableBaseColumn {
  /** 对应行数据的 key */
  key: keyof T & string
  /** 启用排序 */
  sortable?: boolean
  /** 允许通过表头交互切换列固定（left -> right -> none） */
  pinable?: boolean
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
  /** UTooltip 额外 props 透传（tooltip 启用时生效） */
  tooltipProps?: Omit<TooltipProps, 'text'>
  /** TanStack ColumnDef 透传（逃生舱） */
  _raw?: Partial<ColumnDef<T, unknown>>
}

export interface DataTableGroupColumn<T> extends DataTableBaseColumn {
  /** 子列 */
  children: (DataTableDataColumn<T> | DataTableGroupColumn<T>)[]
}

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

export interface DataTableRowPinningColumn {
  type: 'row-pinning'
  fixed?: 'left' | 'right'
  /** 列宽，默认 48 */
  size?: number
  /** 默认 pin 到 top，可选 bottom */
  position?: 'top' | 'bottom'
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

export interface DataTableAction<T> {
  label: string
  icon?: string
  color?: ButtonProps['color']
  /** 点击回调 */
  onClick: (row: T, index: number) => void
  /** 动态禁用 */
  disabled?: boolean | ((row: T) => boolean)
  /** 动态隐藏 */
  hidden?: boolean | ((row: T) => boolean)
  /** 需要确认（字符串为简单确认文案，对象可自定义标题/描述） */
  confirm?: string | { title: string, description?: string }
}

export type DataTableColumn<T>
  = | DataTableDataColumn<T>
    | DataTableGroupColumn<T>
    | DataTableSelectionColumn
    | DataTableIndexColumn
    | DataTableExpandColumn
    | DataTableRowPinningColumn
    | DataTableActionsColumn<T>

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
  | DataTableRowPinningColumn
  | DataTableActionsColumn<T> {
  return 'type' in col
}

export interface ResolvedColumnState<T> {
  columnDefs: ColumnDef<T, unknown>[]
  initialPinning: ColumnPinningState
  initialVisibility: VisibilityState
  initialSizing: ColumnSizingState
}

export type DataTablePaginationPassthrough = Partial<
  Omit<PaginationProps, 'total' | 'page' | 'itemsPerPage'>
>

type DataTableInheritedTableProps<T extends Record<string, unknown>> = Pick<
  TableProps<T>,
  'loading' | 'empty' | 'sticky' | 'virtualize' | 'ui'
>

export interface DataTableProps<T extends Record<string, unknown>> extends DataTableInheritedTableProps<T> {
  /** 数据源 */
  data: T[]
  /** 列定义（MDataTable 增强格式） */
  columns: DataTableColumn<T>[]
  /** 行唯一标识字段 */
  rowKey?: keyof T & string
  /** 斑马纹 */
  stripe?: boolean
  /** 斑马纹 class（stripe = true 时生效） */
  stripeClass?: string
  /** 边框 */
  bordered?: boolean
  /** 启用列拖拽调整宽度 */
  resizable?: boolean
  /** 全局启用数据列 pin 按钮，列级 pinable 可覆盖 */
  pinable?: boolean
  /** 空值占位符，null/undefined/'' 时显示 */
  emptyCell?: string | false
  /** 行条件 class（支持静态字符串或回调） */
  rowClass?: string | ((row: T) => string)
  /** 行条件 style（支持静态对象/字符串或回调） */
  rowStyle?: string | Record<string, string> | ((row: T) => string | Record<string, string>)
  /** 子行字段名，设置后启用树形模式 */
  childrenKey?: keyof T & string
  /** 默认展开所有行 */
  defaultExpandAll?: boolean
  /** 树形缩进宽度（px） */
  indentSize?: number
  /** 点击行时切换树形展开状态 */
  expandOnRowClick?: boolean
  /** 总条数，大于 0 时自动显示分页 */
  total?: number
  /** 当前页（v-model:page） */
  page?: number
  /** 每页条数（v-model:pageSize） */
  pageSize?: number
  /** 可选每页条数列表 */
  pageSizes?: number[]
  /** 是否显示分页，默认 total > 0 时自动显示 */
  showPagination?: boolean
  /** UPagination props 透传 */
  paginationProps?: DataTablePaginationPassthrough
  /** 全局数据列溢出 Tooltip，true = 单行截断，number = 多行截断 */
  tooltip?: boolean | number
  /** 全局 Tooltip 透传 props，列级 tooltipProps 可覆盖 */
  tooltipProps?: Omit<TooltipProps, 'text'>
  /** 全局数据列可排序，列级 sortable 可覆盖 */
  sortable?: boolean
  /** 显示列可见性切换按钮 */
  columnToggle?: boolean
  /** 数据刷新后是否保留已选行（默认 true） */
  preserveSelectionOnDataChange?: boolean
  /** 列固定状态（v-model:columnPinning） */
  columnPinning?: ColumnPinningState
  /** 列宽状态（v-model:columnSizing） */
  columnSizing?: ColumnSizingState
  /** 行固定状态（v-model:rowPinning） */
  rowPinning?: RowPinningState
  /** 启用滚动触底加载更多 */
  infiniteScroll?: boolean
  /** 触底阈值（px） */
  infiniteScrollDistance?: number
  /** 无限滚动容器高度（CSS 长度） */
  infiniteScrollHeight?: string
  /** 是否允许继续加载 */
  canLoadMore?: boolean
  /** 行点击回调 */
  onRowClick?: (row: T, index: number) => void
  /** 行右键回调 */
  onRowContextmenu?: (e: Event, row: T) => void
}

export interface DataTableExpose<T = unknown> {
  /** UTable 的 DOM 引用 */
  tableRef: HTMLTableElement | null
  /** TanStack Table 实例 */
  tableApi: import('@tanstack/vue-table').Table<T> | null
  /** 清空选择 */
  clearSelection: () => void
}

export type {
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  RowPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState
}
