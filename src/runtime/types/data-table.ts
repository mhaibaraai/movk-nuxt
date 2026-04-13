import type { ButtonProps, IconProps, PopoverProps, TableColumn, TableData, TableProps, TooltipProps } from '@nuxt/ui'
import type { OmitByKey, Suggest } from '@movk/core'
import type { CellContext, ColumnDef, ColumnDefTemplate, ColumnPinningState, ColumnSizingState, RowPinningState, TableMeta, VisibilityState } from '@tanstack/vue-table'

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DataTableBorderedOptions {
  /** 边框颜色，支持 CSS 颜色值或 CSS var，默认 var(--ui-border) */
  color?: string
  /** 边框宽度，默认 '1px' */
  width?: string
  /** 边框样式，默认 'solid' */
  style?: 'solid' | 'dashed' | 'dotted' | 'double'
}

export interface DataTableBaseColumn {
  /** 列头文本 */
  header: string
  /** 固定到左/右侧 */
  fixed?: 'left' | 'right'
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 列宽，支持数值或预设 */
  size?: number | DataTableSizePreset
  /** 最小宽度 */
  minSize?: number
  /** 最大宽度 */
  maxSize?: number
  /**
   * 单元格文本溢出截断，优先级高于全局 truncate
   * - true = 单行截断
   * - number > 1 = 多行截断行数
   * - false = 禁用截断
   */
  truncate?: boolean | number
}

export interface DataTableDataColumn<T> extends DataTableBaseColumn {
  /** 数据字段键 */
  accessorKey: keyof T & string
  /**
   * 默认是否可见
   * @defaultValue true
   */
  visibility?: boolean
  /** 启用排序，优先级高于全局 sortable */
  sortable?: boolean
  /** 允许通过表头交互切换列固定（left -> right -> none），优先级高于全局 pinable */
  pinable?: boolean
  /** 是否可拖拽调整宽度，优先级高于全局 resizable */
  resizable?: boolean
  /** 空值占位文本，false 禁用 */
  emptyCell?: string | false
  /**
   * 溢出 Tooltip，优先级高于全局 tooltip
   * - true = 溢出时单行显示
   * - number = 溢出时多行显示（行数）
   * - false = 禁用
   * - 函数 = 按 cell 上下文动态决定
   */
  tooltip?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  /** UTooltip 额外 props 透传（tooltip 启用时生效） */
  tooltipProps?: TooltipProps
  /** 单元格自定义渲染，string 直接显示，函数接收 CellContext */
  cell?: TableColumn<T>['cell']
  /** TanStack ColumnDef 透传（逃生舱） */
  _raw?: Partial<ColumnDef<T, unknown>>
}

export interface DataTableGroupColumn<T> extends DataTableBaseColumn {
  /** 分组子列，设置后作为分组表头 */
  children: (DataTableDataColumn<T> | DataTableGroupColumn<T>)[]
}

export interface DataTableSelectionColumn {
  /** 选择列，显示复选框/单选框用于行选择 */
  type: 'selection'
  /**
   * 单选/多选
   * @defaultValue 'multiple'
   */
  mode?: 'single' | 'multiple'
  fixed?: 'left' | 'right'
  /**
   * 列宽
   * @defaultValue 48
   */
  size?: number
}

export interface DataTableIndexColumn {
  /** 索引列，显示行索引 */
  type: 'index'
  /**
   * 表头文本
   * @defaultValue '#'
   */
  header?: string
  fixed?: 'left' | 'right'
  /**
   * 列宽
   * @defaultValue 60
   */
  size?: number
}

export interface DataTableExpandColumn {
  /** 展开列，显示展开图标用于树形表格 */
  type: 'expand'
  fixed?: 'left' | 'right'
  /**
   * 列宽
   * @defaultValue 48
   */
  size?: number
}

export interface DataTableRowPinningColumn {
  /** 行固定列，显示图标用于行固定 */
  type: 'row-pinning'
  fixed?: 'left' | 'right'
  /**
   * 列宽
   * @defaultValue 48
   */
  size?: number
  /**
   * 行固定位置
   * @defaultValue 'top'
   */
  position?: 'top' | 'bottom'
}

export interface DataTableActionsColumn<T> {
  /** 操作列，显示操作按钮 */
  type: 'actions'
  /**
   * 表头文本
   * @defaultValue '操作'
   */
  header?: string
  fixed?: 'left' | 'right'
  /** 列宽 */
  size?: number
  /** 操作按钮列表 */
  actions: DataTableAction<T>[] | ((row: T) => DataTableAction<T>[])
}

export interface DataTableAction<T> extends OmitByKey<ButtonProps, 'onClick' | 'disabled'> {
  /** 是否可见 */
  visibility?: boolean | ((row: T) => boolean)
  /** 是否禁用 */
  disabled?: boolean | ((row: T) => boolean)
  /** 点击回调 */
  onClick: (row: T, index: number) => void
  /** 需要确认 */
  popover?: boolean
  /** 确认弹窗 props（popover = true 时生效） */
  popoverProps?: PopoverProps & {
    /**
     * 弹窗标题
     * @defaultValue '确认操作'
     */
    title?: string
    /**
     * 弹窗描述
     * @defaultValue '请确认是否执行此操作'
     */
    description?: string
    /**
     * 弹窗图标
     * @defaultValue 'i-lucide-circle-question-mark'
     */
    icon?: IconProps['name']
    /**
     * 取消按钮
     * @defaultValue '取消'
     */
    cancelButton?: string | ButtonProps
    /**
     * 确认按钮
     * @defaultValue '确定'
     */
    confirmButton?: string | ButtonProps
  }
}

export type DataTableColumn<T>
  = | DataTableDataColumn<T>
    | DataTableGroupColumn<T>
    | DataTableSelectionColumn
    | DataTableIndexColumn
    | DataTableExpandColumn
    | DataTableRowPinningColumn
    | DataTableActionsColumn<T>
    | TableColumn<T>

type DataTableInheritedTableProps<T extends TableData> = OmitByKey<
  TableProps<T>,
  'columns' | 'meta' | 'ui'
>

export interface DataTableProps<T extends TableData> extends /* @vue-ignore */ DataTableInheritedTableProps<T> {
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
   * 固定表格布局（table-layout: fixed），启用后列宽严格按 size 分配
   * @defaultValue true
   */
  fixedLayout?: boolean
  /**
   * 全局启用数据列 pin 按钮，传函数可按列定义动态决定
   * @defaultValue false
   */
  pinable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /**
   * 全局数据列可排序，传函数可按列定义动态决定
   * @defaultValue false
   */
  sortable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /**
   * 空值占位符，null/undefined/'' 时显示
   * @defaultValue '-'
   */
  emptyCell?: false | string | ColumnDefTemplate<CellContext<T, unknown>>
  /**
   * 启用列拖拽调整宽度，传函数可按列定义动态决定
   * @defaultValue false
   */
  resizable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /** 表格元数据 */
  meta?: TableMeta<T>
  /** 行条件 class */
  rowClass?: NonNullable<TableMeta<T>['class']>['tr']
  /** 行条件 style */
  rowStyle?: NonNullable<TableMeta<T>['style']>['tr']
  /** 子行字段名，设置后启用树形模式 */
  childrenKey?: Suggest<keyof T & string>
  /**
   * 默认展开所有行
   * @defaultValue false
   */
  defaultExpandAll?: boolean
  /**
   * 树形缩进宽度，传函数可按行/深度动态计算
   * - number = 每层缩进量（px），乘以 depth 得到实际 marginLeft
   * - string = 直接作为 CSS 值（调用方自行处理深度逻辑）
   * - 函数 = 按 cell 上下文动态计算，返回 CSS 字符串（如 '24px'）
   * @defaultValue '1rem'
   */
  indentSize?: number | string | ((ctx: CellContext<T, unknown>) => string)
  /**
   * 点击行时切换树形展开状态
   * @defaultValue false
   */
  expandOnRowClick?: boolean
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

  /** 列固定状态（v-model:columnPinning） */
  columnPinning?: ColumnPinningState
  /** 列宽状态（v-model:columnSizing） */
  columnSizing?: ColumnSizingState
  /** 行固定状态（v-model:rowPinning） */
  rowPinning?: RowPinningState

  // /** 总条数，不传时根据 data.length 计算；大于每页条数时自动显示分页 */
  // total?: number
  // /** 当前页（v-model:page） */
  // page?: number
  // /**
  //  * 每页条数（v-model:pageSize）
  //  * @defaultValue 20
  //  */
  // pageSize?: number
  // /**
  //  * 可选每页条数列表，长度大于 1 时显示切换器
  //  * @defaultValue []
  //  */
  // pageSizes?: number[]
  // /** 是否显示分页，默认 total > pageSize 时自动显示 */
  // showPagination?: boolean
  // /** UPagination props 透传 */
  // paginationProps?: DataTablePaginationPassthrough
  // /**
  //  * 显示列可见性切换按钮
  //  * @defaultValue false
  //  */
  // columnToggle?: boolean
  // /**
  //  * 数据刷新后是否保留已选行
  //  * @defaultValue true
  //  */
  // preserveSelectionOnDataChange?: boolean
  // /**
  //  * 启用滚动触底加载更多
  //  * @defaultValue false
  //  */
  // infiniteScroll?: boolean
  // /**
  //  * 触底阈值（px）
  //  * @defaultValue 120
  //  */
  // infiniteScrollDistance?: number
  // /**
  //  * 无限滚动容器高度（CSS 长度）
  //  * @defaultValue '480px'
  //  */
  // infiniteScrollHeight?: string
  // /**
  //  * 是否允许继续加载
  //  * @defaultValue true
  //  */
  // canLoadMore?: boolean
  // /** 行点击回调 */
  // onRowClick?: (row: T, index: number) => void
  // /** 行右键回调 */
  // onRowContextmenu?: (e: Event, row: T) => void

  /** 表格 UI 配置 */
  ui?: TableProps<T>['ui']
}

// export function isSpecialColumn<T>(col: DataTableColumn<T>): col is
//   | DataTableSelectionColumn
//   | DataTableIndexColumn
//   | DataTableExpandColumn
//   | DataTableActionsColumn<T> {
//   return 'type' in col
// }

export interface ResolvedColumnState<T> {
  columnDefs: ColumnDef<T, unknown>[]
  initialPinning: ColumnPinningState
  initialVisibility: VisibilityState
  initialSizing: ColumnSizingState
}

// export type DataTablePaginationPassthrough = Partial<
//   Omit<PaginationProps, 'total' | 'page' | 'itemsPerPage'>
// >

export interface DataTableExpose<T = unknown> {
  /** UTable 的 DOM 引用 */
  tableRef: HTMLTableElement | null
  /** TanStack Table 实例 */
  tableApi: import('@tanstack/vue-table').Table<T> | null
  /** 清空选择 */
  clearSelection: () => void
}

export function isDataColumn<T>(col: DataTableColumn<T>): col is DataTableDataColumn<T> {
  return 'accessorKey' in col && !('children' in col) && !('type' in col)
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
