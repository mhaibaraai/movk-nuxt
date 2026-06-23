<script lang="ts" setup
  generic="T extends TreeItem[] = TreeItem[], M extends boolean = false"
>
import type { AppConfig } from 'nuxt/schema'
import type { ComponentConfig, TreeItem } from '@nuxt/ui'
import type { TreeItemSelectEvent } from 'reka-ui'
import { computed, ref, useSlots, watch } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Tree, omitUndefined, splitHighlight } from '@movk/core'
import { UCheckbox, UIcon, UTree } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import treeTheme from '#build/ui/tree'
import theme from '#build/movk-ui/tree'
import { createGetKey, normalizeChildren } from '../domains/tree/resolve-tree'
import { matchLabel } from '../domains/tree/tree-search'
import { isPlaceholder, LAZY_KEY_FIELD, markLazyPlaceholders } from '../domains/tree/tree-lazy'
import { computeTreeSelection, selectionSummary } from '../utils/tree-selection'
import { resolveDefaultExpandedKeys } from '../utils/tree-expand'
import TreeToolbar from '../domains/tree/components/TreeToolbar.vue'
import type { TreeEmits, TreeExposed, TreeProps, TreeSlots } from '../types/components/tree'

type WorkNode = Record<string, any>
type DefaultExpanded = boolean | number | ((node: WorkNode, depth: number) => boolean)

const props = withDefaults(defineProps<TreeProps<T, M> & {
  ui?: ComponentConfig<typeof treeTheme & typeof theme, AppConfig, 'tree'>['slots']
}>(), {
  childrenKey: 'children',
  highlight: true
})

const emit = defineEmits<TreeEmits<T, M>>()
defineSlots<TreeSlots<T>>()
defineOptions({ inheritAttrs: false })

type ModelValue = TreeProps<T, M>['modelValue']
const modelValue = defineModel<ModelValue>()
const selectedKeysState = defineModel<string[]>('selectedKeys')
const search = defineModel<string>('search', { default: '' })
const expanded = defineModel<string[]>('expanded', { default: () => [] })

const slots = useSlots()
const appConfig = useAppConfig() as { movk?: { tree?: unknown } }
const labelKey = computed(() => props.labelKey ?? 'label')
const getKey = computed(() => createGetKey<WorkNode>(props.getKey as ((node: WorkNode) => string) | undefined, labelKey.value))

const { baseUi, extraUi } = useExtendedTv(
  treeTheme,
  theme,
  () => appConfig.movk?.tree,
  () => ({
    ui: {
      ...props.ui,
      container: [props.ui?.container, props.class]
    }
  })
)

function buildBase(items: WorkNode[]): WorkNode[] {
  const normalized = normalizeChildren(items ?? [], props.childrenKey)
  return props.lazy ? markLazyPlaceholders(normalized, getKey.value, labelKey.value) : normalized
}

const baseItems = ref<WorkNode[]>([])
let initialized = false
watch(() => props.items, (items) => {
  baseItems.value = buildBase((items ?? []) as WorkNode[])
  if (!initialized) {
    initialized = true
    if (expanded.value.length === 0) {
      // 按类型走策略分支，确保 number 0（收起全部）不被当作假值；
      // undefined / false（含未传时 Vue 对 boolean prop 的降级）回退节点级 defaultExpanded 标记
      const de = props.defaultExpanded as DefaultExpanded
      expanded.value = (de === true || typeof de === 'number' || typeof de === 'function')
        ? resolveDefaultExpandedKeys(baseItems.value, de, { getKey: getKey.value })
        : Tree.findAll(baseItems.value, ({ node }) => !!node.defaultExpanded).map(n => getKey.value(n))
    }
  }
}, { immediate: true })

const searching = computed(() => !!(props.searchable && search.value.trim()))

const displayItems = computed<WorkNode[]>(() => {
  if (!searching.value) return baseItems.value
  const term = search.value
  return Tree.filter(baseItems.value, ({ node }) =>
    props.filter ? props.filter(node as T[number], term) : matchLabel(node[labelKey.value], term)
  )
})

const isEmpty = computed(() => searching.value && displayItems.value.length === 0)

watch([searching, displayItems], () => {
  if (searching.value) {
    expanded.value = Tree.findAll(displayItems.value, ({ node }) => !!node.children?.length).map(n => getKey.value(n))
  }
})

const loadingKeys = ref(new Set<string>())
async function onExpandedUpdate(keys: string[]) {
  const previous = expanded.value
  expanded.value = keys
  if (!props.lazy || !props.loadChildren) return

  for (const key of keys.filter(k => !previous.includes(k))) {
    if (loadingKeys.value.has(key)) continue
    const node = Tree.find(baseItems.value, ({ node }) => getKey.value(node) === key)
    const child = node?.children?.[0]
    if (!node || !child || !isPlaceholder(child)) continue

    loadingKeys.value = new Set(loadingKeys.value).add(key)
    try {
      const loaded = buildBase((await props.loadChildren(node as T[number])) as WorkNode[])
      baseItems.value = Tree.updateNode(
        baseItems.value,
        key,
        ({ node }) => ({ ...node, children: loaded.length ? loaded : undefined, isLeaf: loaded.length === 0 }),
        { id: LAZY_KEY_FIELD }
      )
    }
    finally {
      const set = new Set(loadingKeys.value)
      set.delete(key)
      loadingKeys.value = set
    }
  }
}

// MTree 拦截或重命名的键不转发给 UTree，其余属性原样透传。
const FORWARD_OMIT = new Set([
  'items', 'modelValue', 'selectedKeys', 'expanded', 'defaultExpanded', 'ui', 'class',
  'childrenKey', 'searchable', 'search', 'filter', 'highlight',
  'lazy', 'loadChildren', 'toolbar', 'checkable',
  'multiple', 'strategy', 'propagateSelect', 'bubbleSelect'
])
const forwardProps = reactiveOmit(props, (_value, key) => FORWARD_OMIT.has(key as string))

const utreeProps = computed(() => {
  const multiple = props.checkable ? true : props.multiple
  const cascade = (props.strategy ?? 'cascade') === 'cascade'
  // propagateSelect / bubbleSelect 类型含 boolean，未传时 Vue 降级为 false（而非 undefined），
  // 故用 || 回退：cascade 策略下强制开启，isolated 下保持关闭（可由显式 true 覆盖）
  const selectOptions = multiple
    ? {
        multiple: true,
        propagateSelect: props.propagateSelect || cascade,
        bubbleSelect: props.bubbleSelect || cascade
      }
    : { multiple }

  return omitUndefined({ ...forwardProps, ...selectOptions }) as Record<string, any>
})

const RESERVED_SLOTS = ['toolbar', 'toolbar-leading', 'toolbar-trailing', 'empty', 'loading']
const forwardSlots = computed(() => Object.keys(slots).filter(name => !RESERVED_SLOTS.includes(name)) as (keyof TreeSlots<T>)[])

function nodeLabel(node: WorkNode): string {
  const value = node[labelKey.value]
  return value == null ? '' : String(value)
}

const isMultiple = computed(() => !!(props.checkable || props.multiple))

// 可选节点：排除懒加载占位与 disabled。
const selectableNodes = computed<WorkNode[]>(() =>
  Tree.findAll(baseItems.value, ({ node }) => !isPlaceholder(node) && !node.disabled)
)
const nodesByKey = computed(() => {
  const map = new Map<string, WorkNode>()
  Tree.forEach(baseItems.value, ({ node }) => { map.set(getKey.value(node), node) })
  return map
})

function modelToKeys(value: ModelValue): string[] {
  return Array.isArray(value)
    ? value.map(node => getKey.value(node as WorkNode))
    : value ? [getKey.value(value as WorkNode)] : []
}
function keysToModel(keys: string[]): ModelValue {
  const nodes = keys.map(k => nodesByKey.value.get(k)).filter((n): n is WorkNode => !!n)
  return (isMultiple.value ? nodes : nodes[0]) as ModelValue
}

// selectedKeys v-model 优先，否则由 modelValue 派生，作为选中真相。
const selectedKeys = computed<string[]>(() =>
  selectedKeysState.value !== undefined ? selectedKeysState.value : modelToKeys(modelValue.value)
)
// 供 UTree 的节点对象 model：selectedKeys 启用时由键映射回节点。
const effectiveModel = computed<ModelValue>(() =>
  selectedKeysState.value !== undefined ? keysToModel(selectedKeysState.value) : modelValue.value
)

const treeSelection = computed(() =>
  computeTreeSelection(baseItems.value, new Set(selectedKeys.value), {
    getKey: getKey.value,
    strategy: props.strategy ?? 'cascade'
  })
)
// 工具栏摘要按叶子计：级联下 selectedKeys 含父级会重复计数，故用选中叶子数 / 可选叶子总数
const selectableLeafCount = computed(() =>
  Tree.findAll(baseItems.value, ({ node }) =>
    !isPlaceholder(node) && !node.disabled && !(Array.isArray(node.children) && node.children.length > 0)).length
)
const selectionSummaryValue = computed(() =>
  selectionSummary(treeSelection.value.leaves.length, selectableLeafCount.value)
)

function setModel(value: ModelValue) {
  modelValue.value = value
  const keys = modelToKeys(value)
  if (selectedKeysState.value !== undefined) selectedKeysState.value = keys
  // 同步基于本次 keys 计算分类，保证 change.selection 与 change.keys 不漂移
  const selection = computeTreeSelection(baseItems.value, keys, {
    getKey: getKey.value,
    strategy: props.strategy ?? 'cascade'
  })
  emit('change', { value, keys, selection })
}

const expandableKeys = computed(() =>
  Tree.findAll(baseItems.value, ({ node }) => !!node.children?.length).map(n => getKey.value(n))
)
const allExpanded = computed(() =>
  expandableKeys.value.length > 0 && expandableKeys.value.every(k => expanded.value.includes(k))
)

function onItemSelect(e: TreeItemSelectEvent<TreeItem>) {
  if (e.detail.originalEvent.type === 'click') e.preventDefault()
}

function expandAll() {
  expanded.value = expandableKeys.value
}
function collapseAll() {
  expanded.value = []
}
function toggleExpand() {
  if (allExpanded.value) collapseAll()
  else expandAll()
}
function expandToDepth(depth: number) {
  expanded.value = resolveDefaultExpandedKeys(baseItems.value, depth, { getKey: getKey.value })
}
function selectAll() {
  setModel(selectableNodes.value as ModelValue)
}
function clearSelection() {
  setModel((isMultiple.value ? [] : undefined) as ModelValue)
}

defineExpose<TreeExposed<T>>({
  expandAll,
  collapseAll,
  expandToDepth,
  selectAll,
  clearSelection,
  get treeSelection() { return treeSelection.value as TreeExposed<T>['treeSelection'] }
})
</script>

<template>
  <div :class="extraUi.container">
    <slot
      v-if="props.toolbar || props.searchable || slots.toolbar"
      name="toolbar"
      :expand-all="expandAll"
      :collapse-all="collapseAll"
      :toggle-expand="toggleExpand"
      :all-expanded="allExpanded"
      :select-all="selectAll"
      :clear="clearSelection"
      :search="search"
      :selection-summary="selectionSummaryValue"
    >
      <TreeToolbar
        :toolbar="props.toolbar"
        :searchable="props.searchable"
        :checkable="props.checkable"
        :search="search"
        :size="props.size"
        :color="props.color"
        :expanded="allExpanded"
        :selection-summary="selectionSummaryValue"
        :ui="{ toolbar: extraUi.toolbar, toolbarButton: extraUi.toolbarButton, search: extraUi.search }"
        @update:search="search = $event"
        @toggle-expand="toggleExpand"
        @select-all="selectAll"
        @clear="clearSelection"
      >
        <template v-if="slots['toolbar-leading']" #leading>
          <slot name="toolbar-leading" />
        </template>
        <template v-if="slots['toolbar-trailing']" #trailing>
          <slot name="toolbar-trailing" />
        </template>
      </TreeToolbar>
    </slot>

    <div v-if="isEmpty" :class="extraUi.empty">
      <slot name="empty">
        无匹配结果
      </slot>
    </div>

    <UTree
      v-else
      v-bind="{ ...utreeProps, ...$attrs, ...(props.checkable ? { as: { link: 'div' }, onSelect: onItemSelect } : {}) }"
      :items="(displayItems as any)"
      :model-value="(effectiveModel as any)"
      :expanded="expanded"
      :ui="(baseUi as any)"
      @update:model-value="setModel($event as ModelValue)"
      @update:expanded="onExpandedUpdate"
    >
      <template v-for="name in forwardSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>

      <template v-if="props.checkable && !slots['item-leading']" #item-leading="{ item, selected, indeterminate, handleSelect }">
        <UCheckbox
          v-if="!isPlaceholder(item)"
          :model-value="indeterminate ? 'indeterminate' : selected"
          :size="props.size"
          :color="props.color"
          :class="extraUi.checkbox"
          tabindex="-1"
          @change="handleSelect"
          @click.stop
        />
      </template>

      <template v-if="!slots['item-label']" #item-label="{ item }">
        <slot v-if="isPlaceholder(item)" name="loading" :node="item">
          <span :class="extraUi.loading">
            <UIcon name="i-lucide-loader-circle" :class="extraUi.loadingIcon" />加载中
          </span>
        </slot>
        <template v-else-if="searching && props.highlight">
          <span
            v-for="(segment, index) in splitHighlight(nodeLabel(item), search)"
            :key="index"
            :class="segment.match ? extraUi.highlight : undefined"
          >{{ segment.text }}</span>
        </template>
        <template v-else>
          {{ nodeLabel(item) }}
        </template>
      </template>
    </UTree>
  </div>
</template>
