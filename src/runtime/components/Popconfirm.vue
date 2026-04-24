<script setup lang="ts" generic="M extends 'click' | 'hover' = 'click'">
import type { VNode } from '#imports'
import type { ClassNameValue, SemanticColor } from '../types'
import type { PopoverProps, ButtonProps, LinkPropsKeys, IconProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { isObject } from '@movk/core'
import { UPopover, UButton, UIcon } from '#components'
import { computed, ref, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import theme from '../../themes/popconfirm'
import { tv } from '@nuxt/ui/utils/tv'

export interface PopconfirmProps<M extends 'click' | 'hover' = 'click'> extends /** @vue-ignore */ OmitByKey<PopoverProps<M>, 'open' | 'defaultOpen' | 'dismissible' | 'arrow' | 'ui'> {
  /**
   * 确认气泡的标题文本。
   * @defaultValue '确认操作'
   */
  title?: string
  /**
   * 标题下方的补充说明。
   * 传入空字符串时可隐藏描述区。
   * @defaultValue '请确认是否执行此操作?'
   */
  description?: string
  /**
   * 预设的语义化颜色主题，会影响图标。
   * @defaultValue 'neutral'
   */
  type?: SemanticColor
  /**
   * 标题前展示的图标名称。
   * @IconifyIcon
   * @defaultValue 'i-lucide-circle-question-mark'
   */
  icon?: IconProps['name']
  /**
   * 气泡内容与触发器之间的箭头指示。
   * @defaultValue true
   */
  arrow?: boolean
  /**
   * 透传给确认按钮的属性。
   * `loading` 状态由组件内部托管。
   */
  confirmButton?: Omit<ButtonProps, 'loading' | LinkPropsKeys>
  /**
   * 透传给取消按钮的属性。
   * 传入 `false` 可完全隐藏取消按钮。
   * @defaultValue true
   */
  cancelButton?: ButtonProps | boolean
  /**
   * 当 `false` 时，点击遮罩层或按下 `Esc` 键将不会关闭弹层。
   * @defaultValue false
   */
  dismissible?: boolean
  /**
   * 点击确认按钮时执行的回调。
   * 支持返回 `Promise`，期间确认按钮自动进入 loading 状态。
   * 回调成功完成后弹层自动关闭并触发 `confirm` 事件；抛错时保持弹层打开。
   */
  onConfirm?: () => void | Promise<void>
  ui?: {
    header?: ClassNameValue
    title?: ClassNameValue
    description?: ClassNameValue
    body?: ClassNameValue
    footer?: ClassNameValue
  } & PopoverProps<M>['ui']
}

interface PopconfirmSlots {
  default?(props: { open: boolean }): VNode[]
  header?(props: { close: () => void }): VNode[]
  title?(props?: {}): VNode[]
  description?(props?: {}): VNode[]
  actions?(props?: {}): VNode[]
  body?(props: { close: () => void }): VNode[]
  footer?(props: { close: () => void }): VNode[]
}

interface PopconfirmEmits {
  /** 确认动作成功完成后触发。若 `onConfirm` 返回 Promise，则在其 resolve 后触发 */
  confirm: []
  /** 用户点击取消按钮时触发 */
  cancel: []
  /** 确认回调抛出异常时触发，携带原始错误 */
  error: [error: unknown]
}

const props = withDefaults(defineProps<PopconfirmProps>(), {
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
const appConfig = useAppConfig()
const openState = ref(false)
const uiCls = computed(() =>
  tv({ extend: tv(theme), ...(appConfig.ui?.popconfirm || {}) })()
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
    :ui="{
      content: uiCls.content({ class: props.ui?.content }),
      arrow: uiCls.arrow({ class: props.ui?.arrow })
    }"
  >
    <template #default="{ open }">
      <slot :open="open" />
    </template>

    <template #content="{ close }">
      <div
        v-if="!!slots.header || (props.title || !!slots.title) || (props.description || !!slots.description)"
        data-slot="header"
        :class="uiCls.header({ class: props.ui?.header })"
      >
        <slot name="header" :close="close">
          <span
            v-if="props.title || !!slots.title"
            data-slot="title"
            :class="uiCls.title({ class: props.ui?.title })"
          >
            <slot name="title">
              <UIcon :name="resolvedIcon" :class="resolvedIconColor" class="size-4 shrink-0" />
              {{ props.title }}
            </slot>
          </span>

          <p
            v-if="props.description || !!slots.description"
            data-slot="description"
            :class="uiCls.description({ class: props.ui?.description })"
          >
            <slot name="description">
              {{ props.description }}
            </slot>
          </p>
        </slot>

        <slot name="actions" />
      </div>

      <div v-if="!!slots.body" data-slot="body" :class="uiCls.body({ class: props.ui?.body })">
        <slot name="body" :close="close" />
      </div>

      <div data-slot="footer" :class="uiCls.footer({ class: props.ui?.footer })">
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
