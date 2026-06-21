export default () => ({
  slots: {
    container: 'flex flex-col gap-2 min-h-0',
    toolbar: 'flex items-center gap-1.5',
    toolbarButton: 'shrink-0',
    search: 'flex-1 min-w-0',
    checkbox: 'shrink-0 me-1.5',
    highlight: 'rounded-[2px] bg-primary/15 text-primary',
    loading: 'flex items-center gap-1.5 text-sm text-muted',
    loadingIcon: 'size-4 shrink-0 animate-spin',
    empty: 'py-6 text-center text-sm text-muted'
  }
})
