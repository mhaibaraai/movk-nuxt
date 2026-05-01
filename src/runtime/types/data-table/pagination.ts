import type { PaginationProps, SelectProps } from '@nuxt/ui'
import type { ClassNameValue } from '../shared'

export type DataTablePageSizeSelectProps = Omit<
  SelectProps<Array<{ label: string, value: number }>>,
  'items'
  | 'modelValue'
  | 'defaultValue'
  | 'multiple'
  | 'valueKey'
  | 'labelKey'
  | 'descriptionKey'
  | 'onUpdate:modelValue'
>

export interface DataTablePaginationUiSlots {
  root?: ClassNameValue
  summary?: ClassNameValue
  summaryText?: ClassNameValue
  selectedCount?: ClassNameValue
  actions?: ClassNameValue
  pageSizeSelect?: ClassNameValue
  pagination?: ClassNameValue
}

export interface DataTablePaginationUiText {
  total?: string
  item?: string
  range?: string
  selected?: string
}

export interface DataTablePaginationUi {
  /**
   * 是否显示分页栏。未传时按 `pageCount > 1 || pageSizes.length > 1` 自动判断
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
  /** UPagination 透传 props */
  paginationProps?: Partial<Omit<PaginationProps, 'page' | 'total' | 'itemsPerPage'>>
  /** USelect 透传 props */
  pageSizeSelectProps?: Partial<DataTablePageSizeSelectProps>
  /** 默认分页栏文案 */
  text?: DataTablePaginationUiText
  /** 分页栏本体的 slot 样式 */
  ui?: DataTablePaginationUiSlots
}
