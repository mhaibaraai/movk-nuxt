import { describe, expect, it } from 'vitest'
import { stableItemKey } from '../src/runtime/components/auto-form/utils'

describe('stableItemKey / array add & remove', () => {
  it('updates keys when items are removed', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const keys = items.map((v, i) => stableItemKey(i, v))
    expect(new Set(keys).size).toBe(3)

    // remove index 1
    const next = [items[0], items[2]]
    const nextKeys = next.map((v, i) => stableItemKey(i, v))
    // index changed → key should change for moved item
    expect(nextKeys[1]).not.toBe(keys[2])
  })
})
