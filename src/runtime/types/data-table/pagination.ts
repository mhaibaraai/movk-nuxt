import type { PaginationProps, SelectProps, TableData } from '@nuxt/ui'
import type { PaginationState, RowData, Table } from '@tanstack/vue-table'
import type { ClassNameValue } from '../shared'

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

interface DataTablePaginationUiText {
  total?: string
  item?: string
  range?: string
  selected?: string
}

export interface DataTablePaginationUi {
  /**
   * 是否显示分页栏。
   * @defaultValue `pageCount > 1 || pageSizes.length > 1`
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
  text?: DataTablePaginationUiText
  ui?: Record<string, ClassNameValue>
}

export interface DataTablePaginationProps<TData extends RowData> {
  tableApi: Table<TData>
  pagination: PaginationState
  page: number
  rowCount: number
  pageCount: number
  from: number
  to: number
  selectedCount: number
  uiConfig?: DataTablePaginationUi
}

export interface DataTablePaginationSlots<TData extends RowData = RowData> {
  summary(props: {
    summaryText: string
    selectedText: string
    selectedCount: number
    rowCount: number
    from: number
    to: number
    page: number
    pageCount: number
    showSelectedCount: boolean
  }): unknown
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
  }): unknown
}

export type { TableData }
