import { describe, expect, it } from 'vitest'
import { getThemeClasses } from '../../src/utils/theme-classes'

const theme = {
  slots: { root: 'flex gap-2', icon: ['size-4', 'shrink-0'] },
  variants: {
    type: { error: { icon: 'text-error' } },
    open: { true: 'rotate-180', false: '' }
  },
  compoundVariants: [{ type: 'error', open: true, class: { root: 'ring-error' } }],
  defaultVariants: { type: 'error' }
}

describe('getThemeClasses', () => {
  it('收集 slots、variants 与 compoundVariants.class 中的类名并去重', () => {
    expect(getThemeClasses([theme, { slots: { root: 'flex' } }]).sort()).toEqual(
      ['flex', 'gap-2', 'ring-error', 'rotate-180', 'shrink-0', 'size-4', 'text-error'].sort()
    )
  })

  it('不收集 compoundVariants 的匹配值与 defaultVariants', () => {
    expect(getThemeClasses([theme])).not.toContain('error')
  })

  it('配置前缀时为每个类加 Tailwind 前缀', () => {
    expect(getThemeClasses([{ slots: { root: 'flex hover:bg-muted' } }], 'tw')).toEqual(['tw:flex', 'tw:hover:bg-muted'])
  })
})
