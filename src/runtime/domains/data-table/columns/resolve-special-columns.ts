import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/vue-table'
import type {
  DataTableActionsColumn,
  DataTableCheckboxContext,
  DataTableExpandButtonContext,
  DataTableExpandColumn,
  DataTableExpandToggleAllContext,
  DataTableIndexColumn,
  DataTableRowPinningButtonContext,
  DataTableRowPinningColumn,
  DataTableSelectionColumn,
  DataTableSpecialColumnBase,
  DataTableTreeSelectionStrategy
} from '../../../types/data-table'
import type { ResolveContext, SpecialColumnType } from './constants'
import { h } from 'vue'
import { isFunction } from '@movk/core'
import { SPECIAL_COLUMN_DEFAULTS } from './constants'
import { resolveCallbackValue } from './utils'
import DataTableActionsCell from '../components/ActionsCell.vue'
import { UButton, UCheckbox } from '#components'
import { applyBaseState, buildClassMeta, makeColumnStyle, resolveAlignClass } from './style'
import { renderHeaderActions } from './resolve-data-column'

interface LeafAggregate { all: boolean, some: boolean }

function computeLeafAggregate(row: { subRows: Array<{ subRows: unknown[], getIsSelected: () => boolean }> }): LeafAggregate {
  let total = 0
  let selected = 0
  const walk = (rows: typeof row.subRows): void => {
    for (const r of rows) {
      if (r.subRows.length === 0) {
        total++
        if (r.getIsSelected()) selected++
      }
      else {
        walk(r.subRows as typeof row.subRows)
      }
    }
  }
  walk(row.subRows)
  if (total === 0) return { all: false, some: false }
  return { all: selected === total, some: selected > 0 && selected < total }
}

function buildSpecialColumnDef<T>(
  col: DataTableSpecialColumnBase<T>,
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

  // 用户显式给了 minSize/maxSize（且未给 size）时不注入默认 size，让列在边界内按内容自适应
  const hasExplicitBounds = col.minSize != null || col.maxSize != null
  const resolvedSize = applyBaseState(
    id,
    col.fixed ?? defaults.fixed,
    col.size ?? (hasExplicitBounds ? undefined : defaults.size),
    ctx as ResolveContext<unknown>
  )

  if (col.visibility === false) ctx.visibility[id] = false
  ctx.allColumnIds.push(id)

  const effectivePinable = col.pinable ?? (options.pinable === true)
  // 特殊列（selection/index/expand/row-pinning/actions）不继承全局 resizable，
  // 否则表头会被包进 flex + resize handle，导致勾选框与单元格错位；需要时按列显式开启。
  const effectiveResizable = col.resizable ?? false

  ctx.flags.hasPinning ||= effectivePinable
  ctx.flags.hasResizing ||= effectiveResizable

  const effectiveAlign = col.align ?? defaults.align
  const alignClass = resolveAlignClass(effectiveAlign)

  const resolvedHeader = (effectivePinable || effectiveResizable)
    ? (hctx: HeaderContext<T, unknown>) => {
        const label = isFunction(render.header) ? render.header(hctx) : (render.header ?? '')
        return renderHeaderActions(hctx, col, options, label, false, effectivePinable, effectiveResizable)
      }
    : render.header

  const classMeta = buildClassMeta(density, alignClass, effectiveResizable, defaults.tdClass)
  // 选择列复选框命中 Nuxt UI 的 [&:has([role=checkbox])]:pe-0，右 padding 被清零，
  // 同变体覆盖为 px-0 让左右对称，使居中复选框真正居中
  const checkboxClass = type === 'selection'
    ? {
        td: [classMeta?.td, '[&:has([role=checkbox])]:px-0'].filter(Boolean).join(' '),
        th: [classMeta?.th, '[&:has([role=checkbox])]:px-0'].filter(Boolean).join(' ')
      }
    : classMeta

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
      class: checkboxClass,
      style: makeColumnStyle<T>(effectiveAlign)
    }
  }

  if (col._raw) Object.assign(def, col._raw)

  return def
}

export function resolveSelectionColumn<T>(
  col: DataTableSelectionColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  ctx.selectionMode = col.mode ?? 'multiple'
  const isTree = !!ctx.options.childrenKey
  const strategy: DataTableTreeSelectionStrategy = col.strategy ?? 'cascade'
  ctx.selectionStrategy = strategy
  if (isTree && (strategy !== 'cascade' || ctx.selectionMode === 'single')) ctx.subRowSelection = false

  const isLeafStrategy = isTree && strategy === 'leaf'

  return buildSpecialColumnDef(col, 'selection', ctx, {
    header: ctx.selectionMode === 'multiple'
      ? (hctx: HeaderContext<T, unknown>) => {
          const isIndeterminate = hctx.table.getIsSomePageRowsSelected()
          const isAllSelected = hctx.table.getIsAllPageRowsSelected()
          const cbCtx: DataTableCheckboxContext<T> = {
            scope: 'header',
            headerContext: hctx,
            isAllSelected,
            isIndeterminate
          }
          return h(UCheckbox, {
            'aria-label': 'Select all rows',
            'class': 'inline-flex',
            'modelValue': isIndeterminate ? 'indeterminate' : isAllSelected,
            'onUpdate:modelValue': (value: unknown) => hctx.table.toggleAllPageRowsSelected(!!(value as boolean | 'indeterminate')),
            ...resolveCallbackValue(col.checkboxProps ?? {}, cbCtx)
          })
        }
      : col.header ?? SPECIAL_COLUMN_DEFAULTS.selection.header!,
    cell: (cellCtx: CellContext<T, unknown>) => {
      if (isLeafStrategy && cellCtx.row.subRows.length > 0) {
        const { all, some } = computeLeafAggregate(cellCtx.row)
        const cbCtx: DataTableCheckboxContext<T> = {
          scope: 'cell',
          cellContext: cellCtx,
          isSelected: all,
          isIndeterminate: some,
          isLeafAggregate: true
        }
        return h(UCheckbox, {
          'aria-label': 'Select parent row',
          'class': 'inline-flex',
          'disabled': true,
          'modelValue': all ? true : some ? 'indeterminate' : false,
          ...resolveCallbackValue(col.checkboxProps ?? {}, cbCtx)
        })
      }
      const isCascadeParent = isTree && strategy === 'cascade' && cellCtx.row.subRows.length > 0
      const isSelected = isCascadeParent
        ? cellCtx.row.getIsSelected() || cellCtx.row.getIsAllSubRowsSelected()
        : cellCtx.row.getIsSelected()
      const isIndeterminate = isCascadeParent
        ? !isSelected && cellCtx.row.getIsSomeSelected()
        : cellCtx.row.getIsSomeSelected()
      const cbCtx: DataTableCheckboxContext<T> = {
        scope: 'cell',
        cellContext: cellCtx,
        isSelected,
        isIndeterminate,
        isLeafAggregate: false
      }
      return h(UCheckbox, {
        'aria-label': 'Select row',
        'class': 'inline-flex',
        'modelValue': isSelected ? true : isIndeterminate ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: unknown) => cellCtx.row.toggleSelected(!!(value as boolean | 'indeterminate')),
        ...resolveCallbackValue(col.checkboxProps ?? {}, cbCtx)
      })
    }
  })
}

export function resolveIndexColumn<T>(
  col: DataTableIndexColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'index', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS.index.header!,
    cell: (cellCtx: CellContext<T, unknown>) => cellCtx.row.index + 1
  })
}

export function resolveExpandColumn<T>(
  col: DataTableExpandColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  ctx.flags.hasExpand = true
  const isTreeMode = ctx.options.childrenKey != null
  const showToggleAll = col.toggleAll !== false
  return buildSpecialColumnDef(col, 'expand', ctx, {
    header: showToggleAll
      ? (hctx: HeaderContext<T, unknown>) => {
          const isAllExpanded = hctx.table.getIsAllRowsExpanded()
          const isSomeExpanded = hctx.table.getIsSomeRowsExpanded()
          const toggleCtx: DataTableExpandToggleAllContext<T> = {
            headerContext: hctx,
            isAllExpanded,
            isSomeExpanded
          }
          return h(UButton, {
            'variant': 'outline',
            'size': 'xs',
            'color': 'neutral',
            'aria-label': isAllExpanded ? 'Collapse all rows' : 'Expand all rows',
            'icon': isAllExpanded ? 'i-lucide-minus' : 'i-lucide-plus',
            'ui': {
              base: 'p-0.5 rounded-sm',
              leadingIcon: 'size-4'
            },
            'onClick': (event: Event) => {
              event.stopPropagation()
              hctx.table.toggleAllRowsExpanded()
            },
            ...resolveCallbackValue(col.toggleAllButtonProps ?? {}, toggleCtx)
          })
        }
      : undefined,
    cell: (cellCtx: CellContext<T, unknown>) => {
      if (isTreeMode && !cellCtx.row.getCanExpand()) return null

      const depth = cellCtx.row.depth
      const indentSize = ctx.options.indentSize ?? '1rem'
      const marginLeft = isTreeMode
        ? isFunction(indentSize)
          ? indentSize(cellCtx)
          : typeof indentSize === 'number'
            ? `${depth * indentSize}px`
            : depth > 0 ? `calc(${depth} * ${indentSize})` : '0px'
        : '0px'

      const isExpanded = cellCtx.row.getIsExpanded()
      const expandCtx: DataTableExpandButtonContext<T> = {
        cellContext: cellCtx,
        isExpanded,
        depth,
        canExpand: true
      }

      return h(UButton, {
        variant: 'outline',
        size: 'xs',
        color: 'neutral',
        icon: isExpanded ? 'i-lucide-minus' : 'i-lucide-plus',
        ui: {
          base: 'p-0.5 rounded-sm',
          leadingIcon: 'size-4'
        },
        style: { marginLeft },
        onClick: (event: Event) => {
          event.stopPropagation()
          cellCtx.row.toggleExpanded()
        },
        ...resolveCallbackValue(col.buttonProps ?? {}, expandCtx)
      })
    }
  })
}

export function resolveRowPinningColumn<T>(
  col: DataTableRowPinningColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'row-pinning', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS['row-pinning'].header!,
    cell: (cellCtx: CellContext<T, unknown>) => {
      const pinned = cellCtx.row.getIsPinned()
      const position = col.position ?? 'top'
      const rpCtx: DataTableRowPinningButtonContext<T> = { cellContext: cellCtx, pinned, position }

      return h(UButton, {
        'variant': 'ghost',
        'size': 'xs',
        'color': pinned ? 'primary' : 'neutral',
        'icon': 'i-lucide-star',
        'aria-label': pinned ? 'Cancel row pin' : 'Pin row',
        'onClick': (event: Event) => {
          event.stopPropagation()
          if (pinned) {
            cellCtx.row.pin(false)
            return
          }
          cellCtx.row.pin(position)
        },
        ...resolveCallbackValue(col.buttonProps ?? {}, rpCtx)
      })
    }
  })
}

export function resolveActionsColumn<T>(
  col: DataTableActionsColumn<T>,
  ctx: ResolveContext<T>
): ColumnDef<T, unknown> {
  return buildSpecialColumnDef(col, 'actions', ctx, {
    header: col.header ?? SPECIAL_COLUMN_DEFAULTS.actions.header!,
    cell: (cellCtx: CellContext<T, unknown>) =>
      h(DataTableActionsCell, { col, cellCtx, options: ctx.options } as any)
  })
}
