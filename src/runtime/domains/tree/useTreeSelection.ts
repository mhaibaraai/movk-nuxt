import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { Tree } from '@movk/core'
import type { TreeSelectionResult, TreeSelectionStrategy } from '../../types/shared'
import { computeTreeSelection, selectionSummary } from '../../utils/tree-selection'
import { isPlaceholder } from './tree-lazy'

type WorkNode = Record<string, any>
type ModelValue = WorkNode | WorkNode[] | undefined

interface TreeSelectionOptions {
  baseItems: Ref<WorkNode[]>
  remoteItems: Ref<WorkNode[] | undefined>
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
  const { baseItems, remoteItems, disabledKeys, modelValue, selectedKeys: selectedKeysState } = options

  const isSelectable = (node: WorkNode) => !isPlaceholder(node) && !disabledKeys.value.has(options.getKey()(node))

  const activeItems = computed(() => remoteItems.value ?? baseItems.value)
  const selectableNodes = computed(() => Tree.findAll(activeItems.value, ({ node }) => isSelectable(node)) as WorkNode[])
  const activeNodes = computed(() => indexNodes(activeItems.value, options.getKey()))
  const cachedSelection = shallowRef<WorkNode[]>([])
  const selectionItems = computed(() => {
    if (!remoteItems.value?.length && !cachedSelection.value.length) return baseItems.value
    return mergeTrees(baseItems.value, [...(remoteItems.value ?? []), ...cachedSelection.value], options.getKey())
  })
  const nodesByKey = computed(() => indexNodes(selectionItems.value, options.getKey()))

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
  watch([selectedKeys, remoteItems], ([keys, results]) => {
    const getKey = options.getKey()
    const prior = indexNodes(cachedSelection.value, getKey)
    const found = results ? activeNodes.value : undefined
    cachedSelection.value = keys.flatMap((key) => {
      const node = found?.get(key) ?? prior.get(key)
      return node ? [node] : []
    })
  }, { immediate: true, flush: 'sync' })
  // 供 UTree 的节点对象 model：selectedKeys 启用时由键映射回节点
  const effectiveModel = computed<ModelValue>(() =>
    selectedKeysState.value !== undefined ? keysToModel(selectedKeysState.value) : modelValue.value)

  const classify = (keys: Iterable<string>) =>
    computeTreeSelection(selectionItems.value, new Set(keys), { getKey: options.getKey(), strategy: options.strategy() })

  const treeSelection = computed(() => classify(selectedKeys.value))

  // 摘要按叶子计：级联下 selectedKeys 含父级会重复计数，故用选中叶子数 / 可选叶子总数
  const selectableLeafCount = computed(() =>
    selectableNodes.value.filter(node => !(Array.isArray(node.children) && node.children.length > 0)).length)
  const summary = computed(() => selectionSummary(
    treeSelection.value.leaves.filter(node => activeNodes.value.has(options.getKey()(node))).length,
    selectableLeafCount.value
  ))

  function withSelectionOutsideResults(nodes: WorkNode[]): WorkNode[] {
    if (!remoteItems.value) return nodes
    const existing = selectedKeys.value.filter(key => !activeNodes.value.has(key))
    return [...existing.map(key => nodesByKey.value.get(key)).filter(node => node !== undefined), ...nodes]
  }

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
      setModel(withSelectionOutsideResults(value.filter(node => !node.disabled && (!remoteItems.value || activeNodes.value.has(options.getKey()(node))))))
      return
    }
    if (value?.disabled) return
    setModel(value)
  }

  const selectAll = () => setModel(withSelectionOutsideResults(selectableNodes.value))
  const clearSelection = () => setModel(options.multiple() ? [] : undefined)

  return { effectiveModel, treeSelection, summary, onModelUpdate, selectAll, clearSelection, nodesByKey }
}

function indexNodes(items: WorkNode[], getKey: (node: WorkNode) => string): Map<string, WorkNode> {
  const nodes = new Map<string, WorkNode>()
  Tree.forEach(items, ({ node }) => {
    if (!isPlaceholder(node)) nodes.set(getKey(node), node)
  })
  return nodes
}

/** Keep the base tree authoritative and include remote nodes that aren't already present. */
function mergeTrees(base: WorkNode[], extra: WorkNode[], getKey: (node: WorkNode) => string): WorkNode[] {
  const seen = new Set(indexNodes(base, getKey).keys())
  function collect(nodes: WorkNode[]): WorkNode[] {
    return nodes.flatMap((node) => {
      if (isPlaceholder(node)) return []
      const key = getKey(node)
      const known = seen.has(key)
      seen.add(key)
      const children = Array.isArray(node.children) ? collect(node.children) : undefined
      if (known) return children ?? []
      return [children?.length === node.children?.length ? node : { ...node, children }]
    })
  }
  return [...base, ...collect(extra)]
}
