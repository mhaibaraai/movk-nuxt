<script lang="ts" setup>
import type { ButtonProps, ComponentConfig } from '@nuxt/ui'
import { computed, ref, useAttrs } from 'vue'
import { UModal, UButton, UIcon } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import theme from '#build/movk-ui/message-box'
import modalTheme from '#build/ui/modal'
import type { AppConfig } from 'nuxt/schema'
import type { MessageBoxProps, MessageBoxEmits } from '../types/components/message-box'
import type { SemanticColor } from '../types/shared'

interface Props extends MessageBoxProps {
  ui?: ComponentConfig<typeof modalTheme & typeof theme, AppConfig, 'messageBox'>['slots']
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  type: 'primary',
  mode: 'alert',
  dismissible: false,
  alertConfirmLabel: '知道了',
  confirmLabel: '确认',
  cancelLabel: '取消'
})
const open = defineModel<boolean>('open')
const emits = defineEmits<MessageBoxEmits>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { messageBox?: unknown } }

const iconMap = {
  primary: 'i-lucide-bell',
  info: 'i-lucide-info',
  success: 'i-lucide-circle-check',
  warning: 'i-lucide-triangle-alert',
  error: 'i-lucide-circle-x',
  neutral: 'i-lucide-circle-question-mark'
} satisfies Record<SemanticColor, string>

const resolvedIcon = computed(() => props.icon ?? iconMap[props.type])

const cancelButtonAttrs = computed<ButtonProps>(() => ({
  color: 'neutral' as const,
  variant: 'outline' as const,
  label: props.cancelLabel,
  ...(props.cancelButton ?? {})
}))

const confirmButtonAttrs = computed<ButtonProps>(() => ({
  color: props.type,
  label: props.mode === 'alert' ? props.alertConfirmLabel : props.confirmLabel,
  ...(props.confirmButton ?? {})
}))

const closingFromButton = ref(false)

function handleClose(confirmed: boolean) {
  closingFromButton.value = true
  emits('close', confirmed)
  open.value = false
}

function handleUpdateOpen(val: boolean) {
  if (val) return
  if (closingFromButton.value) {
    closingFromButton.value = false
    return
  }
  emits('close', false)
}

const { ui, extraUi } = useExtendedTv(
  modalTheme,
  theme,
  () => appConfig.movk?.messageBox,
  () => ({ ui: props.ui, variants: { type: props.type } })
)
</script>

<template>
  <UModal v-model:open="open" :dismissible="props.dismissible" :ui="ui" v-bind="attrs" @update:open="handleUpdateOpen">
    <template #title>
      <UIcon :name="resolvedIcon" :class="extraUi.icon" />
      <span>{{ props.title }}</span>
    </template>

    <template v-if="$slots.default" #body>
      <slot />
    </template>

    <template #footer>
      <UButton v-if="props.mode === 'confirm'" v-bind="cancelButtonAttrs" @click="handleClose(false)" />
      <UButton v-bind="confirmButtonAttrs" @click="handleClose(true)" />
    </template>
  </UModal>
</template>
