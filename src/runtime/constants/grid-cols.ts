type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

const BASE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
}

const BP_COLS: Record<Breakpoint, Record<number, string>> = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6'
  }
}

const BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const

/**
 * 根据 cols 配置解析网格类名
 */
export function resolveGridClasses(
  cols: number | { sm?: number, md?: number, lg?: number, xl?: number },
  gap: string
): string {
  const classes = ['grid', gap]

  if (typeof cols === 'number') {
    classes.push(BASE_COLS[cols] ?? 'grid-cols-3')
  } else {
    classes.push('grid-cols-1')
    for (const bp of BREAKPOINTS) {
      const val = cols[bp]
      if (val) classes.push(BP_COLS[bp][val] ?? '')
    }
  }

  return classes.join(' ')
}
