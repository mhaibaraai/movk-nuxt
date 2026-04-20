<script setup lang="ts" generic="T">
import type { ButtonProps } from '@nuxt/ui'
import type { DataTableAction, DataTableActionButtonContext, DataTableActionPopoverProps, DataTableDynamic } from '../../types/data-table'
import { computed, ref } from 'vue'
import { resolveCallbackValue } from '../../utils/data-table-utils'

const props = defineProps<{
  action: DataTableAction<T>
  ctx: DataTableActionButtonContext<T>
  globalButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
}>()

const open = ref(false)
const confirmLoading = ref(false)

const resolvedPopoverProps = computed(() => {
  const raw = resolveCallbackValue(props.action.popoverProps ?? {}, props.ctx) as DataTableActionPopoverProps
  return {
    title: raw.title ?? '确认操作',
    description: raw.description ?? '请确认是否执行此操作?',
    icon: raw.icon ?? 'i-lucide-circle-question-mark',
    cancelButton: typeof raw.cancelButton === 'string'
      ? { label: raw.cancelButton }
      : (raw.cancelButton ?? { label: '取消' }),
    confirmButton: typeof raw.confirmButton === 'string'
      ? { label: raw.confirmButton }
      : (raw.confirmButton ?? { label: '确认' }),
    native: (() => {
      const { title: _t, description: _d, icon: _i, cancelButton: _cb, confirmButton: _cfb, ...rest } = raw
      return rest
    })()
  }
})

const resolvedButtonProps = computed(() => ({
  variant: 'ghost' as const,
  size: 'xs' as const,
  color: 'neutral' as const,
  ...resolveCallbackValue(props.globalButtonProps ?? {}, props.ctx),
  ...resolveCallbackValue(props.action.buttonProps ?? {}, props.ctx)
}))

const triggerDisabled = computed(() =>
  confirmLoading.value || resolveCallbackValue(props.action.disabled ?? false, props.ctx)
)

async function handleConfirm() {
  confirmLoading.value = true
  try {
    await props.action.onClick(props.ctx)
    open.value = false
  }
  finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <UPopover
    v-bind="resolvedPopoverProps.native"
    v-model:open="open"
  >
    <UButton
      v-bind="resolvedButtonProps"
      :disabled="triggerDisabled"
      @click.stop="open = true"
    />
    <template #content>
      <div class="p-3 flex flex-col gap-2 max-w-55">
        <div class="flex items-center gap-2">
          <UIcon
            v-if="resolvedPopoverProps.icon"
            :name="resolvedPopoverProps.icon"
            class="text-highlighted shrink-0"
          />
          <p class="text-sm font-medium text-highlighted">
            {{ resolvedPopoverProps.title }}
          </p>
        </div>
        <p
          v-if="resolvedPopoverProps.description"
          class="text-xs text-muted"
        >
          {{ resolvedPopoverProps.description }}
        </p>
        <div class="flex justify-end gap-2 mt-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            v-bind="resolvedPopoverProps.cancelButton"
            :disabled="confirmLoading"
            @click="open = false"
          />
          <UButton
            :color="(resolvedButtonProps.color ?? 'primary') as 'primary'"
            size="xs"
            v-bind="resolvedPopoverProps.confirmButton"
            :loading="confirmLoading"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
