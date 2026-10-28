import type { ColumnSizingState } from '@tanstack/vue-table'
import type { WritableComputedRef } from 'vue'
import { computed, watch } from 'vue'
import { Tree } from '@movk/core'
import { resolveMaxIndentPx } from './indent'
import type { DataTableProps } from '../../types/data-table/component'

const EXPAND_DEFAULT_SIZE = 60
const EXPAND_BUTTON_SLOT = 60

interface ExpandColumnAutoSizeOptions<T> {
  data: () => unknown[]
  childrenKey: () => string | undefined
  hasExpandColumn: () => boolean
  indentSize: () => DataTableProps<T>['indentSize']
  sizing: WritableComputedRef<ColumnSizingState>
}

/** 树模式下按最大缩进深度放宽展开列；用户手动调整过的宽度不覆盖 */
export function useExpandColumnAutoSize<T>(options: ExpandColumnAutoSizeOptions<T>): void {
  const treeMaxDepth = computed(() => {
    const childrenKey = options.childrenKey()
    const data = options.data()
    if (!childrenKey || data.length === 0) return 0
    return Tree.getStats(data, { children: childrenKey }).depth - 1
  })

  const expandColumnSize = computed<number | null>(() => {
    if (!options.childrenKey() || !options.hasExpandColumn()) return null
    const maxButtonDepth = Math.max(0, treeMaxDepth.value - 1)
    if (maxButtonDepth === 0) return null
    const indentPx = resolveMaxIndentPx(options.indentSize(), maxButtonDepth)
    return Math.max(EXPAND_DEFAULT_SIZE, EXPAND_BUTTON_SLOT + indentPx * 2)
  })

  let autoExpandSize: number | null = null
  watch(expandColumnSize, (target) => {
    if (target == null) return
    const state = options.sizing.value
    const current = state.__expand
    const canOverride = current == null || current === EXPAND_DEFAULT_SIZE || current === autoExpandSize
    if (!canOverride || current === target) return
    options.sizing.value = { ...state, __expand: target }
    autoExpandSize = target
  }, { immediate: true })
}
