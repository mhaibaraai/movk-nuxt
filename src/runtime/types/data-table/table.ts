export type DataTableDensityPreset = 'compact' | 'normal' | 'comfortable'

export type DataTableTreeSelectionStrategy = 'cascade' | 'isolated' | 'leaf'

export type DataTableSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type DataTableDynamic<V, Ctx> = V | ((ctx: Ctx) => V)
