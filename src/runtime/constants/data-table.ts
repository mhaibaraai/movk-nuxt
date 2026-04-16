import type { DataTableDensityOptions, DataTableDensityPreset, DataTableSizePreset } from '../types/data-table'

export const DENSITY_PRESETS: Record<DataTableDensityPreset, DataTableDensityOptions> = {
  compact: { td: 'px-3 py-1.5', th: 'px-3 py-2' },
  normal: { td: 'px-4 py-2.5', th: 'px-4 py-3' },
  comfortable: { td: 'p-4', th: 'p-4' }
} as const

export const SIZE_PRESET_MAP: Record<DataTableSizePreset, number> = {
  xs: 80,
  sm: 120,
  md: 180,
  lg: 260,
  xl: 400
} as const

export interface SpecialColumnDefaults {
  id: string
  fixed?: 'left' | 'right'
  size?: number
  align?: 'left' | 'center' | 'right'
  header?: string
  tdClass?: string
}

export type SpecialColumnType = 'selection' | 'index' | 'expand' | 'row-pinning' | 'actions'

export const SPECIAL_COLUMN_DEFAULTS: Record<SpecialColumnType, SpecialColumnDefaults> = {
  'selection': { id: '__selection', fixed: 'left', size: 48, align: 'center' },
  'index': { id: '__index', size: 60, align: 'center', header: '#', tdClass: 'text-muted' },
  'expand': { id: '__expand', size: 48 },
  'row-pinning': { id: '__row_pinning', fixed: 'left', size: 48, align: 'center', header: '' },
  'actions': { id: '__actions', fixed: 'right', header: '操作' }
} as const
