<script setup lang="ts" generic="T">
import type { ButtonProps } from '@nuxt/ui'
import type { DataTableAction, DataTableActionButtonContext, DataTableActionPopoverProps, DataTableDynamic } from '../../types/data-table'
import Popconfirm from '../Popconfirm.vue'
import { computed } from 'vue'
import { resolveCallbackValue } from '../../utils/data-table-utils'

const props = defineProps<{
  action: DataTableAction<T>
  ctx: DataTableActionButtonContext<T>
  globalButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
}>()

const resolvedButtonProps = computed(() => ({
  variant: 'ghost' as const,
  size: 'xs' as const,
  color: 'neutral' as const,
  ...resolveCallbackValue(props.globalButtonProps ?? {}, props.ctx),
  ...resolveCallbackValue(props.action.buttonProps ?? {}, props.ctx)
}))

const resolvedPopoverProps = computed(() => {
  const raw = resolveCallbackValue(props.action.popoverProps ?? {}, props.ctx) as DataTableActionPopoverProps
  const cancelButton = typeof raw.cancelButton === 'string'
    ? { label: raw.cancelButton }
    : raw.cancelButton ?? { label: '取消' }
  const confirmButtonBase = typeof raw.confirmButton === 'string'
    ? { label: raw.confirmButton }
    : raw.confirmButton ?? { label: '确认' }
  const confirmButton = {
    ...confirmButtonBase,
    color: confirmButtonBase.color ?? resolvedButtonProps.value.color ?? 'primary'
  }
  const { title, description, icon, cancelButton: _cb, confirmButton: _cfb, ...popoverPassthrough } = raw
  return {
    title: title ?? '确认操作',
    description: description ?? '请确认是否执行此操作?',
    icon: icon ?? 'i-lucide-circle-question-mark',
    cancelButton,
    confirmButton,
    popoverPassthrough
  }
})

const triggerDisabled = computed(() =>
  resolveCallbackValue(props.action.disabled ?? false, props.ctx)
)
</script>

<template>
  <Popconfirm
    v-bind="resolvedPopoverProps.popoverPassthrough"
    :title="resolvedPopoverProps.title"
    :description="resolvedPopoverProps.description"
    :icon="resolvedPopoverProps.icon"
    :cancel-button="resolvedPopoverProps.cancelButton"
    :confirm-button="resolvedPopoverProps.confirmButton"
    :on-confirm="() => action.onClick(ctx)"
  >
    <UButton
      v-bind="resolvedButtonProps"
      :disabled="triggerDisabled"
      @click.stop
    />
  </Popconfirm>
</template>
