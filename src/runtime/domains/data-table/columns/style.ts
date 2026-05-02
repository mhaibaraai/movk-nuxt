import type { Cell, ColumnMeta, Header } from '@tanstack/vue-table'
import type { DataTableSizePreset } from '../../../types/data-table'
import type { ResolveContext } from './constants'
import { isString } from '@movk/core'
import { resolvePresetSize } from '../state/models'

export function resolveColumnSize<T>(ctx: Header<T, unknown> | Cell<T, unknown>): Record<string, string> {
  const { columnDef } = ctx.column
  const table = ctx.getContext().table
  const isPinned = ctx.column.getIsPinned()
  const hasMeasuredSize = isPinned && (ctx.column.id in table.getState().columnSizing)

  if (hasMeasuredSize || columnDef.size != table._getDefaultColumnDef().size || columnDef.enableResizing === true) {
    const w = `${ctx.column.getSize()}px`
    return { width: w, minWidth: w, maxWidth: w }
  }

  const style: Record<string, string> = {}
  if (columnDef.minSize != null) style.minWidth = `${columnDef.minSize}px`
  if (columnDef.maxSize != null) style.maxWidth = `${columnDef.maxSize}px`
  return style
}

export const COLUMN_SIZE_STYLE = { th: resolveColumnSize, td: resolveColumnSize }

export function applyBaseState(
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

export function resolveAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return ''
  }
}

export function buildClassMeta<T, V>(
  density: ColumnMeta<T, unknown>['class'] | null,
  align?: string,
  resizable?: boolean,
  tdClass?: string
): ColumnMeta<T, V>['class'] {
  return {
    td: [align, density?.td, tdClass].filter(Boolean).join(' ') || undefined,
    th: [resizable ? 'relative' : '', align, density?.th].filter(Boolean).join(' ') || undefined
  }
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

export function groupHeaderStyle<T>(header: Header<T, unknown>, fixed?: 'left' | 'right'): Record<string, string> {
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
