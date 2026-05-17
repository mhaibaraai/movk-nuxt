export default () => ({
  slots: {
    root: 'flex items-center gap-2',
    list: 'relative flex group rounded-lg bg-elevated',
    item: 'inline-flex items-center gap-1.5',
    leading: 'inline-flex items-center shrink-0',
    leadingIcon: 'shrink-0 text-dimmed',
    trailing: 'inline-flex items-center shrink-0',
    trailingIcon: 'shrink-0 text-dimmed',
    itemWrapper: 'flex flex-col items-start min-w-0 gap-0.5',
    itemLabel: 'truncate',
    itemDescription: 'truncate text-muted text-xs'
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-col', list: 'w-full' },
      vertical: { list: 'flex-col' }
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
  }
})
