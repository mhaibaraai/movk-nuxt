import type { VNode } from 'vue'
import type { ButtonProps, IconProps, LinkPropsKeys, PopoverProps, PopoverSlots } from '@nuxt/ui'
import type { OmitByKey, VoidCallback } from '@movk/core'
import type { ClassNameValue, SemanticColor } from '../shared'

type PopoverMode = 'click' | 'hover'

export interface PopconfirmProps<M extends PopoverMode = PopoverMode> extends /** @vue-ignore */ OmitByKey<PopoverProps<M>, 'open' | 'defaultOpen' | 'dismissible' | 'arrow' | 'ui'> {
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
  onConfirm?: VoidCallback
  ui?: Record<string, ClassNameValue>
}

export interface PopconfirmEmits {
  confirm: []
  cancel: []
  error: [error: unknown]
}

export interface PopconfirmSlots<M extends PopoverMode = PopoverMode> {
  default?(props: { open: boolean }): VNode[]
  header?: PopoverSlots<M>['content']
  title?: PopoverSlots<M>['content']
  description?: PopoverSlots<M>['content']
  actions?: PopoverSlots<M>['content']
  body?: PopoverSlots<M>['content']
  footer?: PopoverSlots<M>['content']
}
