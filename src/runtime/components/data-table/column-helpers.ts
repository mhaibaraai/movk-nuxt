import type {
  CellContext,
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  HeaderContext,
  VisibilityState
} from '@tanstack/vue-table'
import type { VNodeChild } from 'vue'
import {
  isDataColumn,
  isGroupColumn,
  type DataTableColumn,
  type DataTableDataColumn,
  type DataTableGroupColumn,
  type DataTableProps,
  type ResolvedColumnState
} from '../../types/data-table'

import { h, ref, resolveComponent } from 'vue'
import { isFunction, isString } from '@movk/core'
// import { isDataColumn, isGroupColumn } from '../../types/data-table'
import { DATA_TABLE_DEFAULTS } from '../../constants/data-table'
import { resolveCallbackValue, resolvePresetSize } from '../../utils/data-table-utils'
import DataTableCellTooltip from './DataTableCellTooltip.vue'
import { createSelectionColumnDef } from './selection-helpers'

export function resolveColumns<T>(
  columns: DataTableColumn<T>[],
  options: DataTableProps<T>
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

function resolveColumn<T>(
  col: DataTableColumn<T>,
  options: DataTableProps<T>,
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

  // if ('type' in col) {
  //   switch (col.type) {
  //     case 'selection':
  //       return resolveSelectionColumn<T>(col as DataTableSelectionColumn, pinning)
  //     case 'index':
  //       return resolveIndexColumn(col, options, pinning, sizing)
  //     case 'expand':
  //       return resolveExpandColumn(col, options, pinning, sizing)
  //     case 'row-pinning':
  //       return resolveRowPinningColumn(col, pinning, sizing)
  //     case 'actions':
  //       return resolveActionsColumn(col as DataTableActionsColumn<T>, pinning, sizing)
  //   }
  // }

  return col as ColumnDef<T, unknown>
}

function resolveDataColumn<T>(
  col: DataTableDataColumn<T>,
  options: DataTableProps<T>,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = col.accessorKey
  const effectiveSortable = col.sortable ?? options.sortable ?? false
  const effectivePinable = col.pinable ?? options.pinable ?? false

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }

  if (col.visibility === false) {
    visibility[id] = false
  }

  if (col.size != null) {
    sizing[id] = isString(col.size) ? resolvePresetSize(col.size) : col.size
  }

  const effectiveTooltip = col.tooltip ?? options.tooltip
  const effectiveResizable = col.resizable ?? options.resizable
  const needCustomCell = !!(col.cell || effectiveTooltip || col.emptyCell !== undefined || options.emptyCell !== false)

  const def: ColumnDef<T, unknown> = {
    accessorKey: id,
    header: (effectiveSortable || effectivePinable || effectiveResizable)
      ? (ctx: HeaderContext<T, unknown>) => renderHeaderActions(ctx, col.header ?? id, effectiveSortable, effectivePinable, effectiveResizable)
      : (col.header ?? id),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    ...(col.size != null && { size: isString(col.size) ? resolvePresetSize(col.size) : col.size }),
    enableSorting: effectiveSortable,
    enablePinning: effectivePinable,
    enableResizing: col.resizable ?? options.resizable,
    ...(needCustomCell && {
      cell: (ctx: CellContext<T, unknown>) => {
        const raw = ctx.getValue()
        const emptyText = col.emptyCell !== undefined ? col.emptyCell : options.emptyCell

        if ((raw == null || raw === '') && emptyText !== false) {
          return emptyText ?? null
        }

        const formatted = col.formatter
          ? col.formatter(raw as T[keyof T & string], ctx.row.original, ctx.row.index)
          : String(raw ?? '')

        if (!effectiveTooltip) return formatted

        const lines = effectiveTooltip === true ? undefined : effectiveTooltip
        const effectiveTooltipProps = {
          ...(options.tooltipProps ?? {}),
          ...(col.tooltipProps ?? {})
        }

        return h(DataTableCellTooltip, {
          text: formatted,
          lines,
          ...effectiveTooltipProps
        })
      }
    }),
    meta: {
      class: {
        td: resolveAlignClass(col.align),
        ...(effectiveResizable && { th: 'relative' })
      },
      style: columnSizeStyle()
    }
  }

  if (col._raw) {
    Object.assign(def, col._raw)
  }

  return def
}

function resolveGroupColumn<T>(
  col: DataTableGroupColumn<T>,
  options: DataTableProps<T>,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  return {
    id: `group-${col.header ?? 'unnamed'}`,
    header: col.header ?? '',
    columns: col.children?.map(child =>
      resolveColumn(child, options, pinning, visibility, sizing)
    )
  } as ColumnDef<T, unknown>
}

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

function resolveIndexColumn<T>(
  col: DataTableIndexColumn,
  options: DataTableProps<T>,
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
      },
      style: columnSizeStyle()
    }
  } as ColumnDef<T, unknown>
}

function resolveExpandColumn<T>(
  col: DataTableExpandColumn,
  options: DataTableProps<T>,
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
      return h(resolveComponent('UButton'), {
        icon: ctx.row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
        variant: 'ghost',
        size: 'xs',
        color: 'neutral',
        style: { marginLeft: `${ctx.row.depth * options.indentSize}px` },
        onClick: (event: Event) => {
          event.stopPropagation()
          ctx.row.toggleExpanded()
        }
      })
    },
    meta: { style: columnSizeStyle() }
  } as ColumnDef<T, unknown>
}

function resolveRowPinningColumn<T>(
  col: DataTableRowPinningColumn,
  pinning: ColumnPinningState,
  sizing: ColumnSizingState
): ColumnDef<T, unknown> {
  const id = '__row_pinning'
  const size = col.size ?? DATA_TABLE_DEFAULTS.selectionSize

  sizing[id] = size

  if (col.fixed) {
    pinning[col.fixed === 'left' ? 'left' : 'right']!.push(id)
  }
  else {
    pinning.left!.push(id)
  }

  return {
    id,
    header: '',
    size,
    enableSorting: false,
    enableResizing: false,
    cell: (ctx: CellContext<T, unknown>) => {
      const pinned = ctx.row.getIsPinned()
      const defaultPosition = col.position ?? 'top'

      return h(resolveComponent('UButton'), {
        'icon': pinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
        'variant': 'ghost',
        'size': 'xs',
        'color': pinned ? 'primary' : 'neutral',
        'aria-label': pinned ? '取消固定行' : '固定行',
        'onClick': (event: Event) => {
          event.stopPropagation()
          if (pinned) {
            ctx.row.pin(false)
            return
          }

          ctx.row.pin(defaultPosition)
        }
      })
    },
    meta: {
      class: {
        td: 'text-center',
        th: 'text-center'
      },
      style: columnSizeStyle()
    }
  } as ColumnDef<T, unknown>
}

/**
 * 渲染带二次确认气泡的操作按钮
 * 使用 UPopover 包裹触发按钮，content slot 提供确认面板
 */
function renderConfirmAction<T>(
  action: import('../../types/data-table').DataTableAction<T>,
  row: T,
  rowIndex: number,
  actionIndex: number,
  stateMap: Map<string, ReturnType<typeof ref<boolean>>>
) {
  const key = `${rowIndex}-${actionIndex}`
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(false))
  }
  const open = stateMap.get(key)!

  const confirmConfig = typeof action.confirm === 'string'
    ? { title: action.confirm, description: undefined }
    : action.confirm!

  return h(resolveComponent('UPopover'), {
    'open': open.value,
    'onUpdate:open': (v: boolean) => { open.value = v }
  }, {
    default: () => h(resolveComponent('UButton'), {
      label: action.label,
      icon: action.icon,
      color: (action.color ?? 'neutral') as 'neutral',
      variant: 'ghost',
      size: 'xs',
      disabled: resolveCallbackValue(action.disabled ?? false, row),
      onClick: () => { open.value = true }
    }),
    content: () => h('div', { class: 'p-3 flex flex-col gap-2 max-w-55' }, [
      h('p', { class: 'text-sm font-medium text-highlighted' }, confirmConfig.title),
      confirmConfig.description
        ? h('p', { class: 'text-xs text-muted' }, confirmConfig.description)
        : null,
      h('div', { class: 'flex justify-end gap-2 mt-1' }, [
        h(resolveComponent('UButton'), {
          label: '取消',
          color: 'neutral',
          variant: 'ghost',
          size: 'xs',
          onClick: () => { open.value = false }
        }),
        h(resolveComponent('UButton'), {
          label: '确认',
          color: (action.color ?? 'primary') as 'primary',
          size: 'xs',
          onClick: () => {
            open.value = false
            action.onClick(row, rowIndex)
          }
        })
      ])
    ])
  })
}

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

  // 每个 action 实例独立的 open 状态，key = "${rowIndex}-${actionIndex}"
  const confirmStateMap = new Map<string, ReturnType<typeof ref<boolean>>>()

  return {
    id,
    header: col.label ?? DATA_TABLE_DEFAULTS.actionsLabel,
    enableSorting: false,
    enableResizing: false,
    ...(col.size != null && { size: col.size }),
    cell: (ctx: CellContext<T, unknown>) => {
      const row = ctx.row.original
      const index = ctx.row.index
      const actionList = isFunction(col.actions) ? col.actions(row) : col.actions
      const visibleActions = actionList.filter(a =>
        !resolveCallbackValue(a.hidden ?? false, row)
      )

      if (visibleActions.length === 0) return null

      return h('div', { class: 'flex items-center gap-1' },
        visibleActions.map((action, actionIndex) =>
          action.confirm
            ? renderConfirmAction(action, row, index, actionIndex, confirmStateMap)
            : h(resolveComponent('UButton'), {
                label: action.label,
                icon: action.icon,
                color: (action.color ?? 'neutral') as 'neutral',
                variant: 'ghost',
                size: 'xs',
                disabled: resolveCallbackValue(action.disabled ?? false, row),
                onClick: () => action.onClick(row, index)
              })
        )
      )
    },
    ...(col.size != null && {
      meta: {
        style: columnSizeStyle()
      }
    })
  } as ColumnDef<T, unknown>
}

function resolveAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}

function columnSizeStyle() {
  return {
    th: (ctx: { column: { getSize: () => number } }) => ({ width: `${ctx.column.getSize()}px` }),
    td: (ctx: { column: { getSize: () => number } }) => ({ width: `${ctx.column.getSize()}px` })
  }
}

function renderHeaderActions<T>(
  ctx: HeaderContext<T, unknown>,
  label: string,
  sortable: boolean,
  pinable: boolean,
  resizable: boolean
) {
  const nodes: VNodeChild[] = []

  if (sortable) {
    const isSorted = ctx.column.getIsSorted()
    nodes.push(h(resolveComponent('UButton'), {
      color: 'neutral',
      variant: 'ghost',
      label,
      icon: isSorted
        ? (isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow')
        : 'i-lucide-arrow-up-down',
      class: '-mx-2.5',
      onClick: () => ctx.column.toggleSorting(ctx.column.getIsSorted() === 'asc')
    }))
  }
  else {
    nodes.push(h('span', label))
  }

  if (pinable) {
    const pinned = ctx.column.getIsPinned()
    nodes.push(h(resolveComponent('UButton'), {
      'color': pinned ? 'primary' : 'neutral',
      'variant': 'ghost',
      'size': 'xs',
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
    }))
  }

  if (resizable) {
    const handler = ctx.header.getResizeHandler()
    nodes.push(h('div', {
      class: 'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize select-none touch-none opacity-0 hover:opacity-100 bg-accented',
      onMousedown: handler,
      onTouchstart: handler,
      onClick: (e: Event) => e.stopPropagation()
    }))
  }

  if (nodes.length === 1 && !resizable) {
    return nodes[0]
  }

  return h('div', { class: 'flex items-center gap-1' }, nodes)
}
