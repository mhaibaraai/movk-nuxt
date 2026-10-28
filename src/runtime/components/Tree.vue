<script lang="ts" setup
  generic="T extends TreeItem[] = TreeItem[], M extends boolean = false"
>
import type { AppConfig } from 'nuxt/schema'
import type { ComponentConfig, TreeItem } from '@nuxt/ui'
import type { TreeItemSelectEvent } from 'reka-ui'
import type { Ref } from 'vue'
import { computed, ref, useSlots, watch } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Tree, omitUndefined, splitHighlight } from '@movk/core'
import { UButton, UCheckbox, UIcon, UTree } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import { useMovkLocale } from '../composables/useMovkLocale'
import treeTheme from '#build/ui/tree'
import theme from '#build/movk-ui/tree'
import { createGetKey, normalizeChildren } from '../domains/tree/resolve-tree'
import { resolveLeadingIcon } from '../domains/tree/tree-icon'
import { labelOf } from '../domains/tree/tree-search'
import { isPlaceholder, markLazyPlaceholders, placeholderParentKey } from '../domains/tree/tree-lazy'
import { applyDisabled, collectDisabledKeys } from '../domains/tree/tree-disabled'
import { useTreeLazy } from '../domains/tree/useTreeLazy'
import { useTreeSearch } from '../domains/tree/useTreeSearch'
import { useTreeSelection } from '../domains/tree/useTreeSelection'
import { resolveDefaultExpandedKeys } from '../utils/tree-expand'
import TreeToolbar from '../domains/tree/components/TreeToolbar.vue'
import type { TreeEmits, TreeExposed, TreeProps, TreeSlots } from '../types/components/tree'

type WorkNode = Record<string, any>
type DefaultExpanded = boolean | number | ((node: WorkNode, depth: number) => boolean)

const props = withDefaults(defineProps<TreeProps<T, M> & {
  ui?: ComponentConfig<typeof treeTheme & typeof theme, AppConfig, 'tree'>['slots']
}>(), {
  childrenKey: 'children',
  highlight: true,
  strategy: 'cascade',
  searchDebounce: 300,
  labelKey: 'label'
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
const appConfig = useAppConfig() as { movk?: { tree?: unknown }, ui?: { icons?: Record<string, string> } }
const { t } = useMovkLocale()
const labelKey = computed(() => props.labelKey)

// 父节点 leading 图标：prop 优先，回退 app.config，最终回退 lucide 默认（与 UTree 一致）
function folderIcon(expanded: boolean): string {
  return expanded
    ? props.expandedIcon ?? appConfig.ui?.icons?.folderOpen ?? 'i-lucide-folder-open'
    : props.collapsedIcon ?? appConfig.ui?.icons?.folder ?? 'i-lucide-folder'
}
function leadingIcon(node: WorkNode, expanded: boolean): string | undefined {
  return resolveLeadingIcon(node, folderIcon(expanded))
}
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

const lazy = useTreeLazy({
  baseItems,
  getKey: () => getKey.value,
  buildBase,
  loadChildren: () => props.lazy ? props.loadChildren as ((node: WorkNode) => Promise<WorkNode[]>) | undefined : undefined,
  onError: (node, error) => emit('loadError', node as T[number], error)
})

let initialized = false
watch(() => props.items, (items) => {
  baseItems.value = lazy.rebuild((items ?? []) as WorkNode[])
  if (initialized || baseItems.value.length === 0) return
  initialized = true
  if (expanded.value.length > 0) return
  // 按类型走策略分支，确保 number 0（收起全部）不被当作假值；
  // undefined / false（含未传时 Vue 对 boolean prop 的降级）回退节点级 defaultExpanded 标记
  const de = props.defaultExpanded as DefaultExpanded
  expanded.value = (de === true || typeof de === 'number' || typeof de === 'function')
    ? resolveDefaultExpandedKeys(baseItems.value, de, { getKey: getKey.value })
    : Tree.findAll(baseItems.value, ({ node }) => !!node.defaultExpanded).map(n => getKey.value(n))
}, { immediate: true })

const { term, searching, matchedItems, isEmpty } = useTreeSearch({
  search,
  enabled: () => !!props.searchable,
  baseItems,
  expanded,
  getKey: () => getKey.value,
  labelKey: () => labelKey.value,
  filter: () => props.filter as ((node: WorkNode, term: string) => boolean) | undefined,
  searchMethod: () => props.searchMethod as ((term: string) => Promise<WorkNode[]>) | undefined,
  searchDebounce: () => props.searchDebounce,
  buildBase
})

// disabled 子树（节点自身或祖先 disabled）的 key 集合，是 disabled 级联的唯一真相来源
const disabledKeys = computed(() => collectDisabledKeys(baseItems.value, getKey.value))
const displayItems = computed(() => applyDisabled(matchedItems.value, disabledKeys.value, getKey.value))

function onExpandedUpdate(incoming: string[]) {
  if (props.disabled) return
  const previous = expanded.value
  // 冻结 disabled 子树展开态：新值仅取非 disabled 键，disabled 键保留前值
  const keys = disabledKeys.value.size
    ? [...incoming.filter(k => !disabledKeys.value.has(k)), ...previous.filter(k => disabledKeys.value.has(k))]
    : incoming
  expanded.value = keys
}

// 已展开（含初始 expanded / defaultExpanded）且仍为占位的懒加载节点自动加载
watch([expanded, baseItems], ([keys]) => {
  if (props.lazy) keys.forEach(key => lazy.load(key))
}, { immediate: true })

// MTree 拦截或重命名的键不转发给 UTree，其余属性原样透传。
const FORWARD_OMIT = new Set([
  'items', 'modelValue', 'selectedKeys', 'expanded', 'defaultExpanded', 'ui', 'class',
  'childrenKey', 'searchable', 'search', 'filter', 'highlight', 'searchMethod', 'searchDebounce',
  'lazy', 'loadChildren', 'toolbar', 'checkable',
  'multiple', 'strategy', 'propagateSelect', 'bubbleSelect'
])
const forwardProps = reactiveOmit(props, (_value, key) => FORWARD_OMIT.has(key as string))

const utreeProps = computed(() => {
  const multiple = props.checkable ? true : props.multiple
  const cascade = props.strategy !== 'isolated'
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

const isMultiple = computed(() => !!(props.checkable || props.multiple))

const selection = useTreeSelection({
  baseItems,
  getKey: () => getKey.value,
  disabledKeys,
  strategy: () => props.strategy,
  multiple: () => isMultiple.value,
  disabled: () => !!props.disabled,
  modelValue: modelValue as Ref<WorkNode | WorkNode[] | undefined>,
  selectedKeys: selectedKeysState,
  onChange: payload => emit('change', payload as never)
})
const { effectiveModel, treeSelection, summary: selectionSummaryValue, onModelUpdate, selectAll, clearSelection } = selection

const RESERVED_SLOTS = ['toolbar', 'toolbar-leading', 'toolbar-trailing', 'empty', 'loading']
const forwardSlots = computed(() => Object.keys(slots).filter(name => !RESERVED_SLOTS.includes(name)) as (keyof TreeSlots<T>)[])

const nodeLabel = (node: WorkNode) => labelOf(node, labelKey.value)

// 含 disabled 父节点：命令式 expandAll/expandToDepth 不受 onExpandedUpdate 的展开冻结约束
// （与 selectAll 一致——命令式属显式调用），冻结仅作用于用户点击 chevron 的交互路径
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

async function reload(key?: string) {
  if (key !== undefined) return lazy.reload(key)
  lazy.clearLoaded()
  baseItems.value = lazy.rebuild((props.items ?? []) as WorkNode[])
}

defineExpose<TreeExposed<T>>({
  expandAll,
  collapseAll,
  expandToDepth,
  selectAll,
  clearSelection,
  reload,
  getNode: key => selection.nodesByKey.value.get(key) as T[number] | undefined,
  get treeSelection() { return treeSelection.value as TreeExposed<T>['treeSelection'] }
})
</script>

<template>
  <div :class="extraUi.container" data-slot="container">
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
      :disabled="props.disabled"
      :selection-summary="selectionSummaryValue"
    >
      <TreeToolbar
        :toolbar="props.toolbar"
        :searchable="props.searchable"
        :checkable="props.checkable"
        :search="search"
        :size="props.size"
        :color="props.color"
        :disabled="props.disabled"
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

    <div v-if="isEmpty" :class="extraUi.empty" data-slot="empty">
      <slot name="empty">
        {{ t('tree.empty') }}
      </slot>
    </div>

    <UTree
      v-else
      v-bind="{ ...utreeProps, ...$attrs, ...(props.checkable ? { as: { link: 'div' }, onSelect: onItemSelect } : {}) }"
      :items="(displayItems as any)"
      :model-value="(effectiveModel as any)"
      :expanded="expanded"
      :ui="baseUi"
      @update:model-value="onModelUpdate($event as ModelValue)"
      @update:expanded="onExpandedUpdate"
    >
      <template v-for="name in forwardSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>

      <template v-if="props.checkable && !slots['item-leading']" #item-leading="{ item, expanded: nodeExpanded, selected, indeterminate, handleSelect, ui: nodeUi }">
        <UCheckbox
          v-if="!isPlaceholder(item)"
          :model-value="indeterminate ? 'indeterminate' : selected"
          :size="props.size"
          :color="props.color"
          :disabled="item.disabled || props.disabled"
          :class="extraUi.checkbox"
          tabindex="-1"
          @change="handleSelect"
          @click.stop
        />
        <UIcon
          v-if="leadingIcon(item, nodeExpanded)"
          :name="leadingIcon(item, nodeExpanded)!"
          :class="(nodeUi as any).linkLeadingIcon({ class: item.ui?.linkLeadingIcon })"
        />
      </template>

      <template v-if="!slots['item-label'] && (props.lazy || (searching && props.highlight))" #item-label="{ item }">
        <template v-if="isPlaceholder(item)">
          <span v-if="lazy.errorKeys.value.has(placeholderParentKey(item)!)" :class="extraUi.loading">
            {{ t('tree.loadError') }}
            <UButton
              :label="t('tree.retry')"
              color="error"
              variant="link"
              size="xs"
              :padded="false"
              @click.stop="lazy.load(placeholderParentKey(item)!, { retry: true })"
            />
          </span>
          <slot v-else name="loading" :node="item">
            <span :class="extraUi.loading">
              <UIcon name="i-lucide-loader-circle" :class="extraUi.loadingIcon" />{{ t('tree.loading') }}
            </span>
          </slot>
        </template>
        <template v-else-if="searching && props.highlight">
          <span
            v-for="(segment, index) in splitHighlight(nodeLabel(item), term)"
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
