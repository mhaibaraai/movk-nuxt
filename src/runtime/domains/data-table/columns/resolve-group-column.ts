import type { ColumnDef, Header } from '@tanstack/vue-table'
import type { DataTableColumn, DataTableGroupColumn } from '../../../types/data-table'
import type { ResolveContext } from './constants'
import { isString } from '@movk/core'
import { resolvePresetSize } from './utils'
import { groupHeaderStyle, resolveAlignClass } from './style'

export function resolveGroupColumn<T>(
  col: DataTableGroupColumn<T>,
  ctx: ResolveContext<T>,
  resolveChild: (col: DataTableColumn<T>, ctx: ResolveContext<T>, inheritedFixed?: 'left' | 'right') => ColumnDef<T, unknown>,
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
    columns: col.children?.map(child => resolveChild(child, ctx, effectiveFixed)),
    meta: {
      class: { th: resolveAlignClass(col.align) || undefined },
      style: { th: (header: Header<T, unknown>) => groupHeaderStyle(header, effectiveFixed) }
    }
  } as ColumnDef<T, unknown>
}
