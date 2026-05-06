import type { ButtonProps, ColorPickerProps, PopoverProps } from '@nuxt/ui'

type PopoverMode = 'click' | 'hover'

export interface ColorChooserProps<P extends PopoverMode = PopoverMode> extends /** @vue-ignore */ ColorPickerProps {
  popoverProps?: PopoverProps<P>
  buttonProps?: ButtonProps
}
