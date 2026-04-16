import type {
  CellContext,
  ColumnDef,
  ColumnPinningState,
  ColumnSizingState,
  Header,
  HeaderContext,
  VisibilityState
} from '@tanstack/vue-table'
import type { VNode } from 'vue'
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
  ResolvedColumnState
} from '../../types/data-table'
import { h, ref, resolveComponent } from 'vue'
import { isFunction, isString } from '@movk/core'
import { isDataColumn, isGroupColumn } from '../../types/data-table'
import { DATA_TABLE_DEFAULTS, DENSITY_PRESETS } from '../../constants/data-table'
import { resolveCallbackValue, resolveColumnFlag, resolvePresetSize, resolveTemplate } from '../../utils/data-table-utils'
import DataTableCellTooltip from './DataTableCellTooltip.vue'
import { createSelectionColumnDef } from './selection-helpers'
import { UButton } from '#components'

interface HeaderAction<T> {
  id: 'sort' | 'pin' | string
  position: 'leading' | 'trailing'
  render: (ctx: HeaderContext<T, unknown>) => VNode | null
}

interface BaseStateInput {
  id: string
  fixed?: 'left' | 'right'
  defaultFixed?: 'left' | 'right'
  size?: number | DataTableSizePreset
  defaultSize?: number
}

// 将列的 fixed/size 写入 pinning/sizing 初始状态
function applyBaseState(
  input: BaseStateInput,
  pinning: ColumnPinningState,
  sizing: ColumnSizingState
): { resolvedSize: number | undefined } {
  const effectiveFixed = input.fixed ?? input.defaultFixed
  if (effectiveFixed) {
    pinning[effectiveFixed === 'left' ? 'left' : 'right']!.push(input.id)
  }

  const rawSize = input.size ?? input.defaultSize
  const resolvedSize = rawSize != null
    ? (isString(rawSize) ? resolvePresetSize(rawSize) : rawSize)
    : undefined

  if (resolvedSize != null) {
    sizing[input.id] = resolvedSize
  }

  return { resolvedSize }
}

// 将用户定义的列数组解析为 TanStack ColumnDef 及初始状态
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

// 按列类型分发到对应的解析函数
function resolveColumn<T>(
  col: DataTableColumn<T>,
  options: DataTableProps<T>,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  if (isGroupColumn(col)) {
    return resolveGroupColumn(col, options, pinning, visibility, sizing, inheritedFixed)
  }

  if (isDataColumn(col)) {
    return resolveDataColumn(col, options, pinning, visibility, sizing, inheritedFixed)
  }

  // if ('type' in col) {
  //   switch (col.type) {
  //     case 'selection':
  //       return resolveSelectionColumn<T>(col as DataTableSelectionColumn, pinning, sizing)
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

// 将数据列配置解析为带 cell/header/meta 的 ColumnDef
function resolveDataColumn<T>(
  col: DataTableDataColumn<T>,
  options: DataTableProps<T>,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  const id = col.accessorKey
  const effectiveSortable = resolveColumnFlag(col.sortable, options.sortable, col)
  const effectivePinable = resolveColumnFlag(col.pinable, options.pinable, col)
  const effectiveResizable = resolveColumnFlag(col.resizable, options.resizable, col)

  const { resolvedSize } = applyBaseState(
    { id, fixed: col.fixed ?? inheritedFixed, size: col.size },
    pinning,
    sizing
  )

  if (col.visibility === false) {
    visibility[id] = false
  }

  // 列定义期判断：只要全局或列级有可能启用 tooltip/truncate，就进入自定义 cell 路径
  // 函数形式恒为 truthy，静态 false 则跳过
  const maybeTooltip = col.tooltip !== undefined ? !!col.tooltip : !!options.tooltip
  const maybeTruncate = col.truncate !== undefined ? !!col.truncate : !!options.truncate
  const needCustomCell = !!(col.cell || maybeTooltip || maybeTruncate || col.emptyCell !== undefined || options.emptyCell !== false)

  const densityClass = resolveDensityClass(options)

  const def: ColumnDef<T, unknown> = {
    accessorKey: id,
    header: (effectiveSortable || effectivePinable || effectiveResizable)
      ? (ctx: HeaderContext<T, unknown>) => renderHeaderActions(ctx, col, options, effectiveSortable, effectivePinable, effectiveResizable)
      : (col.header ?? id),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    ...(resolvedSize != null && { size: resolvedSize }),
    enableSorting: effectiveSortable,
    enablePinning: effectivePinable,
    enableResizing: effectiveResizable,
    ...(needCustomCell && {
      cell: (ctx: CellContext<T, unknown>) => {
        const raw = ctx.getValue()
        const emptyText = col.emptyCell !== undefined ? col.emptyCell : options.emptyCell

        if ((raw == null || raw === '') && emptyText !== false) {
          return emptyText != null ? resolveTemplate(emptyText, ctx) : null
        }

        const formatted = col.cell
          ? resolveTemplate(col.cell, ctx)
          : String(raw ?? '')

        // cell 渲染期：按上下文求值 tooltip 与 truncate
        const tooltipRaw = col.tooltip !== undefined ? col.tooltip : options.tooltip
        const tooltipVal = typeof tooltipRaw === 'function' ? tooltipRaw(ctx) : tooltipRaw

        const truncateRaw = col.truncate !== undefined ? col.truncate : options.truncate
        const truncateVal = typeof truncateRaw === 'function' ? truncateRaw(ctx) : truncateRaw

        if (tooltipVal) {
          const lines = tooltipVal === true ? undefined : tooltipVal
          const effectiveTooltipProps = {
            ...(options.tooltipProps ?? {}),
            ...(col.tooltipProps ?? {})
          }
          return h(DataTableCellTooltip, {
            text: String(formatted ?? ''),
            lines,
            ...effectiveTooltipProps
          })
        }

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
    }),
    meta: {
      class: {
        td: [resolveAlignClass(col.align), densityClass?.td].filter(Boolean).join(' ') || undefined,
        th: [effectiveResizable ? 'relative' : '', densityClass?.th].filter(Boolean).join(' ') || undefined
      },
      style: columnSizeStyle()
    }
  }

  if (col._raw) {
    Object.assign(def, col._raw)
  }

  return def
}

// 将分组列配置解析为带子列的 ColumnDef（colspan 表头）
function resolveGroupColumn<T>(
  col: DataTableGroupColumn<T>,
  options: DataTableProps<T>,
  pinning: ColumnPinningState,
  visibility: VisibilityState,
  sizing: ColumnSizingState,
  inheritedFixed?: 'left' | 'right'
): ColumnDef<T, unknown> {
  const effectiveFixed = col.fixed ?? inheritedFixed
  const resolvedSize = col.size != null
    ? (isString(col.size) ? resolvePresetSize(col.size) : col.size)
    : undefined

  return {
    id: `group-${col.header ?? 'unnamed'}`,
    header: col.header ?? '',
    ...(resolvedSize != null && { size: resolvedSize }),
    ...(col.minSize != null && { minSize: col.minSize }),
    ...(col.maxSize != null && { maxSize: col.maxSize }),
    columns: col.children?.map(child =>
      resolveColumn(child, options, pinning, visibility, sizing, effectiveFixed)
    ),
    meta: {
      class: {
        th: [resolveAlignClass(col.align)].filter(Boolean).join(' ') || undefined
      },
      style: {
        th: (header: Header<T, unknown>) => groupHeaderStyle(header, effectiveFixed)
      }
    }
  } as ColumnDef<T, unknown>
}

// function resolveSelectionColumn<T>(
//   col: DataTableSelectionColumn,
//   pinning: ColumnPinningState,
//   sizing: ColumnSizingState
// ): ColumnDef<T, unknown> {
//   const id = '__selection'

//   const { resolvedSize } = applyBaseState(
//     { id, fixed: col.fixed, defaultFixed: 'left', size: col.size, defaultSize: DATA_TABLE_DEFAULTS.selectionSize },
//     pinning,
//     sizing
//   )

//   return createSelectionColumnDef<T>(id, resolvedSize ?? DATA_TABLE_DEFAULTS.selectionSize, col.mode ?? 'multiple')
// }

// function resolveIndexColumn<T>(
//   col: DataTableIndexColumn,
//   options: DataTableProps<T>,
//   pinning: ColumnPinningState,
//   sizing: ColumnSizingState
// ): ColumnDef<T, unknown> {
//   const id = '__index'

//   const { resolvedSize } = applyBaseState(
//     { id, fixed: col.fixed, size: col.size, defaultSize: DATA_TABLE_DEFAULTS.indexSize },
//     pinning,
//     sizing
//   )

//   return {
//     id,
//     header: col.label ?? DATA_TABLE_DEFAULTS.indexLabel,
//     size: resolvedSize,
//     enableSorting: false,
//     enableResizing: false,
//     cell: (ctx: CellContext<T, unknown>) => {
//       const rowIndex = ctx.table.getRowModel().rows.indexOf(ctx.row)
//       return rowIndex + 1 + options.pageOffset
//     },
//     meta: {
//       class: {
//         td: 'text-center text-muted'
//       },
//       style: columnSizeStyle()
//     }
//   } as ColumnDef<T, unknown>
// }

// function resolveExpandColumn<T>(
//   col: DataTableExpandColumn,
//   options: DataTableProps<T>,
//   pinning: ColumnPinningState,
//   sizing: ColumnSizingState
// ): ColumnDef<T, unknown> {
//   const id = '__expand'

//   const { resolvedSize } = applyBaseState(
//     { id, fixed: col.fixed, size: col.size, defaultSize: DATA_TABLE_DEFAULTS.expandSize },
//     pinning,
//     sizing
//   )

//   return {
//     id,
//     header: '',
//     size: resolvedSize,
//     enableSorting: false,
//     enableResizing: false,
//     cell: (ctx: CellContext<T, unknown>) => {
//       if (!ctx.row.getCanExpand()) return null
//       return h(resolveComponent('UButton'), {
//         icon: ctx.row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
//         variant: 'ghost',
//         size: 'xs',
//         color: 'neutral',
//         style: { marginLeft: `${ctx.row.depth * options.indentSize}px` },
//         onClick: (event: Event) => {
//           event.stopPropagation()
//           ctx.row.toggleExpanded()
//         }
//       })
//     },
//     meta: { style: columnSizeStyle() }
//   } as ColumnDef<T, unknown>
// }

// function resolveRowPinningColumn<T>(
//   col: DataTableRowPinningColumn,
//   pinning: ColumnPinningState,
//   sizing: ColumnSizingState
// ): ColumnDef<T, unknown> {
//   const id = '__row_pinning'

//   const { resolvedSize } = applyBaseState(
//     { id, fixed: col.fixed, defaultFixed: 'left', size: col.size, defaultSize: DATA_TABLE_DEFAULTS.selectionSize },
//     pinning,
//     sizing
//   )

//   return {
//     id,
//     header: '',
//     size: resolvedSize,
//     enableSorting: false,
//     enableResizing: false,
//     cell: (ctx: CellContext<T, unknown>) => {
//       const pinned = ctx.row.getIsPinned()
//       const defaultPosition = col.position ?? 'top'

//       return h(resolveComponent('UButton'), {
//         'icon': pinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
//         'variant': 'ghost',
//         'size': 'xs',
//         'color': pinned ? 'primary' : 'neutral',
//         'aria-label': pinned ? '取消固定行' : '固定行',
//         'onClick': (event: Event) => {
//           event.stopPropagation()
//           if (pinned) {
//             ctx.row.pin(false)
//             return
//           }

//           ctx.row.pin(defaultPosition)
//         }
//       })
//     },
//     meta: {
//       class: {
//         td: 'text-center',
//         th: 'text-center'
//       },
//       style: columnSizeStyle()
//     }
//   } as ColumnDef<T, unknown>
// }

// function renderConfirmAction<T>(
//   action: import('../../types/data-table').DataTableAction<T>,
//   row: T,
//   rowIndex: number,
//   actionIndex: number,
//   stateMap: Map<string, ReturnType<typeof ref<boolean>>>
// ) {
//   const key = `${rowIndex}-${actionIndex}`
//   if (!stateMap.has(key)) {
//     stateMap.set(key, ref(false))
//   }
//   const open = stateMap.get(key)!

//   const confirmConfig = typeof action.confirm === 'string'
//     ? { title: action.confirm, description: undefined }
//     : action.confirm!

//   return h(resolveComponent('UPopover'), {
//     'open': open.value,
//     'onUpdate:open': (v: boolean) => { open.value = v }
//   }, {
//     default: () => h(resolveComponent('UButton'), {
//       label: action.label,
//       icon: action.icon,
//       color: (action.color ?? 'neutral') as 'neutral',
//       variant: 'ghost',
//       size: 'xs',
//       disabled: resolveCallbackValue(action.disabled ?? false, row),
//       onClick: () => { open.value = true }
//     }),
//     content: () => h('div', { class: 'p-3 flex flex-col gap-2 max-w-55' }, [
//       h('p', { class: 'text-sm font-medium text-highlighted' }, confirmConfig.title),
//       confirmConfig.description
//         ? h('p', { class: 'text-xs text-muted' }, confirmConfig.description)
//         : null,
//       h('div', { class: 'flex justify-end gap-2 mt-1' }, [
//         h(resolveComponent('UButton'), {
//           label: '取消',
//           color: 'neutral',
//           variant: 'ghost',
//           size: 'xs',
//           onClick: () => { open.value = false }
//         }),
//         h(resolveComponent('UButton'), {
//           label: '确认',
//           color: (action.color ?? 'primary') as 'primary',
//           size: 'xs',
//           onClick: () => {
//             open.value = false
//             action.onClick(row, rowIndex)
//           }
//         })
//       ])
//     ])
//   })
// }

// function resolveActionsColumn<T>(
//   col: DataTableActionsColumn<T>,
//   pinning: ColumnPinningState,
//   sizing: ColumnSizingState
// ): ColumnDef<T, unknown> {
//   const id = '__actions'

//   const { resolvedSize } = applyBaseState(
//     { id, fixed: col.fixed, defaultFixed: 'right', size: col.size },
//     pinning,
//     sizing
//   )

//   // 每个 action 实例独立的 open 状态，key = "${rowIndex}-${actionIndex}"
//   const confirmStateMap = new Map<string, ReturnType<typeof ref<boolean>>>()

//   return {
//     id,
//     header: col.label ?? DATA_TABLE_DEFAULTS.actionsLabel,
//     enableSorting: false,
//     enableResizing: false,
//     ...(resolvedSize != null && { size: resolvedSize }),
//     cell: (ctx: CellContext<T, unknown>) => {
//       const row = ctx.row.original
//       const index = ctx.row.index
//       const actionList = isFunction(col.actions) ? col.actions(row) : col.actions
//       const visibleActions = actionList.filter(a =>
//         !resolveCallbackValue(a.hidden ?? false, row)
//       )

//       if (visibleActions.length === 0) return null

//       return h('div', { class: 'flex items-center gap-1' },
//         visibleActions.map((action, actionIndex) =>
//           action.confirm
//             ? renderConfirmAction(action, row, index, actionIndex, confirmStateMap)
//             : h(resolveComponent('UButton'), {
//                 label: action.label,
//                 icon: action.icon,
//                 color: (action.color ?? 'neutral') as 'neutral',
//                 variant: 'ghost',
//                 size: 'xs',
//                 disabled: resolveCallbackValue(action.disabled ?? false, row),
//                 onClick: () => action.onClick(row, index)
//               })
//         )
//       )
//     },
//     meta: {
//       style: columnSizeStyle()
//     }
//   } as ColumnDef<T, unknown>
// }

// 将对齐方式映射为 Tailwind 文本对齐类
function resolveAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}

// 将 density 配置解析为 th/td padding 类名
function resolveDensityClass<T>(options: DataTableProps<T>): DataTableDensityOptions | null {
  if (options.density == null) return null
  return isString(options.density) ? DENSITY_PRESETS[options.density] : options.density
}

interface ColumnSizeCtx {
  column: {
    getSize: () => number
    columnDef: {
      size?: number
      minSize?: number
      maxSize?: number
      enableResizing?: boolean
    }
  }
}

// 返回 th/td 的内联尺寸样式：有显式 size 或开启 resizing 时三值锁定，否则仅设约束
function columnSizeStyle() {
  const resolve = (ctx: ColumnSizeCtx): Record<string, string> => {
    const { columnDef } = ctx.column
    const hasExplicitSize = columnDef.size != null
    const isResizable = columnDef.enableResizing === true

    if (hasExplicitSize || isResizable) {
      const w = `${ctx.column.getSize()}px`
      return { width: w, minWidth: w, maxWidth: w }
    }

    const style: Record<string, string> = {}
    if (columnDef.minSize != null) style.minWidth = `${columnDef.minSize}px`
    if (columnDef.maxSize != null) style.maxWidth = `${columnDef.maxSize}px`
    return style
  }

  return {
    th: resolve,
    td: resolve
  }
}

// 递归获取分组表头最左侧的叶子列（用于计算 sticky left 偏移）
function getFirstLeafHeader<T>(header: Header<T, unknown>): Header<T, unknown> {
  return header.subHeaders.length
    ? getFirstLeafHeader(header.subHeaders[0]!)
    : header
}

// 递归获取分组表头最右侧的叶子列（用于计算 sticky right 偏移）
function getLastLeafHeader<T>(header: Header<T, unknown>): Header<T, unknown> {
  return header.subHeaders.length
    ? getLastLeafHeader(header.subHeaders[header.subHeaders.length - 1]!)
    : header
}

// 计算分组表头 th 的内联样式：宽度 + sticky 固定列偏移
function groupHeaderStyle<T>(header: Header<T, unknown>, fixed?: 'left' | 'right'): Record<string, string> {
  const w = `${header.getSize()}px`
  const style: Record<string, string> = {
    width: w,
    minWidth: w
  }
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

// 构建列头排序按钮 action（点击切换升降序）
function buildSortAction<T>(
  col: DataTableDataColumn<T>,
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

// 构建列头固定按钮 action（循环切换 left → right → 取消）
function buildPinAction<T>(
  col: DataTableDataColumn<T>,
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

// 渲染带排序/固定按钮及 resize 拖拽手柄的列头单元格
function renderHeaderActions<T>(
  ctx: HeaderContext<T, unknown>,
  col: DataTableDataColumn<T>,
  options: DataTableProps<T>,
  sortable: boolean,
  pinable: boolean,
  resizable: boolean
) {
  const actions: HeaderAction<T>[] = []
  if (pinable) actions.push(buildPinAction(col, options))
  if (sortable) actions.push(buildSortAction(col, options))

  const label = col.header ?? (col.accessorKey as string)
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
