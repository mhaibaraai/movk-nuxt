export default () => ({
  slots: {
    title: 'flex gap-2 items-center',
    footer: 'justify-end',
    icon: 'size-5 shrink-0'
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
