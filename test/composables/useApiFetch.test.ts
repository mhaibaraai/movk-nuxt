import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchHook } from 'ofetch'
import { attachInterceptors } from '../../src/runtime/domains/api/interceptors/compose'

const useFetchMock = vi.fn(() => ({}))

function makeMovk() {
  return {
    onRequest: (() => {}) as FetchHook,
    onResponse: (() => {}) as FetchHook,
    onResponseError: (() => {}) as FetchHook
  }
}

const defaultMovk = makeMovk()
const v2Movk = makeMovk()

function makeInstance(interceptors: ReturnType<typeof makeMovk>) {
  const instance = Object.assign(() => {}, {
    use: (endpoint: string) => (endpoint === 'v2' ? v2Instance : instance)
  })
  attachInterceptors(instance as never, interceptors)
  return instance
}

const v2Instance = makeInstance(v2Movk)
const defaultInstance = makeInstance(defaultMovk)

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api: defaultInstance }),
  useFetch: useFetchMock
}))

const { useApiFetch } = await import('../../src/runtime/composables/useApiFetch')

function lastOptions() {
  return useFetchMock.mock.calls.at(-1)?.[1] as Record<string, unknown>
}

describe('useApiFetch 钩子组合', () => {
  beforeEach(() => {
    useFetchMock.mockClear()
  })

  it('用户传 onResponse 时组合为 [movk, user]，movk 在前', () => {
    const userOnResponse: FetchHook = () => {}
    useApiFetch('/users', { onResponse: userOnResponse })

    const onResponse = lastOptions().onResponse as FetchHook[]
    expect(onResponse).toEqual([defaultMovk.onResponse, userOnResponse])
    expect(onResponse[0]).toBe(defaultMovk.onResponse)
  })

  it('用户未传钩子时 options 不含 onResponse 键（保持实例 default）', () => {
    useApiFetch('/users')

    expect('onResponse' in lastOptions()).toBe(false)
    expect('onRequest' in lastOptions()).toBe(false)
    expect('onResponseError' in lastOptions()).toBe(false)
  })

  it('指定 endpoint 时组合该端点实例的拦截器', () => {
    const userOnResponse: FetchHook = () => {}
    useApiFetch('/users', { endpoint: 'v2', onResponse: userOnResponse })

    const onResponse = lastOptions().onResponse as FetchHook[]
    expect(onResponse[0]).toBe(v2Movk.onResponse)
    expect(onResponse[0]).not.toBe(defaultMovk.onResponse)
  })

  it('用户数组钩子与 onRequest 一并组合', () => {
    const a: FetchHook = () => {}
    const b: FetchHook = () => {}
    useApiFetch('/users', { onRequest: [a, b] })

    expect(lastOptions().onRequest).toEqual([defaultMovk.onRequest, a, b])
  })
})
