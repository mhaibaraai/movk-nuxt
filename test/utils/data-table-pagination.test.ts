import { describe, expect, it, vi } from 'vitest'

vi.mock('vue', () => ({
  computed: (getter: () => unknown) => ({ value: getter() }),
  onMounted: () => {},
  watch: () => {}
}))

const {
  createPaginationSnapshot,
  resolvePageSizeValue,
  resolvePaginationViewState,
  resolveSelectedCount,
  resolveTableResetKey
} = await import('../../src/runtime/utils/data-table-utils')

describe('resolvePaginationViewState', () => {
  it('客户端分页：正确计算页码和可见区间', () => {
    const view = resolvePaginationViewState(
      {
        pagination: { pageIndex: 1, pageSize: 5 },
        rowCount: 23,
        pageCount: 5,
        currentPageRowCount: 5
      },
      {
        pageSizes: [5, 10]
      }
    )

    expect(view.page).toBe(2)
    expect(view.pagination).toEqual({ pageIndex: 1, pageSize: 5 })
    expect(view.from).toBe(6)
    expect(view.to).toBe(10)
    expect(view.show).toBe(true)
  })

  it('服务端分页：根据 rowCount 和 pageCount 计算摘要信息', () => {
    const view = resolvePaginationViewState(
      {
        pagination: { pageIndex: 2, pageSize: 10 },
        rowCount: 52,
        pageCount: 6,
        currentPageRowCount: 10
      },
      {
        pageSizes: [10]
      }
    )

    expect(view.page).toBe(3)
    expect(view.from).toBe(21)
    expect(view.to).toBe(30)
    expect(view.rowCount).toBe(52)
    expect(view.pageCount).toBe(6)
    expect(view.show).toBe(true)
  })

  it('单页且没有页大小切换时自动隐藏分页栏', () => {
    const view = resolvePaginationViewState(
      {
        pagination: { pageIndex: 0, pageSize: 10 },
        rowCount: 3,
        pageCount: 1,
        currentPageRowCount: 3
      },
      {}
    )

    expect(view.show).toBe(false)
  })

  it('显式 show 优先于自动判断', () => {
    const view = resolvePaginationViewState(
      {
        pagination: { pageIndex: 0, pageSize: 10 },
        rowCount: 3,
        pageCount: 1,
        currentPageRowCount: 3
      },
      {
        show: true
      }
    )

    expect(view.show).toBe(true)
  })
})

describe('resolveSelectedCount', () => {
  it('优先使用 rowSelectionKeys 计算已选数量', () => {
    expect(resolveSelectedCount(['1', '2'], { 1: true, 2: true, 3: true })).toBe(2)
  })

  it('没有 rowSelectionKeys 时回退到 rowSelectionState', () => {
    expect(resolveSelectedCount(undefined, { 1: true, 2: true })).toBe(2)
  })
})

describe('resolvePageSizeValue', () => {
  it('仅接受有效正整数', () => {
    expect(resolvePageSizeValue(20)).toBe(20)
    expect(resolvePageSizeValue('15')).toBe(15)
    expect(resolvePageSizeValue('20.8')).toBe(20)
  })

  it('忽略空值、非数字和非正整数', () => {
    expect(resolvePageSizeValue(undefined)).toBeNull()
    expect(resolvePageSizeValue('')).toBeNull()
    expect(resolvePageSizeValue('abc')).toBeNull()
    expect(resolvePageSizeValue(0)).toBeNull()
    expect(resolvePageSizeValue(-3)).toBeNull()
  })
})

describe('createPaginationSnapshot', () => {
  it('服务端分页优先使用显式 rowCount 并推导 pageCount', () => {
    const snapshot = createPaginationSnapshot({
      getState: () => ({
        pagination: {
          pageIndex: 0,
          pageSize: 5
        }
      }),
      getRowModel: () => ({
        rows: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      }),
      getRowCount: () => 5,
      getPageCount: () => 1
    }, {
      manualPagination: true,
      rowCount: 42
    })

    expect(snapshot.rowCount).toBe(42)
    expect(snapshot.pageCount).toBe(9)
    expect(snapshot.currentPageRowCount).toBe(5)
  })
})

describe('resolveTableResetKey', () => {
  it('将配置压缩为紧凑稳定的 key', () => {
    expect(resolveTableResetKey({
      columnResizeMode: 'onChange',
      resizable: false,
      sortable: false,
      pinable: false,
      hasColumnPinning: false,
      hasColumnResizing: false,
      hasColumnSort: false,
      manualPagination: true
    })).toBe('c1s')
  })

  it('任一重建相关配置变化时生成不同 key', () => {
    const base = resolveTableResetKey({
      columnResizeMode: 'onChange',
      resizable: true,
      sortable: true,
      pinable: false,
      hasColumnPinning: false,
      hasColumnResizing: true,
      hasColumnSort: true,
      manualPagination: false
    })

    const changed = resolveTableResetKey({
      columnResizeMode: 'onEnd',
      resizable: true,
      sortable: true,
      pinable: false,
      hasColumnPinning: false,
      hasColumnResizing: true,
      hasColumnSort: true,
      manualPagination: false
    })

    expect(changed).not.toBe(base)
  })
})
