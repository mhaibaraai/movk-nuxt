<script lang="ts" setup>
import type { ButtonProps, ComponentConfig } from '@nuxt/ui'
import { computed, ref, useAttrs } from 'vue'
import { UModal, UButton, UIcon } from '#components'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import theme from '#build/movk-ui/message-box'
import modalTheme from '#build/ui/modal'
import type { AppConfig } from 'nuxt/schema'
import type { MessageBoxProps, MessageBoxEmits, MessageBoxSlots } from '../types/components/message-box'
import type { SemanticColor } from '../types/shared'

const props = withDefaults(defineProps<MessageBoxProps & {
  type?: ComponentConfig<typeof modalTheme & typeof theme, AppConfig, 'messageBox'>['variants']['type']
  ui?: ComponentConfig<typeof modalTheme & typeof theme, AppConfig, 'messageBox'>['slots']
}>(), {
  title: '提示',
  type: 'primary',
  mode: 'alert',
  alertConfirmLabel: '知道了',
  confirmLabel: '确认',
  cancelLabel: '取消'
})
const open = defineModel<boolean>('open')
const emits = defineEmits<MessageBoxEmits>()
defineSlots<MessageBoxSlots>()

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

const { baseUi, extraUi } = useExtendedTv(
  modalTheme,
  theme,
  () => appConfig.movk?.messageBox,
  () => ({ ui: props.ui, variants: { type: props.type } })
)
</script>

<template>
  <UModal v-model:open="open" :dismissible="props.dismissible" :ui="baseUi" v-bind="attrs" @update:open="handleUpdateOpen">
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>

    <template v-if="$slots.content" #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>

    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>

    <template #title="slotProps">
      <slot name="title" v-bind="slotProps">
        <UIcon :name="resolvedIcon" :class="extraUi.icon" />
        <span>{{ props.title }}</span>
      </slot>
    </template>

    <template v-if="$slots.description" #description="slotProps">
      <slot name="description" v-bind="slotProps" />
    </template>

    <template v-if="$slots.body" #body="slotProps">
      <slot name="body" v-bind="slotProps" />
    </template>

    <template v-if="$slots.actions" #actions="slotProps">
      <slot name="actions" v-bind="slotProps" />
    </template>

    <template v-if="$slots.close" #close="slotProps">
      <slot name="close" v-bind="slotProps" />
    </template>

    <template #footer="slotProps">
      <slot name="footer" v-bind="slotProps">
        <UButton v-if="props.mode === 'confirm'" v-bind="cancelButtonAttrs" @click="handleClose(false)" />
        <UButton v-bind="confirmButtonAttrs" @click="handleClose(true)" />
      </slot>
    </template>
  </UModal>
</template>
