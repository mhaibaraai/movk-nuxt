import type { ButtonProps, CheckboxProps, DropdownMenuProps, IconProps, ModalProps, TableColumn, TooltipProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { CellContext, ColumnDef, ColumnDefTemplate } from '@tanstack/vue-table'
import type { SemanticColor } from '../shared'
import type {
  DataTableCheckboxContext,
  DataTableExpandButtonContext,
  DataTablePinButtonContext,
  DataTableRowPinningButtonContext,
  DataTableSortButtonContext
} from './contexts'

export type DataTableDensityPreset = 'compact' | 'normal' | 'comfortable'

export type DataTableTreeSelectionStrategy = 'cascade' | 'isolated' | 'leaf'

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type DataTableDynamic<V, Ctx> = V | ((ctx: Ctx) => V)

interface DataTableBaseColumn {
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
  accessorKey: keyof T & string | (string & {})
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

interface DataTableActionConfirmProps extends OmitByKey<ModalProps, 'title' | 'open' | 'defaultOpen' | 'dismissible'> {
  title?: string
  type?: SemanticColor
  icon?: IconProps['name']
  dismissible?: boolean
  description?: string
  confirmText?: string
  cancelText?: string
  confirmButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
}

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

export function isDataColumn<T>(col: DataTableColumn<T>): col is DataTableDataColumn<T> {
  return 'accessorKey' in col && !('children' in col) && !('type' in col)
}

export function isGroupColumn<T>(col: DataTableColumn<T>): col is DataTableGroupColumn<T> {
  return 'children' in col && !('type' in col)
}

export interface TreeSelectionResult<T> {
  /** TanStack 原生语义：所有 selected=true 的行对象 */
  selected: T[]
  /** 只包含叶子节点（无子节点）且被勾选的行 */
  leaves: T[]
  /** 父节点且所有子孙叶子均已选中（「全选」的父） */
  parents: T[]
  /** 父节点且子孙叶子部分选中（indeterminate） */
  halfSelected: T[]
  /**
   * 严格被用户勾选：排除因父级联而带上的子节点。
   * - 'isolated' / 'leaf'：等价于 `selected`
   * - 'cascade'：若自身被选且父节点也在 selected 中，视为级联产物，剔除
   */
  strictlyChecked: T[]
}
