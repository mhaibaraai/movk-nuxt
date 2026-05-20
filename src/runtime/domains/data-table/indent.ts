import type { CellContext } from '@tanstack/vue-table'
import type { DataTableProps } from '../../types/data-table'
import { lengthToPx } from '@movk/core'

/**
 * 计算给定 `indentSize` 在 `[0, maxButtonDepth]` 范围内的最大缩进像素
 *
 * - `number` / `string`：等差缩进 `depth * step`，取 `maxButtonDepth * step`
 * - `function`：对每个 depth 评估并取最大值；评估失败回退 0
 */
export function resolveMaxIndentPx<T>(
  size: DataTableProps<T>['indentSize'],
  maxButtonDepth: number
): number {
  if (maxButtonDepth <= 0) return 0
  if (typeof size === 'number') return size * maxButtonDepth
  if (typeof size === 'string') return lengthToPx(size) * maxButtonDepth
  if (typeof size === 'function') {
    let max = 0
    for (let d = 1; d <= maxButtonDepth; d++) {
      try {
        const ret = size({ row: { depth: d } } as unknown as CellContext<T, unknown>)
        const px = typeof ret === 'number' ? ret : typeof ret === 'string' ? lengthToPx(ret) : 0
        if (px > max) max = px
      }
      catch { /* 退化 */ }
    }
    return max
  }
  return 0
}
