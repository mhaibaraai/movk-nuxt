import { defineTheme } from '@nuxt/ui/utils/theme'

export default defineTheme({
  slots: {
    wrapper: 'flex',
    presets: 'flex flex-col gap-1 p-2 border-r border-default min-w-30',
    presetButton: 'justify-start',
    calendar: 'p-2',
    clearIcon: 'cursor-pointer opacity-60 hover:opacity-100 transition-opacity'
  },
  variants: {
    withPresets: {
      true: {},
      false: { wrapper: 'block' }
    }
  },
  defaultVariants: {
    withPresets: false
  }
})
