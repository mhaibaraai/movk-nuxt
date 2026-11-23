import { describe, expect, it, vi } from 'vitest'
import { runLoadMore } from '../../../src/runtime/domains/data-table/load-more'

describe('runLoadMore', () => {
  it('Promise 期间置为 loading，完成后复位', async () => {
    const setLoading = vi.fn()
    await runLoadMore(() => Promise.resolve(), { setLoading })
    expect(setLoading.mock.calls).toEqual([[true], [false]])
  })

  it('失败时交给 onError 并复位 loading', async () => {
    const setLoading = vi.fn()
    const onError = vi.fn()
    const error = new Error('boom')
    await runLoadMore(() => Promise.reject(error), { setLoading, onError })
    expect(onError).toHaveBeenCalledWith(error)
    expect(setLoading).toHaveBeenLastCalledWith(false)
  })

  it('同步抛错同样交给 onError', async () => {
    const onError = vi.fn()
    await runLoadMore(() => {
      throw new Error('sync')
    }, { setLoading: vi.fn(), onError })
    expect(onError).toHaveBeenCalledOnce()
  })

  it('未提供 loadMore 时不做任何事', async () => {
    const setLoading = vi.fn()
    await runLoadMore(undefined, { setLoading })
    expect(setLoading).not.toHaveBeenCalled()
  })
})
