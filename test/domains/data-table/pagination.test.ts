import { describe, expect, it, vi } from 'vitest'
import type { Table } from '@tanstack/vue-table'
import { buildPaginationView } from '../../../src/runtime/domains/data-table/pagination'

function createApi(state: { pageIndex: number, pageSize: number }, rows: number, totals: { rowCount: number, pageCount: number }) {
  return {
    getState: () => ({ pagination: state }),
    getRowModel: () => ({ rows: Array.from({ length: rows }) }),
    getPageCount: () => totals.pageCount,
    getRowCount: () => totals.rowCount,
    setPagination: vi.fn()
  } as unknown as Table<unknown> & { setPagination: ReturnType<typeof vi.fn> }
}

describe('buildPaginationView', () => {
  it('客户端分页按 TanStack 计算区间', () => {
    const view = buildPaginationView(createApi({ pageIndex: 1, pageSize: 10 }, 10, { rowCount: 25, pageCount: 3 }), { manual: false })
    expect(view).toMatchObject({ page: 2, from: 11, to: 20, rowCount: 25, pageCount: 3, rowCountKnown: true, show: true })
  })

  it('手动分页由 rowCount 推导页数', () => {
    const view = buildPaginationView(createApi({ pageIndex: 0, pageSize: 10 }, 10, { rowCount: 0, pageCount: -1 }), { manual: true, rowCount: 42 })
    expect(view).toMatchObject({ pageCount: 5, rowCount: 42, from: 1, to: 10 })
  })

  it('手动分页未知总数时 rowCountKnown 为 false', () => {
    const view = buildPaginationView(createApi({ pageIndex: 2, pageSize: 10 }, 4, { rowCount: 0, pageCount: 0 }), { manual: true, pageCount: 3 })
    expect(view).toMatchObject({ rowCountKnown: false, from: 21, to: 24 })
  })

  it('setPage 截断越界页码，忽略非法输入', () => {
    const api = createApi({ pageIndex: 0, pageSize: 10 }, 10, { rowCount: 30, pageCount: 3 })
    const view = buildPaginationView(api, { manual: false })

    view.setPage(9)
    const update = api.setPagination.mock.calls[0]![0] as (prev: object) => object
    expect(update({ pageIndex: 0, pageSize: 10 })).toEqual({ pageIndex: 2, pageSize: 10 })

    view.setPage(0)
    view.setPageSize('')
    expect(api.setPagination).toHaveBeenCalledTimes(1)
  })

  it('仅一页且无每页条数切换时默认隐藏', () => {
    expect(buildPaginationView(createApi({ pageIndex: 0, pageSize: 10 }, 3, { rowCount: 3, pageCount: 1 }), { manual: false }).show).toBe(false)
  })
})
