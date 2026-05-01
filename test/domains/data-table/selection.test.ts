import { describe, expect, it } from 'vitest'
import {
  keysToRowSelection,
  resolveSelectedCount,
  rowSelectionToKeys
} from '../../../src/runtime/domains/data-table/state/selection'

describe('data-table selection state', () => {
  it('keysToRowSelection 将 keys 转为 RowSelectionState', () => {
    expect(keysToRowSelection(['a', 2])).toEqual({
      a: true,
      2: true
    })
  })

  it('rowSelectionToKeys 支持通过 idMap 恢复外部 key', () => {
    const keys = rowSelectionToKeys(
      {
        internalA: true,
        internalB: false,
        internalC: true
      },
      new Map<string, string | number>([
        ['internalA', 'row-a'],
        ['internalC', 3]
      ])
    )

    expect(keys).toEqual(['row-a', 3])
  })

  it('resolveSelectedCount 优先使用 rowSelectionKeys', () => {
    expect(resolveSelectedCount(['a', 'b'], { c: true, d: true, e: true })).toBe(2)
  })

  it('resolveSelectedCount 在缺少 keys 时退回 rowSelectionState', () => {
    expect(resolveSelectedCount(undefined, { a: true, b: false, c: true })).toBe(3)
  })
})
