import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/vue-table'
import type { VNode } from 'vue'
import type {
  DataTableDataColumn,
  DataTablePinButtonContext,
  DataTableSortButtonContext
} from '../../../types/data-table'
import type { ResolveContext } from './constants'
import { h } from 'vue'
import { resolveCallbackValue, resolveColumnFlag, resolveTemplate } from './utils'
import DataTableCellTooltip from '../../../components/data-table-renderer/DataTableRendererCellTooltip.vue'
import { UButton } from '#components'
import { applyBaseState, buildClassMeta, COLUMN_SIZE_STYLE, resolveAlignClass } from './style'
import type { DataTableProps } from '../../../types/data-table/component'

interface HeaderAction<T> {
  id: string
  position: 'leading' | 'trailing'
  render: (ctx: HeaderContext<T, unknown>) => VNode | null
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

function buildSortAction<T>(
  col: Pick<DataTableDataColumn<T>, 'sortButtonProps'>,
  options: DataTableProps<T>
): HeaderAction<T> {
  return {
    id: 'sort',
    position: 'trailing',
    render: (ctx) => {
      const isSorted = ctx.column.getIsSorted()
      const sortCtx: DataTableSortButtonContext<T> = { isSorted, headerContext: ctx }
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
        icon,
        onClick: ctx.column.getToggleSortingHandler(),
        ...resolveCallbackValue(options.sortButtonProps ?? {}, sortCtx),
        ...resolveCallbackValue(col.sortButtonProps ?? {}, sortCtx)
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
      const pinCtx: DataTablePinButtonContext<T> = { pinned, headerContext: ctx }
      return h(UButton, {
        'size': 'xs',
        'variant': 'ghost',
        'color': pinned ? 'primary' : 'neutral',
        'class': pinned ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
        'icon': pinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
        'aria-label': pinned ? 'Cancel column pin' : 'Pin column',
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
          const th = (event.target as HTMLElement).closest('th')
          if (th) {
            const w = Math.ceil(th.getBoundingClientRect().width)
            if (w > 0) ctx.table.setColumnSizing(prev => ({ ...prev, [ctx.column.id]: w }))
          }
          ctx.column.pin('left')
        },
        ...resolveCallbackValue(options.pinButtonProps ?? {}, pinCtx),
        ...resolveCallbackValue(col.pinButtonProps ?? {}, pinCtx)
      })
    }
  }
}

export function renderHeaderActions<T>(
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

export function resolveDataColumn<T>(
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

  if (col.visibility === false) ctx.visibility[id] = false
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
      class: buildClassMeta<T, unknown>(density, resolveAlignClass(col.align), effectiveResizable),
      style: COLUMN_SIZE_STYLE
    }
  }

  if (col._raw) Object.assign(def, col._raw)

  return def
}
