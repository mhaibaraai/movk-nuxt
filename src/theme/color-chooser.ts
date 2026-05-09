export default () => ({
  slots: {
    body: 'p-2 flex flex-col gap-2 min-w-[14rem]',
    header: 'flex items-center justify-between gap-2',
    formatTabs: 'inline-flex items-center gap-0.5 rounded-md bg-elevated p-0.5',
    formatTab: 'px-2 py-0.5 text-xs rounded text-muted hover:text-default cursor-pointer transition aria-selected:bg-default aria-selected:text-highlighted aria-selected:shadow-sm uppercase tracking-wide',
    section: 'flex flex-col gap-1.5',
    sectionTitle: 'text-[11px] uppercase tracking-wide text-muted',
    swatches: 'grid grid-cols-8 gap-1',
    swatch: 'rounded ring-1 ring-default cursor-pointer transition hover:scale-110 hover:ring-2 hover:ring-primary aria-selected:ring-2 aria-selected:ring-primary',
    actions: 'mt-1 flex items-center justify-between gap-1.5 border-t border-default pt-2',
    triggerChip: 'rounded-full ring-1 ring-default shrink-0 transition',
    triggerLabel: 'tabular-nums truncate',
    triggerInput: 'flex-1 min-w-0',
    triggerInputWrap: 'flex items-center gap-2 rounded-md ring-1 ring-default px-2 py-1 bg-default focus-within:ring-2 focus-within:ring-primary transition'
  },
  variants: {
    size: {
      xs: { triggerChip: 'size-2.5', swatch: 'size-4', triggerInputWrap: 'text-xs py-0.5' },
      sm: { triggerChip: 'size-3', swatch: 'size-4', triggerInputWrap: 'text-xs' },
      md: { triggerChip: 'size-3.5', swatch: 'size-5', triggerInputWrap: 'text-sm' },
      lg: { triggerChip: 'size-4', swatch: 'size-5', triggerInputWrap: 'text-sm py-1.5' },
      xl: { triggerChip: 'size-5', swatch: 'size-6', triggerInputWrap: 'text-base py-2' }
    },
    trigger: {
      button: {},
      chip: { triggerChip: 'size-7' },
      input: {}
    },
    disabled: {
      true: { body: 'opacity-60 pointer-events-none', triggerInputWrap: 'opacity-60 cursor-not-allowed' }
    }
  },
  defaultVariants: {
    size: 'md',
    trigger: 'button'
  }
})
