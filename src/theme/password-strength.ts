export default {
  slots: {
    root: 'space-y-2',
    text: 'text-sm font-medium',
    list: 'space-y-1',
    item: 'flex items-center gap-0.5',
    icon: 'size-4 shrink-0',
    itemText: 'text-xs',
  },
  variants: {
    met: {
      true: {
        item: 'text-success',
        icon: 'text-success',
        itemText: '',
      },
      false: {
        item: 'text-muted',
        icon: 'text-muted',
        itemText: '',
      },
    },
  },
}
