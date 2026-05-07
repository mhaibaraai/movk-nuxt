export default () => ({
  slots: {
    content: 'px-4 py-3 flex flex-col gap-2',
    arrow: '',
    header: 'flex flex-col gap-1.5',
    title: 'flex gap-2 items-center text-sm text-highlighted font-semibold',
    description: 'text-muted text-xs',
    body: '',
    footer: 'mt-1 flex items-center justify-end gap-1.5',
    icon: 'size-4 shrink-0'
  },
  variants: {
    type: {
      primary: { icon: 'text-primary' },
      info: { icon: 'text-info' },
      success: { icon: 'text-success' },
      warning: { icon: 'text-warning' },
      error: { icon: 'text-error' },
      neutral: { icon: 'text-muted' }
    }
  }
})
