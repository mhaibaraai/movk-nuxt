import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchHook } from 'ofetch'

const useFetchMock = vi.fn(() => ({}))

const v2Instance = Object.assign(() => {}, { use: () => v2Instance })
const defaultInstance = Object.assign(() => {}, {
  use: (endpoint: string) => (endpoint === 'v2' ? v2Instance : defaultInstance)
})

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api: defaultInstance }),
  useFetch: useFetchMock
}))

const { useApiFetch } = await import('../../src/runtime/composables/useApiFetch')

function lastOptions() {
  return useFetchMock.mock.calls.at(-1)?.[1] as unknown as Record<string, unknown>
}

describe('useApiFetch', () => {
  beforeEach(() => {
    useFetchMock.mockClear()
  })

  it('默认使用 $api 实例，未声明 endpoint 键', () => {
    useApiFetch('/users')

    expect(lastOptions().$fetch).toBe(defaultInstance)
    expect('endpoint' in lastOptions()).toBe(false)
  })

  it('指定 endpoint 时切换到对应端点实例', () => {
    useApiFetch('/users', { endpoint: 'v2' as never })

    expect(lastOptions().$fetch).toBe(v2Instance)
  })

  it('请求级选项与用户钩子原样透传给 $api 客户端', () => {
    const onResponse: FetchHook = () => {}
    useApiFetch('/users', { toast: false, businessCheck: false, unwrap: false, onResponse })

    expect(lastOptions()).toMatchObject({ toast: false, businessCheck: false, unwrap: false, onResponse })
  })

  it('请求级选项参与去重 key', () => {
    useApiFetch('/users')
    const plain = (lastOptions().key as { value: string }).value
    useApiFetch('/users', { unwrap: false })
    const raw = (lastOptions().key as { value: string }).value

    expect(plain).not.toBe(raw)
  })

  it('用户传入 key 时优先使用', () => {
    useApiFetch('/users', { key: 'custom' })

    expect((lastOptions().key as { value: string }).value).toBe('custom')
  })
})
