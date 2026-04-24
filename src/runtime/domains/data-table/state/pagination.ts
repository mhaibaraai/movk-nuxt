import type { ExpandedState, PaginationState } from '@tanstack/vue-table'
import type { TableData } from '@nuxt/ui'
import type { DataTablePaginationUi } from '../../../types/data-table'

const DEFAULT_PAGE_SIZE = 10

interface DataTablePaginationSnapshot {
  pagination?: Partial<PaginationState>
  rowCount: number
  pageCount: number
  currentPageRowCount: number
}

interface DataTablePaginationSnapshotOptions {
  manualPagination?: boolean
  rowCount?: number
  pageCount?: number
}

interface DataTablePaginationViewState {
  pagination: PaginationState
  page: number
  rowCount: number
  pageCount: number
  currentPageRowCount: number
  from: number
  to: number
  show: boolean
}

export function keysToExpanded(keys: string[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const key of keys) {
    state[key] = true
  }
  return state
}

export function expandedToKeys(state: ExpandedState): string[] {
  if (state === true) {
    console.warn('[DataTable] expandedKeys cannot represent expanded=true; use v-model:expanded for expand-all')
    return []
  }
  return Object.entries(state)
    .filter(([, expanded]) => expanded)
    .map(([key]) => key)
}

export function resolvePaginationViewState(
  snapshot: DataTablePaginationSnapshot,
  paginationUi?: DataTablePaginationUi
): DataTablePaginationViewState {
  const pageIndex = snapshot.pagination?.pageIndex ?? 0
  const pageSize = snapshot.pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const rowCount = Math.max(0, snapshot.rowCount)
  const currentPageRowCount = Math.max(0, snapshot.currentPageRowCount)
  const pageCount = Math.max(0, snapshot.pageCount)
  const from = rowCount > 0 && currentPageRowCount > 0
    ? pageIndex * pageSize + 1
    : 0
  const to = rowCount > 0 && currentPageRowCount > 0
    ? Math.min(rowCount, from + currentPageRowCount - 1)
    : 0

  return {
    pagination: {
      pageIndex,
      pageSize
    },
    page: pageIndex + 1,
    rowCount,
    pageCount,
    currentPageRowCount,
    from,
    to,
    show: paginationUi?.show ?? (pageCount > 1 || (paginationUi?.pageSizes?.length ?? 0) > 1)
  }
}

export function resolvePageSizeValue(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const pageSize = Math.floor(Number(value))

  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return null
  }

  return pageSize
}

export function createPaginationSnapshot<T extends TableData>(
  tableApi: import('@tanstack/vue-table').Table<T> | null,
  options?: DataTablePaginationSnapshotOptions
): DataTablePaginationSnapshot {
  if (!tableApi) {
    return {
      pagination: undefined,
      rowCount: Math.max(0, options?.rowCount ?? 0),
      pageCount: Math.max(0, options?.pageCount ?? 0),
      currentPageRowCount: 0
    }
  }

  const pagination = tableApi.getState().pagination
  const currentPageRowCount = tableApi.getRowModel().rows.length
  const fallbackRowCount = tableApi.getRowCount()
  const fallbackPageCount = tableApi.getPageCount()
  const explicitRowCount = options?.rowCount
  const explicitPageCount = options?.pageCount
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const rowCount = options?.manualPagination
    ? Math.max(0, explicitRowCount ?? fallbackRowCount)
    : fallbackRowCount
  const pageCount = options?.manualPagination
    ? Math.max(
        0,
        explicitPageCount
        ?? (explicitRowCount !== undefined ? Math.ceil(Math.max(0, explicitRowCount) / pageSize) : fallbackPageCount)
      )
    : fallbackPageCount

  return {
    pagination,
    rowCount,
    pageCount,
    currentPageRowCount
  }
}
