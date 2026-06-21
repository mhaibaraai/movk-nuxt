<script lang="ts" setup>
import { UButton, UInput } from '#components'

defineProps<{
  searchable?: boolean
  checkable?: boolean
  search?: string
  ui: { toolbar?: string, toolbarButton?: string, search?: string }
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'expand-all': []
  'collapse-all': []
  'select-all': []
  'clear': []
}>()
</script>

<template>
  <div :class="ui.toolbar">
    <UInput
      v-if="searchable"
      :model-value="search"
      icon="i-lucide-search"
      placeholder="搜索节点"
      size="sm"
      :class="ui.search"
      @update:model-value="emit('update:search', String($event))"
    />
    <UButton
      icon="i-lucide-chevrons-up-down"
      color="neutral"
      variant="ghost"
      size="sm"
      :class="ui.toolbarButton"
      @click="emit('expand-all')"
    />
    <UButton
      icon="i-lucide-chevrons-down-up"
      color="neutral"
      variant="ghost"
      size="sm"
      :class="ui.toolbarButton"
      @click="emit('collapse-all')"
    />
    <template v-if="checkable">
      <UButton label="全选" color="neutral" variant="ghost" size="sm" @click="emit('select-all')" />
      <UButton label="清空" color="neutral" variant="ghost" size="sm" @click="emit('clear')" />
    </template>
  </div>
</template>
