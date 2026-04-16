<script setup lang="ts" generic="T">
import type { DataTableAction } from '../../types/data-table'
import { computed, ref } from 'vue'
import { resolveCallbackValue } from '../../utils/data-table-utils'

const props = defineProps<{
  action: DataTableAction<T>
  row: T
  rowIndex: number
}>()

const open = ref(false)

const {
  title: rawTitle,
  description: rawDescription,
  icon: rawIcon,
  cancelButton: rawCancelButton,
  confirmButton: rawConfirmButton,
  ...nativePopoverProps
} = props.action.popoverProps ?? {}

const title = rawTitle ?? '确认操作'
const description = rawDescription ?? '请确认是否执行此操作?'
const icon = rawIcon ?? 'i-lucide-circle-question-mark'

const cancelButton = typeof rawCancelButton === 'string'
  ? { label: rawCancelButton }
  : (rawCancelButton ?? { label: '取消' })

const confirmButton = typeof rawConfirmButton === 'string'
  ? { label: rawConfirmButton }
  : (rawConfirmButton ?? { label: '确认' })

// 只提取 ButtonProps 兼容的字段，排除 DataTableAction 专有字段
const buttonBindings = computed(() => {
  const { onClick: _onClick, disabled: _disabled, visibility: _visibility, popover: _popover, popoverProps: _popoverProps, ...rest } = props.action
  return rest
})

function handleConfirm() {
  open.value = false
  props.action.onClick(props.row, props.rowIndex)
}
</script>

<template>
  <UPopover
    v-bind="nativePopoverProps"
    v-model:open="open"
  >
    <UButton
      v-bind="buttonBindings"
      :disabled="resolveCallbackValue(action.disabled ?? false, row)"
      @click.stop="open = true"
    />
    <template #content>
      <div class="p-3 flex flex-col gap-2 max-w-55">
        <div class="flex items-center gap-2">
          <UIcon
            v-if="icon"
            :name="icon"
            class="text-highlighted shrink-0"
          />
          <p class="text-sm font-medium text-highlighted">
            {{ title }}
          </p>
        </div>
        <p
          v-if="description"
          class="text-xs text-muted"
        >
          {{ description }}
        </p>
        <div class="flex justify-end gap-2 mt-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            v-bind="cancelButton"
            @click="open = false"
          />
          <UButton
            :color="(action.color ?? 'primary') as 'primary'"
            size="xs"
            v-bind="confirmButton"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
