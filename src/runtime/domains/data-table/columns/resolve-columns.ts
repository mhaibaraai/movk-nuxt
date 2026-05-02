import type { ColumnDef } from '@tanstack/vue-table'
import type {
  DataTableActionsColumn,
  DataTableColumn,
  DataTableExpandColumn,
  DataTableIndexColumn,
  DataTableRowPinningColumn,
  DataTableSelectionColumn
} from '../../../types/data-table'
import type { ResolveContext, ResolvedColumnState } from './constants'
import { isDataColumn, isGroupColumn } from '../../../types/data-table'
import type { DataTableProps } from '../../../types'
import { isString } from '@movk/core'
import { DENSITY_PRESETS } from './constants'
import { resolveDataColumn } from './resolve-data-column'
import { resolveGroupColumn } from './resolve-group-column'
import {
  resolveActionsColumn,
  resolveExpandColumn,
  resolveIndexColumn,
  resolveRowPinningColumn,
  resolveSelectionColumn
} from './resolve-special-columns'

function resolveColumn<T>(
  col: DataTableColumn<T>,
  ctx: ResolveContext<T>,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  if (isGroupColumn(col)) return resolveGroupColumn(col, ctx, resolveColumn, inheritedFixed)
  if (isDataColumn(col)) return resolveDataColumn(col, ctx, inheritedFixed)

  if ('type' in col) {
    switch (col.type) {
      case 'selection': return resolveSelectionColumn(col as DataTableSelectionColumn<T>, ctx)
      case 'index': return resolveIndexColumn(col as DataTableIndexColumn<T>, ctx)
      case 'expand': return resolveExpandColumn(col as DataTableExpandColumn<T>, ctx)
      case 'row-pinning': return resolveRowPinningColumn(col as DataTableRowPinningColumn<T>, ctx)
      case 'actions': return resolveActionsColumn(col as DataTableActionsColumn<T>, ctx)
    }
  }

  return col as ColumnDef<T, unknown>
}

export function resolveColumns<T>(
  columns: DataTableColumn<T>[],
  options: DataTableProps<T>
): ResolvedColumnState<T> {
  let groupCounter = 0
  const ctx: ResolveContext<T> = {
    options,
    density: options.density
      ? (isString(options.density) ? DENSITY_PRESETS[options.density] : options.density)
      : null,
    pinning: { left: [], right: [] },
    visibility: {},
    sizing: {},
    flags: { hasPinning: false, hasResizing: false, hasSort: false, hasExpand: false },
    nextGroupId: () => groupCounter++,
    allColumnIds: []
  }

  const columnDefs = columns.map(col => resolveColumn(col, ctx))

  return {
    columnDefs,
    initialPinning: ctx.pinning,
    initialVisibility: ctx.visibility,
    initialSizing: ctx.sizing,
    hasColumnPinning: ctx.flags.hasPinning,
    hasColumnResizing: ctx.flags.hasResizing,
    hasColumnSort: ctx.flags.hasSort,
    hasExpandColumn: ctx.flags.hasExpand,
    selectionMode: ctx.selectionMode,
    selectionStrategy: ctx.selectionStrategy,
    subRowSelection: ctx.subRowSelection,
    allColumnIds: ctx.allColumnIds
  }
}
