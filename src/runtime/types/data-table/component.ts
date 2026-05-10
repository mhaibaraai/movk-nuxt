import type {
  CellContext,
  ColumnDefTemplate,
  ColumnMeta,
  Table,
  TableMeta,
  TableState,
  Updater
} from '@tanstack/vue-table'
import type { ButtonProps, TableData, TableProps, TableRow, TooltipProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type {
  DataTableActionButtonContext,
  DataTableColumn,
  DataTableDataColumn,
  DataTableDensityPreset,
  DataTableDynamic,
  TreeSelectionResult
} from './columns'
import type { DataTablePinButtonContext, DataTableSortButtonContext } from './contexts'
import type { DataTablePaginationUi } from './pagination'
import type { ClassNameValue } from '../shared'

export type DataTableSelectHandler<T extends TableData>
  = (e: Event, row: TableRow<T>) => void

export type DataTableHoverHandler<T extends TableData>
  = (e: Event, row: TableRow<T> | null) => void

export type DataTableContextmenuHandler<T extends TableData>
  = ((e: Event, row: TableRow<T>) => void) | ((e: Event, row: TableRow<T>) => void)[]

export type DataTableStateChangeHandler
  = (updater: Updater<TableState>) => void

export interface DataTableExposed<T extends TableData> {
  tableRef: HTMLTableElement | null
  tableApi: Table<T> | null
  /** UTable 根元素，即滚动容器 */
  el: HTMLElement | null
  scrollToTop: (options?: ScrollToOptions) => void
  clearSelection: () => void
  treeSelection: TreeSelectionResult<T>
}

export interface DataTableProps<T extends TableData> extends /* @vue-ignore */ OmitByKey<
  TableProps<T>,
  | 'columns'
  | 'meta'
  | 'sticky'
  | 'loading'
  | 'ui'
  | 'columnSizingOptions'
  | 'columnPinningOptions'
  | 'rowSelectionOptions'
  | 'sortingOptions'
  | 'expandedOptions'
  | 'paginationOptions'
  | 'onSelect'
  | 'onHover'
  | 'onContextmenu'
  | 'onStateChange'
> {
  /**
   * 行唯一标识字段，自动派生 getRowId；与 getRowId 同传时后者优先
   * @example 'id'
   */
  rowKey?: keyof T & string | (string & {})
  columns?: DataTableColumn<T>[]
  loading?: TableProps<T>['loading']
  /**
   * 斑马纹
   * @defaultValue false
   */
  stripe?: boolean
  /**
   * 纵向边框，传对象可定制 color/width/style
   * @defaultValue false
   */
  bordered?: boolean | {
    color?: string
    width?: string
    style?: 'solid' | 'dashed' | 'dotted' | 'double'
  }
  /**
   * 表格宽度由列宽内容决定（w-fit）
   * @defaultValue false
   */
  fitContent?: boolean
  /**
   * 空值占位符
   * @defaultValue '-'
   */
  emptyCell?: false | string | ColumnDefTemplate<CellContext<T, unknown>>
  /**
   * 启用列固定按钮，传函数可按列动态决定
   * @defaultValue false
   */
  pinable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  pinButtonProps?: DataTableDynamic<ButtonProps, DataTablePinButtonContext<T>>
  /**
   * 启用列排序，传函数可按列动态决定
   * @defaultValue false
   */
  sortable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  sortButtonProps?: DataTableDynamic<ButtonProps, DataTableSortButtonContext<T>>
  /** 全局 action 按钮 props，与列级 action.buttonProps 深度合并，列级优先 */
  actionButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
  /**
   * 行内最多展示多少 action 按钮，超出折叠到 overflow
   * @defaultValue 3
   */
  actionsMaxInline?: number
  actionsOverflowTrigger?: DataTableDynamic<ButtonProps, CellContext<T, unknown>>
  /**
   * 启用列宽拖拽，传函数可按列动态决定
   * @defaultValue false
   */
  resizable?: boolean | ((col: DataTableDataColumn<T>) => boolean)
  /**
   * - 'onChange' 拖动中实时重排
   * - 'onEnd' 释放后才更新
   * @defaultValue 'onChange'
   */
  columnResizeMode?: 'onChange' | 'onEnd'
  /** 单元格内边距密度 */
  density?: DataTableDensityPreset | ColumnMeta<T, unknown>['class']
  meta?: TableMeta<T>
  rowClass?: string | ((row: T) => string)
  rowStyle?: string | Record<string, string> | ((row: T) => string | Record<string, string>)
  /**
   * 单元格溢出 Tooltip：true 单行 / number 多行 / false 禁用 / 函数 动态
   * @defaultValue false
   */
  tooltip?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  tooltipProps?: Omit<TooltipProps, 'text'>
  /**
   * 单元格文本截断：true 单行 / number 多行 / false 禁用 / 函数 动态
   * @defaultValue true
   */
  truncate?: boolean | number | ((ctx: CellContext<T, unknown>) => boolean | number)
  sortingOptions?: TableProps<T>['sortingOptions']
  columnSizingOptions?: TableProps<T>['columnSizingOptions']
  columnPinningOptions?: TableProps<T>['columnPinningOptions']
  rowSelectionOptions?: TableProps<T>['rowSelectionOptions']
  /**
   * 子行字段名，设置后启用树形模式
   * @example 'children'
   */
  childrenKey?: keyof T & string | (string & {})
  /**
   * 树形缩进：number 每层缩进 px / string CSS 值 / 函数 动态返回 CSS
   * @defaultValue '1rem'
   */
  indentSize?: number | string | ((ctx: CellContext<T, unknown>) => string)
  expandedOptions?: TableProps<T>['expandedOptions']
  /** @defaultValue false */
  expandOnRowClick?: boolean
  /** @defaultValue false */
  selectOnRowClick?: boolean
  /** 可见列白名单（数组形） */
  columnVisibilityKeys?: string[]
  /** 隐藏列黑名单（数组形），与 columnVisibilityKeys 互斥，同传时白名单优先 */
  columnVisibilityExcludeKeys?: string[]
  /** 选中行 id 列表（数组形） */
  rowSelectionKeys?: string[]
  /** 展开行 id 列表（数组形） */
  expandedKeys?: string[]
  onSelect?: DataTableSelectHandler<T>
  onHover?: DataTableHoverHandler<T>
  onRowContextmenu?: DataTableContextmenuHandler<T>
  onStateChange?: DataTableStateChangeHandler
  /**
   * 分页配置，透传给 TanStack / UTable
   * - 客户端分页：传入即启用，自动注入 getPaginationRowModel
   * - 服务端分页：manualPagination=true 并提供 rowCount 或 pageCount
   */
  paginationOptions?: TableProps<T>['paginationOptions']
  /**
   * 粘性表头
   * @defaultValue true
   */
  sticky?: TableProps<T>['sticky']
  paginationUi?: DataTablePaginationUi
  /**
   * 触底加载回调，传入即启用无限滚动模式（自动隐藏内置分页、async 期间派生 loading）
   */
  loadMore?: () => void | Promise<void>
  /**
   * 是否还能加载更多
   * @defaultValue true
   */
  canLoadMore?: boolean
  /**
   * 触发 loadMore 的距底像素阈值
   * @defaultValue 100
   */
  loadMoreDistance?: number
  /**
   * mount 后立即触发一次 loadMore
   * @defaultValue false
   */
  loadMoreImmediate?: boolean
  ui?: Record<string, ClassNameValue>
}
