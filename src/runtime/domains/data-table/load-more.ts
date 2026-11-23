interface LoadMoreHooks {
  setLoading: (loading: boolean) => void
  /** 缺省时输出到控制台 */
  onError?: (error: unknown) => void
}

/** 调用 loadMore；返回 Promise 时期间置为 loading，失败交给 onError 并始终复位 loading */
export async function runLoadMore(loadMore: (() => void | Promise<void>) | undefined, hooks: LoadMoreHooks): Promise<void> {
  if (!loadMore) return
  try {
    const result = loadMore()
    if (!(result instanceof Promise)) return
    hooks.setLoading(true)
    await result
  }
  catch (error) {
    if (hooks.onError) hooks.onError(error)
    else console.error('[DataTable] loadMore failed:', error)
  }
  finally {
    hooks.setLoading(false)
  }
}
