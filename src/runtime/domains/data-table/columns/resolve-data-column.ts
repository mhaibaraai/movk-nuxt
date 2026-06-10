import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/vue-table'
import type { VNode } from 'vue'
import type {
  DataTableDataColumn,
  DataTablePinButtonContext,
  DataTableSortButtonContext
} from '../../../types/data-table'
import type { ResolveContext } from './constants'
import { h, isVNode } from 'vue'
import { resolveCallbackValue, resolveColumnFlag, resolveTemplate } from './utils'
import DataTableCellTooltip from '../components/CellTooltip.vue'
import { UButton } from '#components'
import { applyBaseState, buildClassMeta, makeColumnStyle, resolveAlignClass } from './style'
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

    // VNode 直接透传：truncate / tooltip 的字符串化包裹会把 VNode 强转为 "[object Object]"
    if (isVNode(formatted)) return formatted

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
  label: unknown,
  sortable: boolean,
  pinable: boolean,
  resizable: boolean
) {
  const actions: HeaderAction<T>[] = []
  if (pinable) actions.push(buildPinAction(col, options))
  if (sortable) actions.push(buildSortAction(col, options))
  const leading = actions.filter(a => a.position === 'leading').map(a => a.render(ctx))
  const trailing = actions.filter(a => a.position === 'trailing').map(a => a.render(ctx))

  // table-auto 下仅固定被拖列、其余列自适应会在拖拽中持续重排导致抖动。
  // 拖拽起始时把全部自适应列按当前真实渲染宽测量并锁定（整表固定，拖拽平滑、起始无跳变）；
  // 松手后释放本次临时锁定的未拖列，使其回到自适应，仅保留被拖列的固定宽。
  const startResize = (event: Event): void => {
    const th = (event.target as HTMLElement).closest('th')
    const tr = th?.closest('tr')
    const draggedId = ctx.column.id
    const tempIds: string[] = []

    if (tr) {
      const sizing = ctx.table.getState().columnSizing
      const cells = Array.from(tr.children) as HTMLElement[]
      const leafHeaders = ctx.table.getHeaderGroups().at(-1)?.headers ?? []
      const seed: Record<string, number> = { ...sizing }

      leafHeaders.forEach((header, i) => {
        const { column } = header
        const cell = cells[i]
        if (!cell || column.id in sizing || column.columnDef.size != null) return
        const w = Math.round(cell.getBoundingClientRect().width)
        if (w <= 0) return
        seed[column.id] = w
        if (column.id !== draggedId) tempIds.push(column.id)
      })

      ctx.table.setColumnSizing(seed)
    }

    if (tempIds.length > 0) {
      const tempSet = new Set(tempIds)
      const release = (): void => {
        ctx.table.setColumnSizing(prev =>
          Object.fromEntries(Object.entries(prev).filter(([id]) => !tempSet.has(id)))
        )
        window.removeEventListener('mouseup', release)
        window.removeEventListener('touchend', release)
      }
      window.addEventListener('mouseup', release)
      window.addEventListener('touchend', release)
    }

    ctx.header.getResizeHandler()(event)
  }

  const resizeHandle = resizable
    ? h('div', {
        class: 'absolute top-0 bottom-0 right-0 w-4 -mr-2 cursor-col-resize select-none touch-none flex items-center justify-center group/resize',
        onMousedown: startResize,
        onTouchstart: startResize,
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('div', {
          class: [
            'h-full transition-colors',
            ctx.column.getIsResizing()
              ? 'w-0.5 bg-primary'
              : 'w-px opacity-50 group-hover:opacity-100 bg-(--ui-border-accented) group-hover/resize:w-0.5 group-hover/resize:bg-primary'
          ].join(' ')
        })
      ])
    : null

  const labelNode = isVNode(label)
    ? label
    : h('span', { class: 'truncate' }, String(label ?? ''))

  return h('div', { class: 'flex items-center gap-1 relative group' }, [
    ...leading,
    labelNode,
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
      style: makeColumnStyle<T>(col.align)
    }
  }

  if (col._raw) Object.assign(def, col._raw)

  return def
}
