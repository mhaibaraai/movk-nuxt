import type { ColumnDef, ColumnMeta, ColumnPinningState, ColumnSizingState, VisibilityState } from '@tanstack/vue-table'
import type {
  DataTableDensityPreset,
  DataTableSizePreset,
  DataTableTreeSelectionStrategy
} from '../../../types/data-table'
import type { DataTableProps } from '../../../components/DataTable.vue'

export const DENSITY_PRESETS: Record<DataTableDensityPreset, { th?: string, td?: string }> = {
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
  'selection': { id: '__selection', size: 48, align: 'center' },
  'index': { id: '__index', size: 60, align: 'center', header: '#', tdClass: 'text-muted' },
  'expand': { id: '__expand', size: 60, align: 'center' },
  'row-pinning': { id: '__row_pinning', size: 48, align: 'center' },
  'actions': { id: '__actions', size: 60, header: '操作', align: 'center' }
} as const

export interface ResolvedColumnState<T> {
  columnDefs: ColumnDef<T, unknown>[]
  initialPinning: ColumnPinningState
  initialVisibility: VisibilityState
  initialSizing: ColumnSizingState
  hasColumnPinning: boolean
  hasColumnResizing: boolean
  hasColumnSort: boolean
  hasExpandColumn: boolean
  selectionMode?: 'single' | 'multiple'
  selectionStrategy?: DataTableTreeSelectionStrategy
  subRowSelection?: boolean
  allColumnIds: string[]
}

export interface ResolveContext<T> {
  options: DataTableProps<T>
  density: ColumnMeta<T, unknown>['class'] | null
  pinning: ColumnPinningState
  visibility: VisibilityState
  sizing: ColumnSizingState
  flags: { hasPinning: boolean, hasResizing: boolean, hasSort: boolean, hasExpand: boolean }
  selectionMode?: 'single' | 'multiple'
  selectionStrategy?: DataTableTreeSelectionStrategy
  subRowSelection?: boolean
  nextGroupId: () => number
  allColumnIds: string[]
}
