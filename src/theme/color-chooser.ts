export default () => ({
  slots: {
    body: 'p-2 flex flex-col gap-2 min-w-[14rem]',
    header: 'flex items-center justify-between gap-2',
    formatTabs: 'p-0.5',
    section: 'flex flex-col gap-1.5',
    swatches: 'grid grid-cols-8 gap-1',
    swatch: 'rounded ring-1 ring-default cursor-pointer transition hover:scale-110 hover:ring-2 hover:ring-primary aria-selected:ring-2 aria-selected:ring-primary',
    actions: 'mt-1 flex items-center justify-between gap-1.5 border-t border-default pt-2',
    actionsValue: 'text-xs text-muted tabular-nums truncate',
    actionsButtons: 'flex items-center gap-1',
    triggerChipWrapper: '',
    triggerChip: 'rounded-full ring-1 ring-default shrink-0 transition',
    triggerLabel: 'tabular-nums truncate',
    triggerIcon: 'text-muted shrink-0'
  },
  variants: {
    size: {
      xs: { triggerChip: 'size-2.5', swatch: 'size-4', triggerIcon: 'size-3' },
      sm: { triggerChip: 'size-3', swatch: 'size-4', triggerIcon: 'size-3.5' },
      md: { triggerChip: 'size-3.5', swatch: 'size-5', triggerIcon: 'size-4' },
      lg: { triggerChip: 'size-4', swatch: 'size-5', triggerIcon: 'size-4' },
      xl: { triggerChip: 'size-5', swatch: 'size-6', triggerIcon: 'size-5' }
    },
    trigger: {
      button: {},
      chip: {},
      input: {}
    },
    disabled: {
      true: { body: 'opacity-60 pointer-events-none' }
    }
  },
  defaultVariants: {
    size: 'md',
    trigger: 'button'
  }
})
