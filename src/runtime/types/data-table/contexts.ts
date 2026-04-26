import type { CellContext, HeaderContext } from '@tanstack/vue-table'

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
