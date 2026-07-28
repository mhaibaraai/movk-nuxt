import { describe, expect, it } from 'vitest'

import { legacyStorageKeys, storageKey } from '../../../src/runtime/domains/theme/theme-storage'

describe('storageKey', () => {
  it('语义未变的字段沿用无版本键，保留用户既有选择', () => {
    expect(storageKey('demo', 'primary')).toBe('demo-ui-primary')
    expect(storageKey('demo', 'neutral')).toBe('demo-ui-neutral')
    expect(storageKey('demo', 'icons')).toBe('demo-ui-icons')
    expect(storageKey('demo', 'black-as-primary')).toBe('demo-ui-black-as-primary')
  })

  it('语义已变的字段带版本后缀，使升级前的数据失效', () => {
    expect(storageKey('demo', 'font')).toBe('demo-ui-font-v2')
    expect(storageKey('demo', 'radius')).toBe('demo-ui-radius-v2')
  })
})

describe('legacyStorageKeys', () => {
  it('列出需要清理的旧键', () => {
    expect(legacyStorageKeys('demo')).toEqual(['demo-ui-font', 'demo-ui-radius'])
  })

  it('旧键与新键不重叠，清理不会误删当前数据', () => {
    const legacy = legacyStorageKeys('demo')
    expect(legacy).not.toContain(storageKey('demo', 'font'))
    expect(legacy).not.toContain(storageKey('demo', 'radius'))
  })
})
