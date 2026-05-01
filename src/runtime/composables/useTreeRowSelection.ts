import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import type { TreeRowSelectionOptions, TreeSelectionResult } from '../types/data-table/selection'
import { computeTreeRowSelection } from '../domains/data-table/state/tree-selection'

/**
 * 树形选择派生 composable：把 rowSelectionKeys 与 data 组合为
 * selected / leaves / parents / halfSelected / strictlyChecked 五种语义分类。
 */
export function useTreeRowSelection<T extends object>(
  data: MaybeRefOrGetter<T[]>,
  selectionKeys: Ref<string[] | undefined> | Ref<(string | number)[] | undefined>,
  options: TreeRowSelectionOptions = {}
): ComputedRef<TreeSelectionResult<T>> {
  return computed<TreeSelectionResult<T>>(() =>
    computeTreeRowSelection(toValue(data), selectionKeys.value ?? [], options)
  )
}
