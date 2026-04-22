import type { ButtonProps, CheckboxProps, DropdownMenuProps, TableColumn, TableData, TableProps, TooltipProps } from '@nuxt/ui'
import type { OmitByKey, Suggest } from '@movk/core'
import type { CellContext, ColumnDef, ColumnDefTemplate, ColumnPinningState, ColumnSizingState, HeaderContext, TableMeta, VisibilityState } from '@tanstack/vue-table'
import type { MessageBoxProps } from '../components/MessageBox.vue'

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 排序按钮回调上下文 */
export interface DataTableSortButtonContext<T> {
  isSorted: 'asc' | 'desc' | false
  headerContext: HeaderContext<T, unknown>
}

/** 列固定按钮回调上下文 */
export interface DataTablePinButtonContext<T> {
  pinned: 'left' | 'right' | false
  headerContext: HeaderContext<T, unknown>
}

/** 选择列复选框回调上下文（表头 / 单元格共用，用 scope 区分） */
export type DataTableCheckboxContext<T>
  = | {
    scope: 'header'
    headerContext: HeaderContext<T, unknown>
    isAllSelected: boolean
    isIndeterminate: boolean
  }
  | {
    scope: 'cell'
    cellContext: CellContext<T, unknown>
    isSelected: boolean
    isIndeterminate: boolean
    /** 是否为 leaf 策略下派生态的只读父行 */
    isLeafAggregate: boolean
  }

/** 展开列按钮回调上下文 */
export interface DataTableExpandButtonContext<T> {
  cellContext: CellContext<T, unknown>
  isExpanded: boolean
  depth: number
  canExpand: boolean
}

/** 行固定列按钮回调上下文 */
export interface DataTableRowPinningButtonContext<T> {
  cellContext: CellContext<T, unknown>
  pinned: 'top' | 'bottom' | false
  position: 'top' | 'bottom'
}

export type DataTableDynamic<V, Ctx> = V | ((ctx: Ctx) => V)

export type DataTableDensityPreset = 'compact' | 'normal' | 'comfortable'

export interface DataTableDensityOptions {
  /** td 的 Tailwind padding class，例如 'px-4 py-2' */
  td?: string
  /** th 的 Tailwind padding class */
  th?: string
}

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
}

export interface DataTableDataColumn<T> extends DataTableBaseColumn {
  /** 数据字段键 */
  accessorKey: Suggest<keyof T & string>
  /**
   * 默认是否可见
   * @defaultValue true
   */
  visibility?: boolean
  /** 允许通过表头交互切换列固定（left -> right -> none），优先级高于全局 pinable */
  pinable?: boolean
  /** 固定列按钮 props 透传，列级可覆盖全局 pinButtonProps */
  pinButtonProps?: DataTableDynamic<ButtonProps, DataTablePinButtonContext<T>>
  /** 启用排序，优先级高于全局 sortable */
  sortable?: boolean
  /** 排序按钮 props 透传，列级可覆盖全局 sortButtonProps */
  sortButtonProps?: DataTableDynamic<ButtonProps, DataTableSortButtonContext<T>>
  /** 是否可拖拽调整宽度，优先级高于全局 resizable */
  resizable?: boolean
  /**
   * 单元格文本溢出截断，优先级高于全局 truncate
   * - true = 单行截断
   * - number > 1 = 多行截断行数
   * - false = 禁用截断
   * - 函数 = 按 cell 上下文动态决定
   */
  truncate?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  /**
   * 空值占位，false 禁用，函数接收 CellContext 动态渲染
   * @defaultValue 继承全局 emptyCell
   */
  emptyCell?: string | false | ColumnDefTemplate<CellContext<T, unknown>>
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

export interface DataTableSpecialColumnBase<T = unknown> extends Omit<DataTableBaseColumn, 'header' | 'truncate'> {
  /**
   * 默认是否可见
   * @defaultValue true
   */
  visibility?: boolean
  /**
   * 允许通过表头交互切换列固定位置（left -> right -> none）
   * @defaultValue false
   */
  pinable?: boolean
  /**
   * 是否可拖拽调整宽度
   * @defaultValue false
   */
  resizable?: boolean
  /** 固定列按钮 props 透传，列级可覆盖全局 pinButtonProps */
  pinButtonProps?: DataTableDynamic<ButtonProps, DataTablePinButtonContext<T>>
  /** TanStack ColumnDef 透传（逃生舱） */
  _raw?: Partial<ColumnDef<any, unknown>>
}

/** @defaultValue size=48, fixed='left', align='center' */
export interface DataTableSelectionColumn<T = unknown> extends DataTableSpecialColumnBase<T> {
  /** 选择列，显示复选框/单选框用于行选择 */
  type: 'selection'
  /**
   * 单选/多选
   * @defaultValue 'multiple'
   */
  mode?: 'single' | 'multiple'
  /**
   * 树形勾选策略，仅在 childrenKey 启用时生效
   * - 'cascade'  父子级联（默认，=TanStack enableSubRowSelection: true）
   * - 'isolated' 父子独立勾选（=enableSubRowSelection: false）
   * - 'leaf'     仅叶子节点可勾选，父节点展示为子孙派生态（只读）
   * @defaultValue 'cascade'
   */
  strategy?: DataTableTreeSelectionStrategy
  /** 单选模式下的表头文本 */
  header?: string
  /** UCheckbox props 透传 */
  checkboxProps?: DataTableDynamic<CheckboxProps, DataTableCheckboxContext<T>>
}

export type DataTableTreeSelectionStrategy = 'cascade' | 'isolated' | 'leaf'

/** @defaultValue size=60, align='center' */
export interface DataTableIndexColumn<T = unknown> extends DataTableSpecialColumnBase<T> {
  /** 索引列，显示行索引 */
  type: 'index'
  /**
   * 表头文本
   * @defaultValue '#'
   */
  header?: string
}

/** @defaultValue size=48 */
export interface DataTableExpandColumn<T = unknown> extends DataTableSpecialColumnBase<T> {
  /** 展开列，显示展开图标用于树形表格 */
  type: 'expand'
  /** 展开/折叠按钮 props 透传 */
  buttonProps?: DataTableDynamic<ButtonProps, DataTableExpandButtonContext<T>>
}

/** @defaultValue size=48, fixed='left', align='center' */
export interface DataTableRowPinningColumn<T = unknown> extends DataTableSpecialColumnBase<T> {
  /** 行固定列，显示图标用于行固定 */
  type: 'row-pinning'
  /**
   * 行固定位置
   * @defaultValue 'top'
   */
  position?: 'top' | 'bottom'
  /**
   * 表头文本
   * @defaultValue '#'
   */
  header?: string
  /** 行固定/取消固定按钮 props 透传 */
  buttonProps?: DataTableDynamic<ButtonProps, DataTableRowPinningButtonContext<T>>
}

/** 操作按钮回调上下文 */
export interface DataTableActionButtonContext<T> {
  cellContext: CellContext<T, unknown>
  row: T
  index: number
  action: DataTableAction<T>
}

export type DataTableActionConfirmProps = OmitByKey<MessageBoxProps, 'mode'>

export interface DataTableAction<T> {
  /** 唯一 key，用于渲染稳定性与溢出菜单定位；未提供时回退到数组下标 */
  key?: string | number
  /** 按钮 props，支持整体回调按行动态计算 */
  buttonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
  /** 是否可见 */
  visibility?: boolean | ((ctx: DataTableActionButtonContext<T>) => boolean)
  /** 是否禁用（loading 中自动叠加） */
  disabled?: boolean | ((ctx: DataTableActionButtonContext<T>) => boolean)
  /** 点击回调，支持 async；返回 Promise 时自动维护 loading 状态 */
  onClick: (ctx: DataTableActionButtonContext<T>) => void | Promise<void>
  /** 触发前需要 MessageBox 确认 */
  confirm?: boolean
  /** 确认弹窗 props，支持回调 */
  confirmProps?: DataTableDynamic<DataTableActionConfirmProps, DataTableActionButtonContext<T>>
  /** 溢出菜单内在该项之前插入分隔线（仅 overflow 模式生效） */
  divider?: boolean
}

/** @defaultValue fixed='right' */
export interface DataTableActionsColumn<T = unknown> extends DataTableSpecialColumnBase<T> {
  /** 操作列，显示操作按钮 */
  type: 'actions'
  /**
   * 表头文本
   * @defaultValue '操作'
   */
  header?: string
  /** 操作按钮列表，支持整体回调 */
  actions: DataTableAction<T>[] | ((ctx: CellContext<T, unknown>) => DataTableAction<T>[])
  /**
   * 最多平铺的 action 数；超出部分收纳到 UDropdownMenu
   * @defaultValue 3
   */
  maxInline?: number
  /** 溢出触发按钮 props */
  overflowTrigger?: DataTableDynamic<ButtonProps, CellContext<T, unknown>>
  /** 溢出菜单透传 props（UDropdownMenu） */
  dropdownProps?: DataTableDynamic<Partial<DropdownMenuProps>, CellContext<T, unknown>>
  /** 容器 class，默认 'flex items-center gap-1' */
  wrapperClass?: string | ((ctx: CellContext<T, unknown>) => string)
}

export type DataTableColumn<T>
  = | DataTableDataColumn<T>
    | DataTableGroupColumn<T>
    | DataTableSelectionColumn<T>
    | DataTableIndexColumn<T>
    | DataTableExpandColumn<T>
    | DataTableRowPinningColumn<T>
    | DataTableActionsColumn<T>
    | TableColumn<T>

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
  | 'onSelect'
>

// @vue-ignore 的配置导致 DataTableInheritedTableProps 只会存在 attrs 中
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
   * - 'compact' / 'normal' / 'comfortable'
   * - 对象 = 自定义 Tailwind padding class（td / th 分别指定）
   */
  density?: DataTableDensityPreset | DataTableDensityOptions
  /** 表格元数据 */
  meta?: TableMeta<T>
  /** 行条件 class */
  rowClass?: NonNullable<TableMeta<T>['class']>['tr']
  /** 行条件 style */
  rowStyle?: NonNullable<TableMeta<T>['style']>['tr']
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
  /** 是否有任何列启用了列固定交互 */
  hasColumnPinning: boolean
  /** 是否有任何列启用了列宽拖拽 */
  hasColumnResizing: boolean
  /** 是否有任何列启用了排序 */
  hasColumnSort: boolean
  /** 是否存在 expand 列 */
  hasExpandColumn: boolean
  /** selection 列的选择模式，无 selection 列时为 undefined */
  selectionMode?: 'single' | 'multiple'
  /** 树形勾选策略，无 selection 列时为 undefined */
  selectionStrategy?: DataTableTreeSelectionStrategy
  /**
   * 是否启用 TanStack enableSubRowSelection。undefined = 不干预（TanStack 默认 true）。
   * 'isolated' / 'leaf' 策略会显式置为 false。
   */
  subRowSelection?: boolean
  /** 所有叶子列（data 列 + special 列）的 id 扁平列表，供可见性数组白名单使用 */
  allColumnIds: string[]
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
  | DataTableSelectionColumn<T>
  | DataTableIndexColumn<T>
  | DataTableExpandColumn<T>
  | DataTableRowPinningColumn<T>
  | DataTableActionsColumn<T> {
  return 'type' in col
}
