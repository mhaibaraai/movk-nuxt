<script lang="ts" setup>
import { ref } from 'vue'
import { UButton, UCheckbox, UIcon, UPopover } from '#components'
import { useMovkLocale } from '../../../composables/useMovkLocale'

export interface ColumnSettingsItem {
  id: string
  label: string
  visible: boolean
  hideable: boolean
}

defineProps<{ items: ColumnSettingsItem[] }>()

const emit = defineEmits<{
  toggle: [id: string, visible: boolean]
  move: [from: number, to: number]
  reset: []
}>()

const { t } = useMovkLocale()
const dragIndex = ref<number>()

function onDrop(index: number) {
  if (dragIndex.value !== undefined && dragIndex.value !== index) emit('move', dragIndex.value, index)
  dragIndex.value = undefined
}
</script>

<template>
  <UPopover :content="{ align: 'end' }">
    <UButton
      icon="i-lucide-settings-2"
      color="neutral"
      variant="outline"
      size="sm"
      :aria-label="t('dataTable.columnSettings')"
    />

    <template #content>
      <div class="flex flex-col gap-1 p-2 min-w-48" data-slot="column-settings">
        <ul class="flex flex-col">
          <li
            v-for="(item, index) in items"
            :key="item.id"
            draggable="true"
            class="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-elevated/50"
            :class="{ 'opacity-50': dragIndex === index }"
            @dragstart="dragIndex = index"
            @dragover.prevent
            @drop="onDrop(index)"
            @dragend="dragIndex = undefined"
          >
            <UIcon name="i-lucide-grip-vertical" class="size-4 shrink-0 cursor-grab text-dimmed" />
            <UCheckbox
              :model-value="item.visible"
              :disabled="!item.hideable"
              :label="item.label"
              class="flex-1"
              @update:model-value="emit('toggle', item.id, $event === true)"
            />
          </li>
        </ul>
        <UButton
          :label="t('dataTable.resetColumns')"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          size="xs"
          block
          @click="emit('reset')"
        />
      </div>
    </template>
  </UPopover>
</template>
