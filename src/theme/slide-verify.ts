export default () => ({
  slots: {
    root: 'relative select-none overflow-hidden rounded-lg border transition-colors duration-300',
    track: 'absolute inset-0',
    text: 'absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none',
    slider: 'size-full flex items-center justify-center rounded-md shadow-sm transition-colors'
  },
  variants: {
    disabled: {
      true: { root: 'opacity-50 cursor-not-allowed' }
    },
    verified: {
      true: {
        root: 'bg-success border-transparent',
        slider: 'bg-white/90'
      },
      false: {
        root: 'bg-elevated border-default',
        slider: 'bg-default cursor-grab active:cursor-grabbing ring-1 ring-default'
      }
    }
  }
})
