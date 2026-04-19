import type {
  Cell,
  CellContext,
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  Header,
  HeaderContext,
  VisibilityState
} from '@tanstack/vue-table'
import type { Component, VNode } from 'vue'
import type {
  DataTableActionsColumn,
  DataTableColumn,
  DataTableDataColumn,
  DataTableDensityOptions,
  DataTableExpandColumn,
  DataTableGroupColumn,
  DataTableIndexColumn,
  DataTableProps,
  DataTableRowPinningColumn,
  DataTableSelectionColumn,
  DataTableSizePreset,
  DataTableSpecialColumnBase,
  ResolvedColumnState
} from '../../types/data-table'
import type { SpecialColumnType } from '../../constants/data-table'
import { h } from 'vue'
import { isFunction, isString } from '@movk/core'
import { isDataColumn, isGroupColumn } from '../../types/data-table'
import { DENSITY_PRESETS, SPECIAL_COLUMN_DEFAULTS } from '../../constants/data-table'
import { resolveCallbackValue, resolveColumnFlag, resolvePresetSize, resolveTemplate } from '../../utils/data-table-utils'
import DataTableCellTooltip from './DataTableCellTooltip.vue'
import DataTableActionConfirm from './DataTableActionConfirm.vue'
import { UButton, UCheckbox } from '#components'

interface HeaderAction<T> {
  id: string
  position: 'leading' | 'trailing'
  render: (ctx: HeaderContext<T, unknown>) => VNode | null
}

interface ResolveContext<T> {
  options: DataTableProps<T>
  density: DataTableDensityOptions | null
  pinning: ColumnPinningState
  visibility: VisibilityState
  sizing: ColumnSizingState
  flags: { hasPinning: boolean, hasResizing: boolean, hasSort: boolean, hasExpand: boolean }
  selectionMode?: 'single' | 'multiple'
  nextGroupId: () => number
  allColumnIds: string[]
}

function resolveColumnSize<T>(ctx: Header<T, unknown> | Cell<T, unknown>): Record<string, string> {
  const { columnDef } = ctx.column

  if (columnDef.size != ctx.getContext().table._getDefaultColumnDef().size || columnDef.enableResizing === true) {
    const w = `${ctx.column.getSize()}px`
    return { width: w, minWidth: w, maxWidth: w }
  }

  const style: Record<string, string> = {}
  if (columnDef.minSize != null) style.minWidth = `${columnDef.minSize}px`
  if (columnDef.maxSize != null) style.maxWidth = `${columnDef.maxSize}px`
  return style
}

const COLUMN_SIZE_STYLE = { th: resolveColumnSize, td: resolveColumnSize }

function applyBaseState(
  id: string,
  fixed: 'left' | 'right' | undefined,
  size: number | string | undefined,
  ctx: ResolveContext<unknown>
): number | undefined {
  if (fixed) {
    ctx.pinning[fixed]!.push(id)
  }

  const resolvedSize = size != null
    ? (isString(size) ? resolvePresetSize(size as DataTableSizePreset) : size)
    : undefined

  if (resolvedSize != null) {
    ctx.sizing[id] = resolvedSize
  }

  return resolvedSize
}

function resolveAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}

function buildClassMeta(
  density: DataTableDensityOptions | null,
  align?: string,
  resizable?: boolean,
  tdClass?: string
): { td?: string, th?: string } {
  return {
    td: [align, density?.td, tdClass].filter(Boolean).join(' ') || undefined,
    th: [resizable ? 'relative' : '', align, density?.th].filter(Boolean).join(' ') || undefined
  }
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
    allColumnIds: ctx.allColumnIds
  }
}

function resolveColumn<T>(
  col: DataTableColumn<T>,
  ctx: ResolveContext<T>,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  if (isGroupColumn(col)) return resolveGroupColumn(col, ctx, inheritedFixed)
  if (isDataColumn(col)) return resolveDataColumn(col, ctx, inheritedFixed)

  if ('type' in col) {
    switch (col.type) {
      case 'selection':
        return resolveSelectionColumn(col as DataTableSelectionColumn, ctx)
      case 'index':
        return resolveIndexColumn(col as DataTableIndexColumn, ctx)
      case 'expand':
        return resolveExpandColumn(col as DataTableExpandColumn, ctx)
      case 'row-pinning':
        return resolveRowPinningColumn(col as DataTableRowPinningColumn, ctx)
      case 'actions':
        return resolveActionsColumn(col as DataTableActionsColumn<T>, ctx)
    }
  }

  return col as ColumnDef<T, unknown>
}

function buildDataCellRenderer<T>(
  col: DataTableDataColumn<T>,
  options: DataTableProps<T>
): ((ctx: CellContext<T, unknown>) => unknown) | undefined {
  const maybeTooltip = col.tooltip !== undefined ? !!col.tooltip : !!options.tooltip
  const maybeTruncate = col.truncate !== undefined ? !!col.truncate : !!options.truncate
  const needCustomCell = !!(col.cell || maybeTooltip || maybeTruncate || col.emptyCell !== undefined || options.emptyCell !== false)
  if (!needCustomCell) return undefined

  return (ctx: CellContext<T, unknown>) => {
    const raw = ctx.getValue()
    const emptyText = col.emptyCell !== undefined ? col.emptyCell : options.emptyCell

    if ((raw == null || raw === '') && emptyText !== false) {
      return emptyText != null ? resolveTemplate(emptyText, ctx) : null
    }

    const formatted = col.cell
      ? resolveTemplate(col.cell, ctx)
      : String(raw ?? '')

    const tooltipRaw = col.tooltip !== undefined ? col.tooltip : options.tooltip
    const tooltipVal = resolveCallbackValue(tooltipRaw, ctx)

    if (tooltipVal) {
      return h(DataTableCellTooltip, {
        text: String(formatted ?? ''),
        lines: tooltipVal === true ? undefined : tooltipVal,
        ...(options.tooltipProps ?? {}),
        ...(col.tooltipProps ?? {})
      })
    }

    const truncateRaw = col.truncate !== undefined ? col.truncate : options.truncate
    const truncateVal = resolveCallbackValue(truncateRaw, ctx)

    if (truncateVal) {
      if (truncateVal === true) {
        return h('div', { class: 'truncate' }, String(formatted ?? ''))
      }
      return h('div', {
        style: {
          '-webkit-line-clamp': truncateVal,
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
          'white-space': 'normal',
          'word-break': 'break-all'
        }
      }, String(formatted ?? ''))
    }

    return formatted
  }
}

function resolveDataColumn<T>(
  col: DataTableDataColumn<T>,
  ctx: ResolveContext<T>,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  const { options, density } = ctx
  const id = col.accessorKey
  const effectiveSortable = resolveColumnFlag(col.sortable, options.sortable, col)
  const effectivePinable = resolveColumnFlag(col.pinable, options.pinable, col)
  const effectiveResizable = resolveColumnFlag(col.resizable, options.resizable, col)

  ctx.flags.hasPinning ||= effectivePinable
  ctx.flags.hasResizing ||= effectiveResizable
  ctx.flags.hasSort ||= effectiveSortable

  const resolvedSize = applyBaseState(id, col.fixed ?? inheritedFixed, col.size, ctx as ResolveContext<unknown>)

  if (col.visibility === false) {
    ctx.visibility[id] = false
  }
  ctx.allColumnIds.push(id)

  const cellRenderer = buildDataCellRenderer(col, options)

  const def: ColumnDef<T, unknown> = {
    accessorKey: id,
    header: (effectiveSortable || effectivePinable || effectiveResizable)
      ? (hctx: HeaderContext<T, unknown>) => renderHeaderActions(hctx, col, options, col.header ?? id, effectiveSortable, effectivePinable, effectiveResizable)
      : (col.header ?? id),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    ...(resolvedSize != null && { size: resolvedSize }),
    enableSorting: effectiveSortable,
    enablePinning: effectivePinable,
    enableResizing: effectiveResizable,
    ...(cellRenderer && { cell: cellRenderer }),
    meta: {
      class: buildClassMeta(density, resolveAlignClass(col.align), effectiveResizable),
      style: COLUMN_SIZE_STYLE
    }
  }

  if (col._raw) {
    Object.assign(def, col._raw)
  }

  return def
}

function resolveGroupColumn<T>(
  col: DataTableGroupColumn<T>,
  ctx: ResolveContext<T>,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  const effectiveFixed = col.fixed ?? inheritedFixed
  const resolvedSize = col.size != null
    ? (isString(col.size) ? resolvePresetSize(col.size) : col.size)
    : undefined

  return {
    id: `group-${ctx.nextGroupId()}-${col.header ?? 'unnamed'}`,
    header: col.header,
    ...(resolvedSize != null && { size: resolvedSize }),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    columns: col.children?.map(child =>
      resolveColumn(child, ctx, effectiveFixed)
    ),
    meta: {
      class: {
        th: resolveAlignClass(col.align) || undefined
      },
      style: {
        th: (header: Header<T, unknown>) => groupHeaderStyle(header, effectiveFixed)
      }
    }
  } as ColumnDef<T, unknown>
}

function buildSpecialColumnDef<T>(
  col: DataTableSpecialColumnBase,
  type: SpecialColumnType,
  ctx: ResolveContext<T>,
  render: {
    cell: (cellCtx: CellContext<T, unknown>) => unknown
    header: string | undefined | ((hctx: HeaderContext<T, unknown>) => unknown)
  }
): ColumnDef<T, unknown> {
  const defaults = SPECIAL_COLUMN_DEFAULTS[type]
  const { options, density } = ctx
  const { id } = defaults

  const resolvedSize = applyBaseState(
    id,
    col.fixed ?? defaults.fixed,
    col.size ?? defaults.size,
    ctx as ResolveContext<unknown>
  )

  if (col.visibility === false) {
    ctx.visibility[id] = false
  }
  ctx.allColumnIds.push(id)

  const effectivePinable = col.pinable ?? (options.pinable === true)
  const effectiveResizable = col.resizable ?? (options.resizable === true)

  ctx.flags.hasPinning ||= effectivePinable
  ctx.flags.hasResizing ||= effectiveResizable

  const alignClass = resolveAlignClass(col.align ?? defaults.align)

  const resolvedHeader = (effectivePinable || effectiveResizable)
    ? (hctx: HeaderContext<T, unknown>) => {
        const label = isString(render.header) ? render.header : ''
        return renderHeaderActions(hctx, col, options, label, false, effectivePinable, effectiveResizable)
      }
    : render.header

  const def: ColumnDef<T, unknown> = {
    id,
    header: resolvedHeader,
    ...(resolvedSize != null && { size: resolvedSize }),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    enableSorting: false,
    enableResizing: effectiveResizable,
    enablePinning: effectivePinable,
    cell: render.cell,
    meta: {
      class: buildClassMeta(density, alignClass, effectiveResizable, defaults.tdClass),
      style: COLUMN_SIZE_STYLE
    }
  }

  if (col._raw) {
    Object.assign(def, col._raw)
  }

  return def
}

function resolveSelectionColumn<T>(
  col: DataTableSelectionColumn,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  ctx.selectionMode = col.mode ?? 'multiple'
  return buildSpecialColumnDef(
    col, 'selection', ctx, {
      header: ctx.selectionMode === 'multiple'
        ? ({ table }: HeaderContext<T, unknown>) => h(UCheckbox, {
            ...(col.checkboxProps ?? {}),
            'aria-label': '选择所有行',
            'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
            'onUpdate:modelValue': (value: unknown) => table.toggleAllPageRowsSelected(!!(value as boolean | 'indeterminate'))
          })
        : col.header ?? SPECIAL_COLUMN_DEFAULTS.selection.header!,
      cell: ({ row }: CellContext<T, unknown>) => h(UCheckbox, {
        ...(col.checkboxProps ?? {}),
        'aria-label': `选择行`,
        'modelValue': row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: unknown) => row.toggleSelected(!!(value as boolean | 'indeterminate'))
      })
    }
  )
}

function resolveIndexColumn<T>(
  col: DataTableIndexColumn,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'index', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS.index.header!,
    cell: (cellCtx: CellContext<T, unknown>) => cellCtx.row.index + 1
  })
}

function resolveExpandColumn<T>(
  col: DataTableExpandColumn,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  ctx.flags.hasExpand = true
  return buildSpecialColumnDef(col, 'expand', ctx, {
    header: undefined,
    cell: (cellCtx: CellContext<T, unknown>) => {
      if (!cellCtx.row.getCanExpand()) return null

      const indentSize = ctx.options.indentSize ?? '1rem'
      const marginLeft = isFunction(indentSize)
        ? indentSize(cellCtx)
        : typeof indentSize === 'number'
          ? `${cellCtx.row.depth * indentSize}px`
          : cellCtx.row.depth > 0 ? `calc(${cellCtx.row.depth} * ${indentSize})` : '0px'

      return h(UButton, {
        variant: 'ghost',
        size: 'xs',
        color: 'neutral',
        ...(col.buttonProps ?? {}),
        icon: cellCtx.row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
        style: { marginLeft },
        onClick: (event: Event) => {
          event.stopPropagation()
          cellCtx.row.toggleExpanded()
        }
      })
    }
  })
}

function resolveRowPinningColumn<T>(
  col: DataTableRowPinningColumn,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'row-pinning', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS['row-pinning'].header!,
    cell: (cellCtx: CellContext<T, unknown>) => {
      const pinned = cellCtx.row.getIsPinned()
      const position = col.position ?? 'top'

      return h(UButton, {
        'variant': 'ghost',
        'size': 'xs',
        'color': pinned ? 'primary' : 'neutral',
        ...(col.buttonProps ?? {}),
        'icon': 'i-lucide-star',
        'aria-label': pinned ? '取消固定行' : '固定行',
        'onClick': (event: Event) => {
          event.stopPropagation()
          if (pinned) {
            cellCtx.row.pin(false)
            return
          }
          cellCtx.row.pin(position)
        }
      })
    }
  })
}

function resolveActionsColumn<T>(
  col: DataTableActionsColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'actions', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS.actions.header!,
    cell: (cellCtx: CellContext<T, unknown>) => {
      const row = cellCtx.row.original
      const index = cellCtx.row.index
      const actionList = resolveCallbackValue(col.actions, row)
      const visibleActions = actionList.filter(a =>
        resolveCallbackValue(a.visibility ?? true, row)
      )

      if (visibleActions.length === 0) return null

      return h('div', { class: 'flex items-center gap-1' },
        visibleActions.map((action) => {
          if (action.popover) {
            return h(DataTableActionConfirm as Component, { action, row, rowIndex: index })
          }
          const { onClick: _click, disabled: _disabled, visibility: _vis, popover: _pop, popoverProps: _pProps, ...buttonProps } = action
          return h(UButton, {
            variant: 'ghost',
            size: 'xs',
            color: 'neutral',
            ...buttonProps,
            disabled: resolveCallbackValue(action.disabled ?? false, row),
            onClick: () => action.onClick(row, index)
          })
        })
      )
    }
  })
}

function getFirstLeafHeader<T>(header: Header<T, unknown>): Header<T, unknown> {
  return header.subHeaders.length
    ? getFirstLeafHeader(header.subHeaders[0]!)
    : header
}

function getLastLeafHeader<T>(header: Header<T, unknown>): Header<T, unknown> {
  return header.subHeaders.length
    ? getLastLeafHeader(header.subHeaders[header.subHeaders.length - 1]!)
    : header
}

function groupHeaderStyle<T>(header: Header<T, unknown>, fixed?: 'left' | 'right'): Record<string, string> {
  const w = `${header.getSize()}px`
  const style: Record<string, string> = { width: w, minWidth: w }
  const pinned = fixed ?? header.column.getIsPinned()

  if (pinned === 'left') {
    const first = getFirstLeafHeader(header)
    style.position = 'sticky'
    style.left = `${first.column.getStart('left')}px`
  }
  else if (pinned === 'right') {
    const last = getLastLeafHeader(header)
    style.position = 'sticky'
    style.right = `${last.column.getAfter('right')}px`
  }

  return style
}

function buildSortAction<T>(
  col: Pick<DataTableDataColumn<T>, 'sortButtonProps'>,
  options: DataTableProps<T>
): HeaderAction<T> {
  return {
    id: 'sort',
    position: 'trailing',
    render: (ctx) => {
      const isSorted = ctx.column.getIsSorted()
      const icon = isSorted === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : isSorted === 'desc'
          ? 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down'
      return h(UButton, {
        size: 'xs',
        variant: 'ghost',
        color: 'neutral',
        class: isSorted ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
        ...(options.sortButtonProps ?? {}),
        ...(col.sortButtonProps ?? {}),
        icon,
        onClick: ctx.column.getToggleSortingHandler()
      })
    }
  }
}

function buildPinAction<T>(
  col: Pick<DataTableDataColumn<T>, 'pinButtonProps'>,
  options: DataTableProps<T>
): HeaderAction<T> {
  return {
    id: 'pin',
    position: 'leading',
    render: (ctx) => {
      const pinned = ctx.column.getIsPinned()
      return h(UButton, {
        'size': 'xs',
        'variant': 'ghost',
        'color': pinned ? 'primary' : 'neutral',
        'class': pinned ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
        ...(options.pinButtonProps ?? {}),
        ...(col.pinButtonProps ?? {}),
        'icon': pinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
        'aria-label': pinned ? '取消固定列' : '固定列',
        'onClick': (event: Event) => {
          event.stopPropagation()
          if (pinned === 'left') {
            ctx.column.pin('right')
            return
          }
          if (pinned === 'right') {
            ctx.column.pin(false)
            return
          }
          ctx.column.pin('left')
        }
      })
    }
  }
}

function renderHeaderActions<T>(
  ctx: HeaderContext<T, unknown>,
  col: Pick<DataTableDataColumn<T>, 'pinButtonProps' | 'sortButtonProps'>,
  options: DataTableProps<T>,
  label: string,
  sortable: boolean,
  pinable: boolean,
  resizable: boolean
) {
  const actions: HeaderAction<T>[] = []
  if (pinable) actions.push(buildPinAction(col, options))
  if (sortable) actions.push(buildSortAction(col, options))
  const leading = actions.filter(a => a.position === 'leading').map(a => a.render(ctx))
  const trailing = actions.filter(a => a.position === 'trailing').map(a => a.render(ctx))

  const resizeHandle = resizable
    ? h('div', {
        class: 'absolute top-0 bottom-0 right-0 w-4 -mr-2 cursor-col-resize select-none touch-none flex items-center justify-center',
        onMousedown: ctx.header.getResizeHandler(),
        onTouchstart: ctx.header.getResizeHandler(),
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('div', {
          class: [
            'w-px h-full transition-colors',
            ctx.column.getIsResizing()
              ? 'bg-primary'
              : 'opacity-0 group-hover:opacity-100 bg-(--ui-border-accented)'
          ].join(' ')
        })
      ])
    : null

  return h('div', { class: 'flex items-center gap-1 relative group' }, [
    ...leading,
    h('span', { class: 'truncate' }, String(label)),
    ...trailing,
    resizeHandle
  ])
}
