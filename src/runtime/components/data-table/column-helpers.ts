import type {
  CellContext,
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  VisibilityState
} from '@tanstack/vue-table'
import type {
  DataTableActionsColumn,
  DataTableColumn,
  DataTableDataColumn,
  DataTableExpandColumn,
  DataTableGroupColumn,
  DataTableIndexColumn,
  DataTableSelectionColumn,
  ResolvedColumnState
} from '../../types/data-table'
import { isDataColumn, isGroupColumn } from '../../types/data-table'
import { DATA_TABLE_DEFAULTS } from '../../constants/data-table'
import { resolvePresetSize } from '../../utils/data-table-utils'
import { isString } from '@movk/core'
import { createSelectionColumnDef } from './selection-helpers'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ResolveColumnsOptions {
  rowKey: string
  pageOffset: number
  emptyCell: string | false
  resizable: boolean
}

export function resolveColumns<T>(
  columns: DataTableColumn<T>[],
  options: ResolveColumnsOptions
): ResolvedColumnState<T> {
  const pinning: ColumnPinningState = { left: [], right: [] }
  const visibility: VisibilityState = {}
  const sizing: ColumnSizingState = {}

  const columnDefs = columns.map(col =>
    resolveColumn(col, options, pinning, visibility, sizing)
  )

  return {
    columnDefs,
    initialPinning: pinning,
    initialVisibility: visibility,
    initialSizing: sizing
  }
}

// ---------------------------------------------------------------------------
// Internal: resolve a single column
// ---------------------------------------------------------------------------

function resolveColumn<T>(
  col: DataTableColumn<T>,
  options: ResolveColumnsOptions,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  if (isGroupColumn(col)) {
    return resolveGroupColumn(col, options, pinning, visibility, sizing)
  }

  if (isDataColumn(col)) {
    return resolveDataColumn(col, options, pinning, visibility, sizing)
  }

  // Special columns
  if ('type' in col) {
    switch (col.type) {
      case 'selection':
        return resolveSelectionColumn<T>(col as DataTableSelectionColumn, pinning)
      case 'index':
        return resolveIndexColumn(col, options, pinning, sizing)
      case 'expand':
        return resolveExpandColumn(col, pinning, sizing)
      case 'actions':
        return resolveActionsColumn(col as DataTableActionsColumn<T>, pinning, sizing)
    }
  }

  return col as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Data column
// ---------------------------------------------------------------------------

function resolveDataColumn<T>(
  col: DataTableDataColumn<T>,
  options: ResolveColumnsOptions,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = col.key

  // Pinning
  if (col.fixed) {
    const side = col.fixed === 'left' ? 'left' : 'right'
    pinning[side]!.push(id)
  }

  // Visibility
  if (col.visible === false) {
    visibility[id] = false
  }

  // Sizing
  if (col.size != null) {
    sizing[id] = isString(col.size) ? resolvePresetSize(col.size) : col.size
  }

  const def: ColumnDef<T, unknown> = {
    accessorKey: id,
    header: col.label ?? id,
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    ...(col.size != null && { size: isString(col.size) ? resolvePresetSize(col.size) : col.size }),
    enableSorting: col.sortable ?? false,
    enableResizing: col.resizable ?? options.resizable,
    meta: {
      class: {
        td: resolveAlignClass(col.align)
      }
    }
  }

  // Merge _raw escape hatch
  if (col._raw) {
    Object.assign(def, col._raw)
  }

  return def
}

// ---------------------------------------------------------------------------
// Group column (multi-level header)
// ---------------------------------------------------------------------------

function resolveGroupColumn<T>(
  col: DataTableGroupColumn<T>,
  options: ResolveColumnsOptions,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  return {
    id: `group-${col.label ?? 'unnamed'}`,
    header: col.label ?? '',
    columns: col.children.map(child =>
      resolveColumn(child, options, pinning, visibility, sizing)
    )
  } as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Selection column
// ---------------------------------------------------------------------------

function resolveSelectionColumn<T>(
  col: DataTableSelectionColumn,
  pinning: ColumnPinningState
): ColumnDef<T, unknown> {
  const id = '__selection'
  const size = col.size ?? DATA_TABLE_DEFAULTS.selectionSize

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }
  else {
    pinning.left!.push(id)
  }

  return createSelectionColumnDef<T>(id, size, col.mode ?? 'multiple')
}

// ---------------------------------------------------------------------------
// Index column
// ---------------------------------------------------------------------------

function resolveIndexColumn<T>(
  col: DataTableIndexColumn,
  options: ResolveColumnsOptions,
  pinning: ColumnPinningState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = '__index'
  const size = col.size ?? DATA_TABLE_DEFAULTS.indexSize

  sizing[id] = size

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }

  return {
    id,
    header: col.label ?? DATA_TABLE_DEFAULTS.indexLabel,
    size,
    enableSorting: false,
    enableResizing: false,
    cell: (ctx: CellContext<T, unknown>) => {
      const rowIndex = ctx.table.getRowModel().rows.indexOf(ctx.row)
      return rowIndex + 1 + options.pageOffset
    },
    meta: {
      class: {
        td: 'text-center text-muted'
      }
    }
  } as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Expand column
// ---------------------------------------------------------------------------

function resolveExpandColumn<T>(
  col: DataTableExpandColumn,
  pinning: ColumnPinningState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = '__expand'
  const size = col.size ?? DATA_TABLE_DEFAULTS.expandSize

  sizing[id] = size

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }

  return {
    id,
    header: '',
    size,
    enableSorting: false,
    enableResizing: false,
    cell: (ctx: CellContext<T, unknown>) => {
      if (!ctx.row.getCanExpand()) return null
      return {
        component: 'expand-toggle',
        expanded: ctx.row.getIsExpanded(),
        toggle: () => ctx.row.toggleExpanded(),
        depth: ctx.row.depth
      }
    }
  } as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Actions column
// ---------------------------------------------------------------------------

function resolveActionsColumn<T>(
  col: DataTableActionsColumn<T>,
  pinning: ColumnPinningState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = '__actions'

  if (col.size != null) {
    sizing[id] = col.size
  }

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }
  else {
    pinning.right!.push(id)
  }

  return {
    id,
    header: col.label ?? DATA_TABLE_DEFAULTS.actionsLabel,
    enableSorting: false,
    enableResizing: false,
    ...(col.size != null && { size: col.size }),
    meta: {
      actions: col.actions
    }
  } as ColumnDef<T, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}
