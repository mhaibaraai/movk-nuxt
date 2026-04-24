import { describe, expect, it } from 'vitest'
import {
  keysToVisibility,
  keysToVisibilityExclude,
  visibilityToExcludeKeys,
  visibilityToKeys
} from '../../../src/runtime/domains/data-table/state/visibility'

describe('data-table visibility state', () => {
  const allColumnIds = ['name', 'age', 'status']

  it('白名单 keys 与 VisibilityState 可双向转换', () => {
    const state = keysToVisibility(['name', 'status'], allColumnIds)

    expect(state).toEqual({
      name: true,
      age: false,
      status: true
    })
    expect(visibilityToKeys(state, allColumnIds)).toEqual(['name', 'status'])
  })

  it('黑名单 keys 与 VisibilityState 可双向转换', () => {
    const state = keysToVisibilityExclude(['age'], allColumnIds)

    expect(state).toEqual({
      name: true,
      age: false,
      status: true
    })
    expect(visibilityToExcludeKeys(state, allColumnIds)).toEqual(['age'])
  })
})
