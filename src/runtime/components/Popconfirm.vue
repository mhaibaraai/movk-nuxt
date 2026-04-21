<script setup lang="ts" generic="M extends 'click' | 'hover' = 'click'">
import { UPopover, UButton, UIcon } from '#components'
import type { VNode } from '#imports'
import type { OmitByKey } from '@movk/core'
import type { PopoverProps, ButtonProps, LinkPropsKeys, IconProps } from '@nuxt/ui'
import { computed, ref, useAttrs } from 'vue'
import type { ClassNameValue } from '../types'

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
   */
  cancelButton?: ButtonProps | false
  /**
   * 禁用触发器并阻止弹层打开。
   */
  disabled?: boolean
  /**
   * 当 `false` 时，点击遮罩层或按下 `Esc` 键将不会关闭弹层。
   * @defaultValue false
   */
  dismissible?: boolean
  /**
   * 用户点击确认按钮时执行的同步或异步回调。
   * 返回 Promise 时会自动显示 loading 并在完成后关闭弹层。
   */
  onConfirm?: () => Promise<void> | void
  ui?: {
    header?: ClassNameValue
    title?: ClassNameValue
    description?: ClassNameValue
    body?: ClassNameValue
    footer?: ClassNameValue
  } & PopoverProps<M>['ui']
}

export interface PopconfirmSlots {
  default?(props: { open: boolean }): VNode[]
  header?(props: { close: () => void }): VNode[]
  title?(props?: {}): VNode[]
  description?(props?: {}): VNode[]
  actions?(props?: {}): VNode[]
  body?(props: { close: () => void }): VNode[]
  footer?(props: { close: () => void }): VNode[]
}

const props = withDefaults(defineProps<PopconfirmProps>(), {
  title: '确认操作',
  description: '请确认是否执行此操作?',
  icon: 'i-lucide-circle-question-mark',
  dismissible: false,
  arrow: true
})

const emits = defineEmits<{
  /** 用户点击确认按钮且 onConfirm 回调成功执行后触发 */
  confirm: []
  /** 用户点击取消按钮时触发 */
  cancel: []
}>()

const slots = defineSlots<PopconfirmSlots>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const confirmLoading = ref(false)

const cancelButtonAttrs = computed(() => {
  const base = { color: 'neutral' as const, variant: 'outline' as const, size: 'xs' as const, label: '取消' }
  if (!props.cancelButton) return base
  return { ...base, ...props.cancelButton }
})

const confirmButtonAttrs = computed(() => ({
  color: 'primary' as const,
  size: 'xs' as const,
  label: '确认',
  ...(props.confirmButton ?? {})
}))
</script>

<template>
  <UPopover
    :dismissible="props.dismissible"
    :arrow="props.arrow"
    v-bind="attrs"
    :ui="{
      content: `p-2 sm:px-4 flex flex-col gap-1.5 ${props.ui?.content ?? ''}`,
      arrow: props.ui?.arrow ?? ''
    }"
  >
    <template #default="{ open }">
      <slot :open="open" />
    </template>

    <template #content="{ close }">
      <div
        v-if="!!slots.header || (props.title || !!slots.title) || (props.description || !!slots.description)"
        data-slot="header"
        class="flex flex-col gap-1"
        :class="props.ui?.header ?? ''"
      >
        <slot name="header" :close="close">
          <span
            v-if="props.title || !!slots.title"
            data-slot="title"
            class="flex gap-2 items-center text-sm text-highlighted font-semibold"
            :class="props.ui?.title ?? ''"
          >
            <slot name="title">
              <UIcon :name="props.icon" class="size-4 shrink-0" />
              {{ props.title }}
            </slot>
          </span>

          <p
            v-if="props.description || !!slots.description"
            data-slot="description"
            class="text-muted text-xs"
            :class="props.ui?.description ?? ''"
          >
            <slot name="description">
              {{ props.description }}
            </slot>
          </p>
        </slot>

        <slot name="actions" />
      </div>

      <div v-if="!!slots.body" data-slot="body" :class="props.ui?.body ?? ''">
        <slot name="body" :close="close" />
      </div>

      <div data-slot="footer" class="flex items-center justify-end gap-1.5" :class="props.ui?.footer ?? ''">
        <slot name="footer" :close="close">
          <UButton v-if="cancelButton !== false" v-bind="cancelButtonAttrs" :disabled="confirmLoading" />
          <UButton v-bind="confirmButtonAttrs" :loading="confirmLoading" />
        </slot>
      </div>
    </template>
  </UPopover>
</template>
