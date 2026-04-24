import { describe, expect, it } from 'vitest'
import {
  createPaginationSnapshot,
  resolvePageSizeValue,
  resolvePaginationViewState
} from '../../../src/runtime/domains/data-table/state/pagination'

describe('data-table pagination state', () => {
  it('resolvePageSizeValue 只接受正整数', () => {
    expect(resolvePageSizeValue('20')).toBe(20)
    expect(resolvePageSizeValue(9.8)).toBe(9)
    expect(resolvePageSizeValue('')).toBeNull()
    expect(resolvePageSizeValue(0)).toBeNull()
    expect(resolvePageSizeValue('NaN')).toBeNull()
  })

  it('resolvePaginationViewState 生成分页展示区间与显示状态', () => {
    const viewState = resolvePaginationViewState(
      {
        pagination: { pageIndex: 1, pageSize: 10 },
        rowCount: 37,
        pageCount: 4,
        currentPageRowCount: 10
      },
      {
        pageSizes: [10, 20, 50]
      }
    )

    expect(viewState).toEqual({
      pagination: { pageIndex: 1, pageSize: 10 },
      page: 2,
      rowCount: 37,
      pageCount: 4,
      currentPageRowCount: 10,
      from: 11,
      to: 20,
      show: true
    })
  })

  it('createPaginationSnapshot 在 manualPagination 下优先使用显式总数', () => {
    const tableApi = {
      getState: () => ({ pagination: { pageIndex: 2, pageSize: 20 } }),
      getRowModel: () => ({ rows: Array.from({ length: 7 }).fill(null) }),
      getRowCount: () => 999,
      getPageCount: () => 999
    }

    const snapshot = createPaginationSnapshot(tableApi as never, {
      manualPagination: true,
      rowCount: 87
    })

    expect(snapshot).toEqual({
      pagination: { pageIndex: 2, pageSize: 20 },
      rowCount: 87,
      pageCount: 5,
      currentPageRowCount: 7
    })
  })
})
