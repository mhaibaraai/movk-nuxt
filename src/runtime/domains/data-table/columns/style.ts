import type { Cell, Column, ColumnDef, ColumnMeta, Header, Table } from '@tanstack/vue-table'
import type { DataTableSizePreset } from '../../../types/data-table'
import type { ResolveContext } from './constants'
import { isString } from '@movk/core'
import { resolvePresetSize } from './utils'

// 数值 clamp 到 [min, max]，供自管拖拽计算目标列宽
export function clampSize(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

// 定宽列样式：width/minWidth/maxWidth 同值，锁死该像素宽
function fixedWidth(n: number): Record<string, string> {
  const w = `${n}px`
  return { width: w, minWidth: w, maxWidth: w }
}

function clampWidth<T>(size: number, columnDef: ColumnDef<T, unknown>): Record<string, string> {
  return fixedWidth(clampSize(size, columnDef.minSize ?? -Infinity, columnDef.maxSize ?? Infinity))
}

// 仅守 minSize 下限：maxSize 上限已在拖拽时由 clampSize 写入 columnSizing，渲染处不再夹，
// 免得自适应列（auto 布局忽略单元格 max-width 而撑过 maxSize）被夹回造成跳变
function clampMinWidth<T>(size: number, columnDef: ColumnDef<T, unknown>): Record<string, string> {
  return fixedWidth(clampSize(size, columnDef.minSize ?? -Infinity, Infinity))
}

// 内侧固定列（贴近滚动区）无人依赖其宽度，可省略宽度按内容自适应：右固定取首个、左固定取末个 leaf
function isInnermostPinned<T>(column: Column<T, unknown>, table: Table<T>, pinned: 'left' | 'right'): boolean {
  const cols = pinned === 'left' ? table.getLeftLeafColumns() : table.getRightLeafColumns()
  const target = pinned === 'left' ? cols[cols.length - 1] : cols[0]
  return target?.id === column.id
}

export function resolveColumnSize<T>(ctx: Header<T, unknown> | Cell<T, unknown>): Record<string, string> {
  const { columnDef } = ctx.column
  const table = ctx.getContext().table
  const pinned = ctx.column.getIsPinned()
  const isSized = ctx.column.id in table.getState().columnSizing
  const hasExplicitSize = columnDef.size != table._getDefaultColumnDef().size

  // 用户显式 size 双向收敛（含 maxSize），保留文档承诺
  if (hasExplicitSize) return clampWidth(ctx.column.getSize(), columnDef)
  // 拖拽测得的自适应列仅守 minSize，maxSize 已在拖拽时夹定，避免抓取闪烁
  if (isSized) return clampMinWidth(ctx.column.getSize(), columnDef)
  // 非内侧固定列需确定宽度供相邻固定列 sticky 偏移（getStart/getAfter）计算
  if (pinned && !isInnermostPinned(ctx.column, table, pinned)) return clampWidth(ctx.column.getSize(), columnDef)

  // 普通列 / 内侧固定列且无显式宽：按内容自适应，仅施加 min/max 边界
  const style: Record<string, string> = {}
  if (columnDef.minSize != null) style.minWidth = `${columnDef.minSize}px`
  if (columnDef.maxSize != null) style.maxWidth = `${columnDef.maxSize}px`
  return style
}

export function makeColumnStyle<T>(
  align?: 'left' | 'center' | 'right'
): { th: (ctx: Header<T, unknown>) => Record<string, string>, td: (ctx: Cell<T, unknown>) => Record<string, string> } {
  const resolver = (ctx: Header<T, unknown> | Cell<T, unknown>): Record<string, string> =>
    align ? { ...resolveColumnSize(ctx), textAlign: align } : resolveColumnSize(ctx)
  return { th: resolver, td: resolver }
}

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
