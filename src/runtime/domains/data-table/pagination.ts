import type { RowData, Table } from '@tanstack/vue-table'

export interface PaginationViewOptions {
  manual: boolean
  /** 手动分页时的总行数，未知时为 undefined */
  rowCount?: number
  /** 手动分页时的总页数，缺省时由 rowCount 推导 */
  pageCount?: number
  show?: boolean
  pageSizes?: number[]
}

export interface PaginationView<T extends RowData> {
  tableApi: Table<T>
  pagination: { pageIndex: number, pageSize: number }
  page: number
  rowCount: number
  rowCountKnown: boolean
  pageCount: number
  currentPageRowCount: number
  from: number
  to: number
  show: boolean
  setPage: (page: number) => void
  setPageSize: (pageSize: unknown) => void
}

/** 由 TanStack 实例与分页配置推导分页栏展示所需的全部数据 */
export function buildPaginationView<T extends RowData>(api: Table<T>, options: PaginationViewOptions): PaginationView<T> {
  const { manual } = options
  const rowCountKnown = !manual || options.rowCount !== undefined
  const pagination = api.getState().pagination
  const pageIndex = pagination?.pageIndex ?? 0
  const pageSize = pagination?.pageSize ?? 10
  const currentPageRowCount = api.getRowModel().rows.length

  const fallbackManualPageCount = options.rowCount !== undefined
    ? Math.ceil(Math.max(0, options.rowCount) / pageSize)
    : api.getPageCount()
  const pageCount = manual
    ? Math.max(0, options.pageCount ?? fallbackManualPageCount)
    : api.getPageCount()

  const rowCount = rowCountKnown
    ? (manual ? Math.max(0, options.rowCount!) : api.getRowCount())
    : 0

  const referenceCount = rowCountKnown ? rowCount : pageCount * pageSize
  const hasRows = referenceCount > 0 && currentPageRowCount > 0
  const from = hasRows ? pageIndex * pageSize + 1 : 0
  const to = hasRows ? Math.min(referenceCount, from + currentPageRowCount - 1) : 0
  const show = options.show ?? (pageCount > 1 || (options.pageSizes?.length ?? 0) > 1)

  const setPage = (value: number) => {
    const nextPage = Math.floor(Number(value))
    if (!Number.isFinite(nextPage) || nextPage < 1) return
    const nextIndex = Math.min(Math.max(1, pageCount), nextPage) - 1
    api.setPagination(prev => ({ ...prev, pageIndex: nextIndex }))
  }

  const setPageSize = (value: unknown) => {
    if (value === '' || value == null) return
    const nextPageSize = Math.floor(Number(value))
    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return
    api.setPagination(prev => ({ ...prev, pageSize: nextPageSize }))
  }

  return {
    tableApi: api,
    pagination: { pageIndex, pageSize },
    page: pageIndex + 1,
    rowCount,
    rowCountKnown,
    pageCount,
    currentPageRowCount,
    from,
    to,
    show,
    setPage,
    setPageSize
  }
}
