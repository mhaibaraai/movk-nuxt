import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, reactive } from 'vue'
import { useAsyncItems } from '../../../src/runtime/domains/auto-form/async-items'
import type { AutoFormAsyncItems } from '../../../src/runtime/types/auto-form'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function setup(config: AutoFormAsyncItems, state: Record<string, any> = reactive({})) {
  const scope = effectScope()
  const result = scope.run(() => useAsyncItems(() => config, () => state))!
  return { ...result, scope, state }
}

describe('useAsyncItems', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('立即加载并在完成后写入 items，loading 随之切换', async () => {
    const task = deferred<string[]>()
    const { items, loading } = setup({ load: () => task.promise })

    expect(loading.value).toBe(true)
    task.resolve(['a'])
    await task.promise
    await nextTick()

    expect(items.value).toEqual(['a'])
    expect(loading.value).toBe(false)
  })

  it('deps 变化时重新加载，并按 debounce 合并', async () => {
    const load = vi.fn(async ({ state }: { state: Record<string, any> }) => [state.province])
    const state = reactive({ province: 'a' })
    const { items } = setup({ load, deps: s => s.province, debounce: 100 }, state)

    vi.advanceTimersByTime(100)
    await vi.waitFor(() => expect(items.value).toEqual(['a']))

    state.province = 'b'
    await nextTick()
    state.province = 'c'
    await nextTick()
    vi.advanceTimersByTime(100)
    await vi.waitFor(() => expect(items.value).toEqual(['c']))

    expect(load).toHaveBeenCalledTimes(2)
  })

  it('丢弃过期请求的结果并 abort 其 signal', async () => {
    const first = deferred<string[]>()
    const second = deferred<string[]>()
    const signals: AbortSignal[] = []
    const queue = [first, second]
    const state = reactive({ k: 1 })
    const { items, loading } = setup({
      load: ({ signal }) => {
        signals.push(signal)
        return queue.shift()!.promise
      },
      deps: s => s.k
    }, state)

    state.k = 2
    await nextTick()
    expect(signals[0]?.aborted).toBe(true)

    second.resolve(['new'])
    first.resolve(['old'])
    await vi.waitFor(() => expect(items.value).toEqual(['new']))
    await first.promise
    expect(loading.value).toBe(false)
  })

  it('加载失败时保留上次结果并记录 error', async () => {
    const state = reactive({ k: 1 })
    let fail = false
    const { items, error } = setup({
      load: async () => {
        if (fail) throw new Error('boom')
        return ['ok']
      },
      deps: s => s.k
    }, state)
    await vi.waitFor(() => expect(items.value).toEqual(['ok']))

    fail = true
    state.k = 2
    await vi.waitFor(() => expect(error.value).toBeInstanceOf(Error))
    expect(items.value).toEqual(['ok'])
  })

  it('作用域销毁时 abort 进行中的请求', () => {
    let signal: AbortSignal | undefined
    const { scope } = setup({
      load: (ctx) => {
        signal = ctx.signal
        return new Promise(() => {})
      }
    })
    scope.stop()
    expect(signal?.aborted).toBe(true)
  })
})
