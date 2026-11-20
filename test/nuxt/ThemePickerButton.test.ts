import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import colors from 'tailwindcss/colors'
import ThemePickerButton from '../../src/runtime/components/theme-picker/ThemePickerButton.vue'

describe('ThemePickerButton', () => {
  it.each([
    ['orange', colors.orange],
    ['old-neutral', colors.neutral],
    ['paper', undefined]
  ] as const)('为 %s 色点保留项目色板及对应的内置回退色', async (chip, palette) => {
    const wrapper = await mountSuspended(ThemePickerButton, { props: { label: chip, chip } })

    try {
      const { style } = wrapper.get<HTMLSpanElement>('span[style]').element
      const lightFallback = palette ? `, ${palette[500]}` : ''
      const darkFallback = palette ? `, ${palette[400]}` : ''
      expect(style.getPropertyValue('--color-light')).toBe(`var(--color-${chip}-500${lightFallback})`)
      expect(style.getPropertyValue('--color-dark')).toBe(`var(--color-${chip}-400${darkFallback})`)
    }
    finally {
      wrapper.unmount()
    }
  })
})
