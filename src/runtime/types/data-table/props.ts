import type { ButtonProps, TableData, TableProps, TooltipProps } from '@nuxt/ui'
import type { OmitByKey, Suggest } from '@movk/core'
import type { CellContext, ColumnDefTemplate, TableMeta } from '@tanstack/vue-table'
import type {
  DataTableColumn,
  DataTableDataColumn,
  DataTableActionButtonContext
} from './columns'
import type {
  DataTablePinButtonContext,
  DataTableSortButtonContext
} from './contexts'
import type { DataTablePaginationUi } from './pagination'
import type { DataTableDynamic } from './table'

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
  ui?: TableProps<T>['ui']
}
