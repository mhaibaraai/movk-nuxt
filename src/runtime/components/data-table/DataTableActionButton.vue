<script setup lang="ts" generic="T">
import type { ButtonProps } from '@nuxt/ui'
import type { DataTableAction, DataTableActionButtonContext, DataTableDynamic } from '../../types/data-table'
import { computed, ref } from 'vue'
import { resolveCallbackValue } from '../../utils/data-table-utils'

const props = defineProps<{
  action: DataTableAction<T>
  ctx: DataTableActionButtonContext<T>
  globalButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<T>>
}>()

const loading = ref(false)

const resolvedButtonProps = computed(() => ({
  variant: 'ghost' as const,
  size: 'xs' as const,
  color: 'neutral' as const,
  ...resolveCallbackValue(props.globalButtonProps ?? {}, props.ctx),
  ...resolveCallbackValue(props.action.buttonProps ?? {}, props.ctx)
}))

const disabled = computed(() =>
  loading.value || resolveCallbackValue(props.action.disabled ?? false, props.ctx)
)

async function handleClick(event: Event) {
  event.stopPropagation()
  loading.value = true
  try {
    await props.action.onClick(props.ctx)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UButton
    v-bind="resolvedButtonProps"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  />
</template>
