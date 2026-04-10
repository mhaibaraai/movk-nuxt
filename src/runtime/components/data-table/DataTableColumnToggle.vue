<script setup lang="ts">
import type { VisibilityState } from '@tanstack/vue-table'
import { UButton, UCheckbox, UPopover } from '#components'
import { computed } from 'vue'

const props = defineProps<{
  /** 列 id → label 映射 */
  columnLabels: Record<string, string>
}>()

const visibility = defineModel<VisibilityState>('modelValue', { required: true })

const columns = computed(() =>
  Object.entries(props.columnLabels).map(([id, label]) => ({
    id,
    label,
    visible: visibility.value[id] !== false
  }))
)

function toggle(id: string) {
  visibility.value = {
    ...visibility.value,
    [id]: visibility.value[id] === false
  }
}
</script>

<template>
  <UPopover>
    <UButton
      icon="i-lucide-columns-3"
      color="neutral"
      variant="ghost"
      size="xs"
    />

    <template #content>
      <div class="p-2 space-y-1 min-w-40">
        <label
          v-for="col in columns"
          :key="col.id"
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-elevated cursor-pointer"
        >
          <UCheckbox
            :model-value="col.visible"
            @update:model-value="toggle(col.id)"
          />
          <span class="text-sm">{{ col.label }}</span>
        </label>
      </div>
    </template>
  </UPopover>
</template>
