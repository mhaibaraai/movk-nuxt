export default () => ({
  slots: {
    root: 'inline-flex',
    list: 'inline-flex rounded-lg bg-elevated/50 ring-1 ring-default',
    item: 'transition-colors',
    itemBody: 'inline-flex flex-col items-start min-w-0',
    itemLabel: 'truncate',
    itemDescription: 'text-xs text-muted truncate'
  },
  variants: {
    orientation: {
      horizontal: { list: 'flex-row items-center' },
      vertical: { list: 'flex-col items-stretch' }
    },
    size: {
      xs: { list: 'gap-0.5 p-0.5' },
      sm: { list: 'gap-1 p-0.5' },
      md: { list: 'gap-1 p-1' },
      lg: { list: 'gap-1.5 p-1' },
      xl: { list: 'gap-2 p-1.5' }
    },
    disabled: {
      true: { root: 'opacity-60 pointer-events-none' }
    }
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md'
  }
})
