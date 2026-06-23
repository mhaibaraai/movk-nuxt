import { describe, expect, it } from 'vitest'

import { resolveLeadingIcon } from '../../../src/runtime/domains/tree/tree-icon'

const defaults = { folderOpen: 'i-lucide-folder-open', folder: 'i-lucide-folder' }

describe('resolveLeadingIcon', () => {
  it('item.icon 优先于一切', () => {
    expect(resolveLeadingIcon({ icon: 'i-x', children: [{}] }, true, defaults)).toBe('i-x')
    expect(resolveLeadingIcon({ icon: 'i-x' }, false, defaults)).toBe('i-x')
  })

  it('父节点无 icon 时按展开态回退 folder 默认', () => {
    expect(resolveLeadingIcon({ children: [{}] }, true, defaults)).toBe('i-lucide-folder-open')
    expect(resolveLeadingIcon({ children: [{}] }, false, defaults)).toBe('i-lucide-folder')
  })

  it('父节点尊重传入的 expandedIcon/collapsedIcon', () => {
    const opts = { ...defaults, expandedIcon: 'i-open', collapsedIcon: 'i-closed' }
    expect(resolveLeadingIcon({ children: [{}] }, true, opts)).toBe('i-open')
    expect(resolveLeadingIcon({ children: [{}] }, false, opts)).toBe('i-closed')
  })

  it('叶子无 icon 返回 undefined', () => {
    expect(resolveLeadingIcon({}, true, defaults)).toBeUndefined()
    expect(resolveLeadingIcon({ children: [] }, false, defaults)).toBeUndefined()
  })
})
