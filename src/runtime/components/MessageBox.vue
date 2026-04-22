<script setup lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ModalProps, ButtonProps, IconProps } from '@nuxt/ui'
import type { SemanticColor } from '../types'
import { computed, useAttrs, ref } from 'vue'
import { UModal, UButton, UIcon } from '#components'

type MessageBoxMode = 'alert' | 'confirm'

export interface MessageBoxProps extends /** @vue-ignore */ OmitByKey<ModalProps, 'title' | 'open' | 'defaultOpen' | 'dismissible'> {
  /**
   * 模态框标题文本。
   * @defaultValue '提示'
   */
  title?: string
  /**
   * 控制消息框的语义类型。
   * 会影响默认图标与确认按钮颜色。
   * @defaultValue 'primary'
   */
  type?: SemanticColor
  /**
   * 标题前展示的图标名称。
   * @IconifyIcon
   * @defaultValue 'i-lucide-circle-question-mark'
   */
  icon?: IconProps['name']
  /**
   * 控制消息框的操作模式。
   * `alert` 仅显示确认按钮，`confirm` 显示取消与确认按钮。
   * @defaultValue 'alert'
   */
  mode?: MessageBoxMode
  /**
   * 当 `false` 时，点击遮罩层或按下 `Esc` 键将不会关闭模态框。
   * @defaultValue false
   */
  dismissible?: boolean
  /**
   * alert 模式下的确认按钮文本。
   * @defaultValue '知道了'
   */
  alertConfirmLabel?: string
  /**
   * 确认按钮文本。
   * @defaultValue '确认'
   */
  confirmLabel?: string
  /**
   * 取消按钮文本。
   * @defaultValue '取消'
   */
  cancelLabel?: string
  /**
   * 透传给确认按钮的属性。
   * 未显式指定 `color` 时会默认继承当前 `type`。
   */
  confirmButton?: ButtonProps
  /**
   * 透传给取消按钮的属性。
   * 仅在 `mode='confirm'` 时渲染。
   */
  cancelButton?: ButtonProps
}

const props = withDefaults(defineProps<MessageBoxProps>(), {
  title: '提示',
  type: 'primary',
  mode: 'alert',
  dismissible: false,
  alertConfirmLabel: '知道了',
  confirmLabel: '确认',
  cancelLabel: '取消'
})

const open = defineModel<boolean>('open')

const emits = defineEmits<{
  /**
   * 模态框关闭时触发。
   * - `true`：用户点击了确认
   * - `false`：用户点击了取消或通过其他方式关闭
   */
  close: [confirmed: boolean]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const iconMap = {
  primary: 'i-lucide-bell',
  info: 'i-lucide-info',
  success: 'i-lucide-circle-check',
  warning: 'i-lucide-triangle-alert',
  error: 'i-lucide-circle-x',
  neutral: 'i-lucide-circle-question-mark'
} satisfies Record<SemanticColor, string>

const iconColorMap = {
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-muted'
} satisfies Record<SemanticColor, string>

const resolvedIcon = computed(() => props.icon ?? iconMap[props.type])
const resolvedIconColor = computed(() => iconColorMap[props.type])

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

const resolvedUI = computed(() => ({
  title: 'flex gap-2 items-center',
  footer: 'justify-end',
  ...(attrs.ui as ModalProps['ui'] ?? {})
}))
</script>

<template>
  <UModal v-model:open="open" :dismissible="props.dismissible" v-bind="attrs" :ui="resolvedUI" @update:open="handleUpdateOpen">
    <template #title>
      <UIcon :name="resolvedIcon" :class="resolvedIconColor" class="size-5 shrink-0" />
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
