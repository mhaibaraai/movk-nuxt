import type { ButtonProps, IconProps, ModalProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue, SemanticColor } from '../shared'

export interface MessageBoxProps extends /** @vue-ignore */ OmitByKey<ModalProps, 'title' | 'open' | 'defaultOpen' | 'dismissible' | 'ui'> {
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
  mode?: 'alert' | 'confirm'
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
  ui?: Record<string, ClassNameValue>
}

export interface MessageBoxEmits {
  /**
   * 模态框关闭时触发。
   * - `true`：用户点击了确认
   * - `false`：用户点击了取消或通过其他方式关闭
   */
  close: [confirmed: boolean]
}
