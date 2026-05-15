export default () => ({
  slots: {
    root: 'flex items-center gap-2',
    list: 'relative flex group rounded-lg bg-elevated',
    item: 'transition-colors focus:outline-none',
    wrapper: 'inline-flex flex-col items-start min-w-0',
    label: 'truncate',
    description: 'truncate'
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-col', list: 'w-full' },
      vertical: { list: 'flex-col' }
    },
    disabled: {
      true: { root: 'opacity-60 pointer-events-none' }
    },
    fieldGroup: {
      horizontal: {
        root: 'rounded-md overflow-hidden not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-within:z-[1]',
        list: 'rounded-md'
      },
      vertical: {
        root: 'rounded-md overflow-hidden not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-within:z-[1]',
        list: 'rounded-md'
      }
    }
  },
  defaultVariants: {
    color: 'primary',
    size: 'md'
  }
})
