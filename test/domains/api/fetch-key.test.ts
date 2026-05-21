import { describe, expect, it, vi } from 'vitest'

vi.mock('@movk/core', () => ({
  // 直接返回入参，便于断言原始 raw 的区分度
  simpleHash: (s: string) => s
}))

const { buildApiFetchKey } = await import('../../../src/runtime/domains/api/fetch-key')

describe('domains/api/fetch-key.buildApiFetchKey', () => {
  it('相同入参产生相同 key（幂等）', () => {
    const input = { url: '/profile', method: 'GET' }
    expect(buildApiFetchKey(input)).toBe(buildApiFetchKey(input))
  })

  it('key 带 mvk-api 前缀', () => {
    expect(buildApiFetchKey({ url: '/profile' })).toMatch(/^mvk-api:/)
  })

  it('toast 不同维度两两产生不同 key', () => {
    const base = { url: '/profile', method: 'GET' } as const
    const keys = [
      buildApiFetchKey({ ...base }),
      buildApiFetchKey({ ...base, toast: false }),
      buildApiFetchKey({ ...base, toast: { successMessage: '加载成功' } }),
      buildApiFetchKey({ ...base, toast: { errorMessage: '加载失败' } }),
      buildApiFetchKey({ ...base, toast: { success: false } }),
      buildApiFetchKey({ ...base, toast: { success: { color: 'secondary', icon: 'i-lucide-sparkles' } } })
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('endpoint / skipUnwrap / skipBusinessCheck 变化产生不同 key', () => {
    const base = { url: '/profile' } as const
    const keys = [
      buildApiFetchKey({ ...base }),
      buildApiFetchKey({ ...base, endpoint: 'v2' }),
      buildApiFetchKey({ ...base, skipUnwrap: true }),
      buildApiFetchKey({ ...base, skipBusinessCheck: true })
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('method / url / query / body 变化产生不同 key', () => {
    const keys = [
      buildApiFetchKey({ url: '/profile' }),
      buildApiFetchKey({ url: '/profile', method: 'POST' }),
      buildApiFetchKey({ url: '/users' }),
      buildApiFetchKey({ url: '/profile', query: { page: 1 } }),
      buildApiFetchKey({ url: '/profile', method: 'POST', body: { name: 'a' } })
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('含循环引用的 body 不抛错并走 fallback，仍按 toast 维度区分', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    const make = (toast: false | { successMessage: string } | undefined) =>
      buildApiFetchKey({ url: '/profile', method: 'POST', body: circular, toast })

    expect(() => make(undefined)).not.toThrow()
    const keys = [make(undefined), make(false), make({ successMessage: 'x' })]
    expect(new Set(keys).size).toBe(keys.length)
  })
})
