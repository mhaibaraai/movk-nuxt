export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type DataTableDynamic<V, Ctx> = V | ((ctx: Ctx) => V)

export interface DataTableExpose<T = unknown> {
  /** UTable 的 DOM 引用 */
  tableRef: HTMLTableElement | null
  /** TanStack Table 实例 */
  tableApi: import('@tanstack/vue-table').Table<T> | null
  /** 清空选择 */
  clearSelection: () => void
}
