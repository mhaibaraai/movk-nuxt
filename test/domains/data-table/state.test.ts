import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { RowSelectionState } from '@tanstack/vue-table'
import {
  areSameKeys,
  expandedToKeys,
  keysToRowSelection,
  keysToVisibility,
  keysToVisibilityExclude,
  rowSelectionToKeys,
  visibilityToExcludeKeys,
  visibilityToKeys
} from '../../../src/runtime/domains/data-table/state/keys'
import { useSyncKeys } from '../../../src/runtime/domains/data-table/state/models'

const ids = ['a', 'b', 'c']

describe('data-table state keys', () => {
  it('可见性白名单与黑名单互转', () => {
    expect(keysToVisibility(['a'], ids)).toEqual({ a: true, b: false, c: false })
    expect(visibilityToKeys({ b: false }, ids)).toEqual(['a', 'c'])
    expect(keysToVisibilityExclude(['b'], ids)).toEqual({ a: true, b: false, c: true })
    expect(visibilityToExcludeKeys({ b: false }, ids)).toEqual(['b'])
  })

  it('行选择只保留为 true 的 key', () => {
    expect(keysToRowSelection(['1', '2'])).toEqual({ 1: true, 2: true })
    expect(rowSelectionToKeys({ 1: true, 2: false })).toEqual(['1'])
  })

  it('expanded 为 true 时视为无具体 key', () => {
    expect(expandedToKeys(true)).toEqual([])
    expect(expandedToKeys({ x: true, y: false })).toEqual(['x'])
  })

  it('areSameKeys 忽略顺序与数字字符串差异', () => {
    expect(areSameKeys(['1', 2], [2, '1'])).toBe(true)
    expect(areSameKeys(['1'], ['1', '2'])).toBe(false)
  })
})

describe('useSyncKeys', () => {
  it('keys 与记录双向同步且不回环', async () => {
    const keys = ref<string[] | undefined>(['1'])
    const record = ref<RowSelectionState | undefined>()
    effectScope().run(() => useSyncKeys(keys, record, keysToRowSelection, rowSelectionToKeys))

    keys.value = ['1', '2']
    await nextTick()
    expect(record.value).toEqual({ 1: true, 2: true })

    record.value = { 3: true }
    await nextTick()
    expect(keys.value).toEqual(['3'])
  })
})
