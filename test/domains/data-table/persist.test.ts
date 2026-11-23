import { afterEach, describe, expect, it } from 'vitest'
import { readPersistedState, writePersistedState } from '../../../src/runtime/domains/data-table/persist'

const storage = new Map<string, string>()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => void storage.set(key, value),
  removeItem: key => void storage.delete(key)
} as Storage

afterEach(() => storage.clear())

describe('table persistence storage', () => {
  it('读写带前缀的 JSON 状态', () => {
    writePersistedState('users', { columnOrder: ['b', 'a'] })
    expect(storage.has('movk-data-table:users')).toBe(true)
    expect(readPersistedState('users')).toEqual({ columnOrder: ['b', 'a'] })
  })

  it('传 undefined 时删除', () => {
    writePersistedState('users', { a: 1 })
    writePersistedState('users', undefined)
    expect(readPersistedState('users')).toBeUndefined()
  })

  it('损坏的 JSON 返回 undefined', () => {
    storage.set('movk-data-table:bad', '{oops')
    expect(readPersistedState('bad')).toBeUndefined()
  })

  it('存储不可用时不抛错', () => {
    const original = globalThis.localStorage
    globalThis.localStorage = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } } as unknown as Storage
    expect(readPersistedState('x')).toBeUndefined()
    expect(() => writePersistedState('x', {})).not.toThrow()
    globalThis.localStorage = original
  })
})
