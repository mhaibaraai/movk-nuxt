import type { DataTableSizePreset } from '../types/data-table'

export const SIZE_PRESET_MAP: Record<DataTableSizePreset, number> = {
  xs: 80,
  sm: 120,
  md: 180,
  lg: 260,
  xl: 400
} as const

export const DATA_TABLE_DEFAULTS = {
  rowKey: 'id',
  emptyCell: '-',
  indentSize: 24,
  selectionSize: 48,
  indexSize: 60,
  expandSize: 48,
  actionsLabel: '操作',
  indexLabel: '#'
} as const
