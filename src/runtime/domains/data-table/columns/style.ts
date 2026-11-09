import type { TableData, TableFeatures } from '@nuxt/ui'
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

function clampWidth<T extends TableData>(size: number, columnDef: ColumnDef<TableFeatures, T, unknown>): Record<string, string> {
  return fixedWidth(clampSize(size, columnDef.minSize ?? -Infinity, columnDef.maxSize ?? Infinity))
}

// 仅守 minSize 下限：maxSize 上限已在拖拽时由 clampSize 写入 columnSizing，渲染处不再夹，
// 免得自适应列（auto 布局忽略单元格 max-width 而撑过 maxSize）被夹回造成跳变
function clampMinWidth<T extends TableData>(size: number, columnDef: ColumnDef<TableFeatures, T, unknown>): Record<string, string> {
  return fixedWidth(clampSize(size, columnDef.minSize ?? -Infinity, Infinity))
}

// 内侧固定列（贴近滚动区）无人依赖其宽度，可省略宽度按内容自适应：末尾固定取首个、起始固定取末个 leaf
function isInnermostPinned<T extends TableData>(column: Column<TableFeatures, T, unknown>, table: Table<TableFeatures, T>, pinned: 'start' | 'end'): boolean {
  const cols = pinned === 'start' ? table.getStartLeafColumns() : table.getEndLeafColumns()
  const target = pinned === 'start' ? cols[cols.length - 1] : cols[0]
  return target?.id === column.id
}

export function resolveColumnSize<T extends TableData>(ctx: Header<TableFeatures, T, unknown> | Cell<TableFeatures, T, unknown>): Record<string, string> {
  const { columnDef } = ctx.column
  const table = ctx.getContext().table
  const pinned = ctx.column.getIsPinned()
  const isSized = ctx.column.id in (table.atoms.columnSizing?.get() ?? {})
  const hasExplicitSize = columnDef.size != table.getDefaultColumnDef().size

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

export function makeColumnStyle<T extends TableData>(
  align?: 'left' | 'center' | 'right'
): { th: (ctx: Header<TableFeatures, T, unknown>) => Record<string, string>, td: (ctx: Cell<TableFeatures, T, unknown>) => Record<string, string> } {
  const resolver = (ctx: Header<TableFeatures, T, unknown> | Cell<TableFeatures, T, unknown>): Record<string, string> =>
    align ? { ...resolveColumnSize(ctx), textAlign: align } : resolveColumnSize(ctx)
  return { th: resolver, td: resolver }
}

export function applyBaseState(
  id: string,
  fixed: 'start' | 'end' | undefined,
  size: number | string | undefined,
  ctx: ResolveContext<TableData>
): number | undefined {
  if (fixed) {
    ctx.pinning[fixed].push(id)
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

export function buildClassMeta<T extends TableData, V>(
  density: ColumnMeta<TableFeatures, T, unknown>['class'] | null,
  align?: string,
  resizable?: boolean,
  tdClass?: string
): ColumnMeta<TableFeatures, T, V>['class'] {
  return {
    td: [align, density?.td, tdClass].filter(Boolean).join(' ') || undefined,
    th: [resizable ? 'relative' : '', align, density?.th].filter(Boolean).join(' ') || undefined
  }
}

// 分组表头只锁定宽度；固定列的 sticky 偏移由 UTable 按子列统一计算（子列同侧固定时）
export function groupHeaderStyle<T extends TableData>(header: Header<TableFeatures, T, unknown>): Record<string, string> {
  const w = `${header.getSize()}px`
  return { width: w, minWidth: w }
}
