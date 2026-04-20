import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import type { TreeRowSelectionOptions, TreeSelectionResult } from '../utils/tree-row-selection'
import { computeTreeRowSelection } from '../utils/tree-row-selection'

export type { TreeRowSelectionOptions, TreeSelectionResult } from '../utils/tree-row-selection'

/**
 * 树形选择派生 composable：把 rowSelectionKeys 与 data 组合为
 * selected / leaves / parents / halfSelected / strictlyChecked 五种语义分类。
 */
export function useTreeRowSelection<T extends Record<string, unknown>>(
  data: MaybeRefOrGetter<T[]>,
  selectionKeys: Ref<string[] | undefined> | Ref<(string | number)[] | undefined>,
  options: TreeRowSelectionOptions = {}
): ComputedRef<TreeSelectionResult<T>> {
  return computed<TreeSelectionResult<T>>(() =>
    computeTreeRowSelection(toValue(data), selectionKeys.value ?? [], options)
  )
}
