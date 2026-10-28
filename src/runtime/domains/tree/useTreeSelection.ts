import type { Ref } from 'vue'
import { computed } from 'vue'
import { Tree } from '@movk/core'
import type { TreeSelectionResult, TreeSelectionStrategy } from '../../types/shared'
import { computeTreeSelection, selectionSummary } from '../../utils/tree-selection'
import { isPlaceholder } from './tree-lazy'

type WorkNode = Record<string, any>
type ModelValue = WorkNode | WorkNode[] | undefined

interface TreeSelectionOptions {
  baseItems: Ref<WorkNode[]>
  getKey: () => (node: WorkNode) => string
  disabledKeys: Ref<Set<string>>
  strategy: () => TreeSelectionStrategy
  multiple: () => boolean
  disabled: () => boolean
  modelValue: Ref<ModelValue>
  selectedKeys: Ref<string[] | undefined>
  onChange: (payload: { value: ModelValue, keys: string[], selection: TreeSelectionResult<WorkNode> }) => void
}

/** 节点对象 model 与 selectedKeys 双形态的选中状态、分类结果与工具栏摘要 */
export function useTreeSelection(options: TreeSelectionOptions) {
  const { baseItems, disabledKeys, modelValue, selectedKeys: selectedKeysState } = options

  const isSelectable = (node: WorkNode) => !isPlaceholder(node) && !disabledKeys.value.has(options.getKey()(node))

  const selectableNodes = computed(() => Tree.findAll(baseItems.value, ({ node }) => isSelectable(node)) as WorkNode[])
  const nodesByKey = computed(() => {
    const getKey = options.getKey()
    const map = new Map<string, WorkNode>()
    Tree.forEach(baseItems.value, ({ node }) => {
      map.set(getKey(node), node)
    })
    return map
  })

  function modelToKeys(value: ModelValue): string[] {
    const getKey = options.getKey()
    if (Array.isArray(value)) return value.map(getKey)
    return value ? [getKey(value)] : []
  }

  function keysToModel(keys: string[]): ModelValue {
    const nodes = keys.map(key => nodesByKey.value.get(key)).filter((node): node is WorkNode => !!node)
    return options.multiple() ? nodes : nodes[0]
  }

  // selectedKeys v-model 优先，否则由 modelValue 派生，作为选中真相
  const selectedKeys = computed(() => selectedKeysState.value ?? modelToKeys(modelValue.value))
  // 供 UTree 的节点对象 model：selectedKeys 启用时由键映射回节点
  const effectiveModel = computed<ModelValue>(() =>
    selectedKeysState.value !== undefined ? keysToModel(selectedKeysState.value) : modelValue.value)

  const classify = (keys: Iterable<string>) =>
    computeTreeSelection(baseItems.value, new Set(keys), { getKey: options.getKey(), strategy: options.strategy() })

  const treeSelection = computed(() => classify(selectedKeys.value))

  // 摘要按叶子计：级联下 selectedKeys 含父级会重复计数，故用选中叶子数 / 可选叶子总数
  const selectableLeafCount = computed(() =>
    selectableNodes.value.filter(node => !(Array.isArray(node.children) && node.children.length > 0)).length)
  const summary = computed(() => selectionSummary(treeSelection.value.leaves.length, selectableLeafCount.value))

  function setModel(value: ModelValue) {
    modelValue.value = value
    const keys = modelToKeys(value)
    if (selectedKeysState.value !== undefined) selectedKeysState.value = keys
    options.onChange({ value, keys, selection: classify(keys) })
  }

  /** UTree 派发的交互变化：disabled 子树节点已注入 disabled，数组态过滤，单选态命中则忽略 */
  function onModelUpdate(value: ModelValue) {
    if (options.disabled()) return
    if (Array.isArray(value)) {
      setModel(value.filter(node => !node.disabled))
      return
    }
    if (value?.disabled) return
    setModel(value)
  }

  const selectAll = () => setModel(selectableNodes.value)
  const clearSelection = () => setModel(options.multiple() ? [] : undefined)

  return { effectiveModel, treeSelection, summary, onModelUpdate, selectAll, clearSelection, nodesByKey }
}
