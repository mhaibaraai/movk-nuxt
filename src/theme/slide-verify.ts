export default () => ({
  slots: {
    root: 'relative flex items-center select-none overflow-hidden rounded-md border transition-colors duration-300',
    track: 'absolute inset-0',
    fill: 'absolute inset-y-0 left-0 bg-primary/20 opacity-60',
    text: 'absolute inset-0 flex items-center justify-center font-medium pointer-events-none',
    slider: 'relative z-10 flex shrink-0 touch-none items-center justify-center rounded-md shadow-sm transition-colors',
    icon: 'shrink-0'
  },
  variants: {
    size: {
      xs: { root: 'p-1', text: 'text-xs', slider: 'px-2 py-1', icon: 'size-4' },
      sm: { root: 'p-1.5', text: 'text-xs', slider: 'px-2.5 py-1.5', icon: 'size-4' },
      md: { root: 'p-1.5', text: 'text-sm', slider: 'px-2.5 py-1.5', icon: 'size-5' },
      lg: { root: 'p-2', text: 'text-sm', slider: 'px-3 py-2', icon: 'size-5' },
      xl: { root: 'p-2', text: 'text-base', slider: 'px-3 py-2', icon: 'size-6' }
    },
    disabled: {
      true: { root: 'opacity-50 cursor-not-allowed' }
    },
    verified: {
      true: {
        root: 'bg-success border-transparent',
        slider: 'bg-white/90',
        icon: 'text-success'
      },
      false: {
        root: 'bg-elevated border-default',
        slider: 'bg-default cursor-grab active:cursor-grabbing ring-1 ring-default',
        icon: 'text-primary'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
})
