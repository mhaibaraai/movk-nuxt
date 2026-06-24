import { describe, expect, it } from 'vitest'

import { resolveLeadingIcon } from '../../../src/runtime/domains/tree/tree-icon'

describe('resolveLeadingIcon', () => {
  it('item.icon 优先于一切', () => {
    expect(resolveLeadingIcon({ icon: 'i-x', children: [{}] }, 'i-folder')).toBe('i-x')
    expect(resolveLeadingIcon({ icon: 'i-x' }, 'i-folder')).toBe('i-x')
  })

  it('父节点无 icon 时回退传入的 folder 图标', () => {
    expect(resolveLeadingIcon({ children: [{}] }, 'i-lucide-folder-open')).toBe('i-lucide-folder-open')
    expect(resolveLeadingIcon({ children: [{}] }, 'i-lucide-folder')).toBe('i-lucide-folder')
  })

  it('叶子无 icon 返回 undefined', () => {
    expect(resolveLeadingIcon({}, 'i-folder')).toBeUndefined()
    expect(resolveLeadingIcon({ children: [] }, 'i-folder')).toBeUndefined()
  })
})
