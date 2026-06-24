<script lang="ts" setup>
import { computed } from 'vue'
import { UButton, UCheckbox, UInput, UTooltip } from '#components'
import type { TreeProps, TreeSelectionSummary } from '../../../types/components/tree'

const props = defineProps<{
  /** 是否渲染展开/折叠切换与全选控件 */
  toolbar?: boolean
  searchable?: boolean
  checkable?: boolean
  search?: string
  size?: TreeProps['size']
  color?: TreeProps['color']
  /** 是否已全部展开，驱动展开/折叠切换按钮 */
  expanded?: boolean
  /** 禁用工具栏全部控件 */
  disabled?: boolean
  selectionSummary?: TreeSelectionSummary
  ui: { toolbar?: string, toolbarButton?: string, search?: string }
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'toggle-expand': []
  'select-all': []
  'clear': []
}>()

const checkboxLabel = computed(() => {
  const count = props.selectionSummary?.checkedCount ?? 0
  return count > 0 ? `已选 ${count}` : '全选'
})

const expandTooltip = computed(() => props.expanded ? '折叠全部' : '展开全部')

function onToggleAll(checked: boolean) {
  if (checked) emit('select-all')
  else emit('clear')
}
</script>

<template>
  <div :class="ui.toolbar" data-slot="toolbar">
    <slot name="leading" />

    <UInput
      v-if="searchable"
      :model-value="search"
      icon="i-lucide-search"
      placeholder="搜索节点"
      :size="size"
      :disabled="disabled"
      :class="ui.search"
      @update:model-value="emit('update:search', String($event))"
    >
      <template v-if="search" #trailing>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="link"
          :size="size"
          :disabled="disabled"
          aria-label="清除搜索"
          @click="emit('update:search', '')"
        />
      </template>
    </UInput>

    <UTooltip v-if="toolbar" :text="expandTooltip">
      <UButton
        :icon="expanded ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        :size="size"
        :disabled="disabled"
        :class="ui.toolbarButton"
        :aria-label="expandTooltip"
        @click="emit('toggle-expand')"
      />
    </UTooltip>

    <UCheckbox
      v-if="toolbar && checkable"
      :model-value="selectionSummary?.allChecked ?? false"
      :indeterminate="selectionSummary?.indeterminate ?? false"
      :size="size"
      :color="color"
      :disabled="disabled"
      :label="checkboxLabel"
      @update:model-value="onToggleAll(Boolean($event))"
    />

    <slot name="trailing" />
  </div>
</template>
