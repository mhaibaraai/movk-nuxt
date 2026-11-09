import type { TableData, TableFeatures } from '@nuxt/ui'
import type { CellContext, ColumnPinningPosition, HeaderContext } from '@tanstack/vue-table'

/** 排序按钮回调上下文 */
export interface DataTableSortButtonContext<T extends TableData> {
  isSorted: 'asc' | 'desc' | false
  headerContext: HeaderContext<TableFeatures, T, unknown>
}

/** 列固定按钮回调上下文 */
export interface DataTablePinButtonContext<T extends TableData> {
  pinned: ColumnPinningPosition
  headerContext: HeaderContext<TableFeatures, T, unknown>
}

/** 选择列复选框回调上下文（表头 / 单元格共用，用 scope 区分） */
export type DataTableCheckboxContext<T extends TableData>
  = | {
    scope: 'header'
    headerContext: HeaderContext<TableFeatures, T, unknown>
    isAllSelected: boolean
    isIndeterminate: boolean
  }
  | {
    scope: 'cell'
    cellContext: CellContext<TableFeatures, T, unknown>
    isSelected: boolean
    isIndeterminate: boolean
    /** 是否为 leaf 策略下派生态的只读父行 */
    isLeafAggregate: boolean
  }

/** 展开列按钮回调上下文 */
export interface DataTableExpandButtonContext<T extends TableData> {
  cellContext: CellContext<TableFeatures, T, unknown>
  isExpanded: boolean
  depth: number
  canExpand: boolean
}

/** 展开列表头「全部展开/收起」按钮回调上下文 */
export interface DataTableExpandToggleAllContext<T extends TableData> {
  headerContext: HeaderContext<TableFeatures, T, unknown>
  isAllExpanded: boolean
  isSomeExpanded: boolean
}

/** 行固定列按钮回调上下文 */
export interface DataTableRowPinningButtonContext<T extends TableData> {
  cellContext: CellContext<TableFeatures, T, unknown>
  pinned: 'top' | 'bottom' | false
  position: 'top' | 'bottom'
}
