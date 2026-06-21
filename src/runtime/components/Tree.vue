<script lang="ts" setup
  generic="T extends TreeItem[] = TreeItem[], M extends boolean = false"
>
import type { AppConfig } from 'nuxt/schema'
import type { ComponentConfig, TreeItem } from '@nuxt/ui'
import { computed, ref, useSlots, watch } from 'vue'
import { Tree, omitUndefined, splitHighlight } from '@movk/core'
import { UCheckbox, UIcon, UTree } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import treeTheme from '#build/ui/tree'
import theme from '#build/movk-ui/tree'
import { createGetKey, normalizeChildren } from '../domains/tree/resolve-tree'
import { matchLabel } from '../domains/tree/tree-search'
import { isPlaceholder, markLazyPlaceholders } from '../domains/tree/tree-lazy'
import TreeToolbar from '../domains/tree/components/TreeToolbar.vue'
import type { TreeEmits, TreeProps, TreeSlots } from '../types/components/tree'

type WorkNode = Record<string, any>

const props = withDefaults(defineProps<TreeProps<T, M> & {
  ui?: ComponentConfig<typeof treeTheme & typeof theme, AppConfig, 'tree'>['slots']
}>(), {
  childrenKey: 'children',
  highlight: true
})

defineEmits<TreeEmits<T, M>>()
defineSlots<TreeSlots<T>>()
defineOptions({ inheritAttrs: false })

type ModelValue = TreeProps<T, M>['modelValue']
const modelValue = defineModel<ModelValue>()
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
  () => ({ ui: props.ui })
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
    if (!props.expanded && expanded.value.length === 0) {
      const fromNodes = Tree.findAll(baseItems.value, ({ node }) => !!node.defaultExpanded).map(n => getKey.value(n))
      expanded.value = props.defaultExpanded ?? fromNodes
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
        { id: labelKey.value }
      )
    }
    finally {
      const set = new Set(loadingKeys.value)
      set.delete(key)
      loadingKeys.value = set
    }
  }
}

const utreeProps = computed(() => {
  const {
    items: _items, modelValue: _model, expanded: _expanded, defaultExpanded: _default,
    ui: _ui, class: _class, childrenKey: _ck, searchable: _s, search: _se, filter: _f,
    highlight: _h, lazy: _l, loadChildren: _lc, toolbar: _t,
    checkable, multiple, propagateSelect, bubbleSelect, ...rest
  } = props as Record<string, unknown>

  const selection = checkable
    ? { multiple: true, propagateSelect: propagateSelect ?? true, bubbleSelect: bubbleSelect ?? true }
    : { multiple, propagateSelect, bubbleSelect }

  return omitUndefined({ ...rest, ...selection }) as Record<string, any>
})

const RESERVED_SLOTS = ['toolbar', 'empty', 'loading']
const forwardSlots = computed(() => Object.keys(slots).filter(name => !RESERVED_SLOTS.includes(name)) as (keyof TreeSlots<T>)[])

function nodeLabel(node: WorkNode): string {
  const value = node[labelKey.value]
  return value == null ? '' : String(value)
}

function expandAll() {
  expanded.value = Tree.findAll(baseItems.value, ({ node }) => !!node.children?.length).map(n => getKey.value(n))
}
function collapseAll() {
  expanded.value = []
}
function selectAll() {
  modelValue.value = Tree.findAll(baseItems.value, ({ node }) => !isPlaceholder(node)) as ModelValue
}
function clearSelection() {
  modelValue.value = (Array.isArray(modelValue.value) ? [] : undefined) as ModelValue
}
</script>

<template>
  <div :class="extraUi.container">
    <slot
      v-if="props.toolbar || slots.toolbar"
      name="toolbar"
      :expand-all="expandAll"
      :collapse-all="collapseAll"
      :select-all="selectAll"
      :clear="clearSelection"
      :search="search"
    >
      <TreeToolbar
        :searchable="props.searchable"
        :checkable="props.checkable"
        :search="search"
        :ui="{ toolbar: extraUi.toolbar, toolbarButton: extraUi.toolbarButton, search: extraUi.search }"
        @update:search="search = $event"
        @expand-all="expandAll"
        @collapse-all="collapseAll"
        @select-all="selectAll"
        @clear="clearSelection"
      />
    </slot>

    <div v-if="isEmpty" :class="extraUi.empty">
      <slot name="empty">
        无匹配结果
      </slot>
    </div>

    <UTree
      v-else
      v-bind="{ ...utreeProps, ...$attrs }"
      :items="(displayItems as any)"
      :model-value="(modelValue as any)"
      :expanded="expanded"
      :ui="(baseUi as any)"
      :class="props.class"
      @update:model-value="modelValue = ($event as any)"
      @update:expanded="onExpandedUpdate"
    >
      <template v-for="name in forwardSlots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>

      <template v-if="props.checkable && !slots['item-leading']" #item-leading="{ item, selected, indeterminate, handleSelect }">
        <UCheckbox
          v-if="!isPlaceholder(item)"
          :model-value="selected"
          :indeterminate="indeterminate"
          :class="extraUi.checkbox"
          @click.stop="handleSelect()"
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
