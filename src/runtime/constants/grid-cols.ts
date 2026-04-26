const BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const
type Breakpoint = (typeof BREAKPOINTS)[number]
type ColsConfig = Partial<Record<Breakpoint, number>>

// const GRID_COL_SAFELIST = [
//   'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
//   'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5', 'sm:grid-cols-6',
//   'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4', 'md:grid-cols-5', 'md:grid-cols-6',
//   'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6',
//   'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4', 'xl:grid-cols-5', 'xl:grid-cols-6'
// ]

export function resolveMaxCols(cols: number | ColsConfig): number {
  if (typeof cols === 'number') return cols
  return Math.max(...BREAKPOINTS.map(bp => cols[bp] ?? 1))
}

export function resolveGridClasses(
  cols: number | ColsConfig,
  gap: string
): string {
  if (typeof cols === 'number') {
    return `grid ${gap} grid-cols-${cols}`
  }

  const bpClasses = BREAKPOINTS
    .filter(bp => cols[bp] != null)
    .map(bp => `${bp}:grid-cols-${cols[bp]!}`)

  return ['grid', gap, 'grid-cols-1', ...bpClasses].join(' ')
}
