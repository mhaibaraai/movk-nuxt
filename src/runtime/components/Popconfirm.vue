<script lang="ts" setup generic="M extends 'click' | 'hover'">
import type { ButtonProps, ComponentConfig } from '@nuxt/ui'
import { isObject } from '@movk/core'
import { UPopover, UButton, UIcon } from '#components'
import { computed, ref, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../utils/extend-theme'
import theme from '#build/movk-ui/popconfirm'
import popoverTheme from '#build/ui/popover'
import type { AppConfig } from 'nuxt/schema'
import type { PopconfirmProps, PopconfirmEmits, PopconfirmSlots } from '../types/components/popconfirm'
import type { SemanticColor } from '../types/shared'

interface Props extends PopconfirmProps {
  ui?: ComponentConfig<typeof popoverTheme & typeof theme, AppConfig, 'popconfirm'>['slots']
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  description: '请确认是否执行此操作?',
  type: 'neutral',
  icon: 'i-lucide-circle-question-mark',
  dismissible: false,
  arrow: true,
  cancelButton: true
})
const emits = defineEmits<PopconfirmEmits>()
const slots = defineSlots<PopconfirmSlots>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { popconfirm?: unknown } }

const openState = ref(false)

const { ui, extraUi } = useExtendedTv(
  popoverTheme,
  theme,
  () => appConfig.movk?.popconfirm,
  () => ({ ui: props.ui, variants: { type: props.type } })
)
const confirmLoading = ref(false)

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
  size: 'xs' as const,
  label: '取消',
  variant: 'soft' as const,
  ...(isObject(props.cancelButton) ? props.cancelButton : {})
}))

const confirmButtonAttrs = computed<ButtonProps>(() => ({
  color: 'primary' as const,
  size: 'xs' as const,
  label: '确认',
  ...(props.confirmButton ?? {})
}))

function handleCancel(close: () => void) {
  if (confirmLoading.value) return
  emits('cancel')
  close()
}

async function handleConfirm(close: () => void) {
  if (confirmLoading.value) return
  try {
    const result = props.onConfirm?.()
    if (result instanceof Promise) {
      confirmLoading.value = true
      await result
    }
    emits('confirm')
    close()
  }
  catch (err) {
    emits('error', err)
  }
  finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <UPopover
    v-bind="attrs"
    v-model:open="openState"
    :dismissible="props.dismissible"
    :arrow="props.arrow"
    :ui="ui"
  >
    <template #default="{ open }">
      <slot :open="open" />
    </template>

    <template #content="{ close }">
      <div
        v-if="!!slots.header || (props.title || !!slots.title) || (props.description || !!slots.description)"
        data-slot="header"
        :class="extraUi.header"
      >
        <slot name="header" :close="close">
          <span
            v-if="props.title || !!slots.title"
            data-slot="title"
            :class="extraUi.title"
          >
            <slot name="title" :close="close">
              <UIcon :name="resolvedIcon" :class="extraUi.icon" />
              {{ props.title }}
            </slot>
          </span>

          <p
            v-if="props.description || !!slots.description"
            data-slot="description"
            :class="extraUi.description"
          >
            <slot name="description" :close="close">
              {{ props.description }}
            </slot>
          </p>
        </slot>

        <slot name="actions" :close="close" />
      </div>

      <div v-if="!!slots.body" data-slot="body" :class="extraUi.body">
        <slot name="body" :close="close" />
      </div>

      <div data-slot="footer" :class="extraUi.footer">
        <slot name="footer" :close="close">
          <UButton
            v-if="props.cancelButton !== false"
            v-bind="cancelButtonAttrs"
            @click="handleCancel(close)"
          />
          <UButton
            v-bind="confirmButtonAttrs"
            :loading="confirmLoading"
            @click="handleConfirm(close)"
          />
        </slot>
      </div>
    </template>
  </UPopover>
</template>
