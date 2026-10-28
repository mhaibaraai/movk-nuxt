import type { PaginationProps, SelectProps, TableData } from '@nuxt/ui'
import type { PaginationState, RowData, Table } from '@tanstack/vue-table'
import type { VNode } from 'vue'
import type { ClassNameValue } from '../shared'
import type { MovkMessages } from '../locale'

type DataTablePageSizeSelectProps = Omit<
  SelectProps<Array<{ label: string, value: number }>>,
  | 'items'
  | 'modelValue'
  | 'defaultValue'
  | 'multiple'
  | 'valueKey'
  | 'labelKey'
  | 'descriptionKey'
  | 'onUpdate:modelValue'
>

export interface DataTablePaginationUi {
  /**
   * 分页栏 UI 是否显示（仅在分页已启用时生效）。
   * 仅控 UI 显隐，不影响数据切片；
   * 若要完全关闭分页，请不要传入 `paginationOptions` / `v-model:pagination` / `pageSizes`。
   * @defaultValue 分页启用时为 `pageCount > 1 || pageSizes.length > 1`，否则为 `false`
   */
  show?: boolean
  /**
   * 可选每页条数列表，长度大于 1 时显示切换器
   * @defaultValue []
   */
  pageSizes?: number[]
  /**
   * 是否显示已选行数
   * @defaultValue true
   */
  showSelectedCount?: boolean
  /**
   * 是否显示当前页区间
   * @defaultValue true
   */
  showRowRange?: boolean
  paginationProps?: Omit<PaginationProps, 'page' | 'total' | 'itemsPerPage'>
  pageSizeSelectProps?: DataTablePageSizeSelectProps
  /**
   * 覆盖分页文案模板，支持占位符：`empty`、`total`（`{total}`）、`range`（`{from}` `{to}` `{total}`）、
   * `rangeUnknown`（`{from}` `{to}` `{page}` `{pageCount}`）、`selected`（`{count}`）、`pageSize`（`{size}`）。
   * 缺省时取 locale 的 `pagination.*`。
   */
  text?: Partial<MovkMessages['pagination']>
  ui?: Record<string, ClassNameValue>
}

export interface DataTablePaginationProps<TData extends RowData> {
  tableApi: Table<TData>
  pagination: PaginationState
  page: number
  rowCount: number
  rowCountKnown: boolean
  pageCount: number
  from: number
  to: number
  selectedCount: number
  setPage: (page: number) => void
  setPageSize: (pageSize: unknown) => void
  uiConfig?: DataTablePaginationUi
}

export interface DataTablePaginationSlots<TData extends RowData = RowData> {
  summary(props: {
    summaryText: string
    selectedText: string
    selectedCount: number
    rowCount: number
    rowCountKnown: boolean
    from: number
    to: number
    page: number
    pageCount: number
    showSelectedCount: boolean
  }): VNode[]
  actions(props: {
    tableApi: Table<TData>
    page: number
    pageCount: number
    pageSize: number
    rowCount: number
    pageSizes: number[]
    pageSizeOptions: { label: string, value: number }[]
    showPageSizeSelect: boolean
    setPage: (page: number) => void
    setPageSize: (pageSize: unknown) => void
  }): VNode[]
}

export type { TableData }
