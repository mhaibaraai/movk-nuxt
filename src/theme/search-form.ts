export default () => ({
  slots: {
    root: 'group/search',
    form: 'space-y-4',
    visible: 'relative',
    grid: 'grid gap-4 [grid-template-columns:repeat(var(--m-search-cols,1),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--m-search-cols-sm,var(--m-search-cols)),minmax(0,1fr))] md:[grid-template-columns:repeat(var(--m-search-cols-md,var(--m-search-cols-sm,var(--m-search-cols))),minmax(0,1fr))] lg:[grid-template-columns:repeat(var(--m-search-cols-lg,var(--m-search-cols-md,var(--m-search-cols-sm,var(--m-search-cols)))),minmax(0,1fr))] xl:[grid-template-columns:repeat(var(--m-search-cols-xl,var(--m-search-cols-lg,var(--m-search-cols-md,var(--m-search-cols-sm,var(--m-search-cols))))),minmax(0,1fr))]',
    header: '',
    footer: '',
    actions: 'flex items-end gap-2 justify-end',
    toggleWrapper: 'flex justify-center pt-2',
    toggle: 'group',
    toggleIcon: 'size-3.5 group-data-[state=open]:rotate-180 transition-transform duration-200',
    collapsed: 'mt-4'
  }
})
