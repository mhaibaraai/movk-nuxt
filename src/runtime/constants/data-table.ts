import type { DataTableSizePreset } from '../types/data-table'

export const SIZE_PRESET_MAP: Record<DataTableSizePreset, number> = {
  xs: 80,
  sm: 120,
  md: 180,
  lg: 260,
  xl: 400
} as const

export const DATA_TABLE_DEFAULTS = {
  emptyCell: '-',
  selectionSize: 48,
  indexLabel: '#',
  indexSize: 60,
  expandSize: 48,
  rowPinningSize: 48,
  actionsLabel: '操作',
  actionConfirmTitle: '确认操作',
  actionConfirmDescription: '请确认是否执行此操作',
  actionConfirmIcon: 'i-lucide-circle-question-mark',
  cancelButton: '取消',
  confirmButton: '确定',
  indentSize: '1rem',
  stripeClass: 'even:bg-elevated/30'
} as const
