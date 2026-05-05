<script lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { DataTableAction, DataTableActionButtonContext, DataTableDynamic } from '../../types/data-table'

interface DataTableRendererActionConfirmProps {
  action: DataTableAction<unknown>
  ctx: DataTableActionButtonContext<unknown>
  globalButtonProps?: DataTableDynamic<ButtonProps, DataTableActionButtonContext<unknown>>
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { resolveCallbackValue } from '../../domains/data-table/columns/utils'
import { useMessageBox } from '../../composables/useMessageBox'

const props = defineProps<DataTableRendererActionConfirmProps>()

const { confirm } = useMessageBox()
const loading = ref(false)

const resolvedButtonProps = computed<ButtonProps>(() => ({
  variant: 'ghost',
  size: 'xs',
  color: 'neutral',
  ...resolveCallbackValue(props.globalButtonProps ?? {}, props.ctx),
  ...resolveCallbackValue(props.action.buttonProps ?? {}, props.ctx)
}))

const disabled = computed(() =>
  loading.value || resolveCallbackValue(props.action.disabled ?? false, props.ctx)
)

async function handleClick(event: Event) {
  event.stopPropagation()
  if (props.action.confirm) {
    const ok = await confirm(resolveCallbackValue(props.action.confirmProps ?? {}, props.ctx))
    if (!ok) return
  }
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
  <UButton v-bind="resolvedButtonProps" :loading="loading" :disabled="disabled" @click="handleClick" />
</template>
