import { describe, expect, it, vi } from 'vitest'
import type { FetchHook } from 'ofetch'
import { attachInterceptors, composeHook, getInterceptors } from '../../../../src/runtime/domains/api/interceptors/compose'

const noop: FetchHook = () => {}

function makeInterceptors() {
  return {
    onRequest: vi.fn() as unknown as FetchHook,
    onResponse: vi.fn() as unknown as FetchHook,
    onResponseError: vi.fn() as unknown as FetchHook
  }
}

describe('composeHook', () => {
  it('用户未传钩子返回 undefined（保持实例 default）', () => {
    expect(composeHook(noop, undefined)).toBeUndefined()
  })

  it('用户传单函数返回 [movk, user]，movk 在前', () => {
    const user: FetchHook = () => {}
    const result = composeHook(noop, user)
    expect(result).toEqual([noop, user])
    expect(result?.[0]).toBe(noop)
  })

  it('用户传数组返回 [movk, ...users]', () => {
    const a: FetchHook = () => {}
    const b: FetchHook = () => {}
    const result = composeHook(noop, [a, b])
    expect(result).toEqual([noop, a, b])
    expect(result?.[0]).toBe(noop)
  })
})

describe('attachInterceptors / getInterceptors', () => {
  it('往返读取挂载的拦截器', () => {
    const instance = (() => {}) as never
    const interceptors = makeInterceptors()
    attachInterceptors(instance, interceptors)
    expect(getInterceptors(instance)).toBe(interceptors)
  })

  it('未挂载时返回 undefined', () => {
    const instance = (() => {}) as never
    expect(getInterceptors(instance)).toBeUndefined()
  })

  it('挂载的符号键不可枚举', () => {
    const instance = (() => {}) as never
    attachInterceptors(instance, makeInterceptors())
    expect(Object.keys(instance)).toHaveLength(0)
  })
})
