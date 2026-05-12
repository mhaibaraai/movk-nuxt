const COLS = Array.from({ length: 12 }, (_, i) => i + 1)

const colsVariant = (prefix = '') =>
  Object.fromEntries(
    COLS.map(n => [n, { grid: `${prefix}grid-cols-${n}` }])
  )

export default () => ({
  slots: {
    base: 'space-y-4',
    root: 'group/search pb-6 -mb-6',
    inner: 'relative',
    grid: 'grid gap-4',
    actionWrapper: 'flex items-end gap-2 justify-end',
    toggleWrapper: 'absolute inset-x-0 top-full flex justify-center pointer-events-none z-10',
    toggle: 'group pointer-events-auto opacity-30 group-hover/search:opacity-100 transition-opacity duration-200',
    collapsedContent: 'mt-4'
  },
  variants: {
    cols: colsVariant(),
    smCols: colsVariant('sm:'),
    mdCols: colsVariant('md:'),
    lgCols: colsVariant('lg:'),
    xlCols: colsVariant('xl:')
  }
})
