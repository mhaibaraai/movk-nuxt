import type { VNode } from 'vue'
import type { ButtonProps, ColorPickerProps, IconProps, PopoverProps } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../shared'

type PopoverMode = 'click' | 'hover'

export type ColorFormat = NonNullable<ColorPickerProps['format']>
type ColorChooserTrigger = 'button' | 'chip' | 'input'

export interface ColorChooserProps<M extends PopoverMode = PopoverMode>
  extends /** @vue-ignore */ OmitByKey<PopoverProps<M>, 'open' | 'defaultOpen' | 'ui'> {
  /**
   * 当前激活的颜色格式。
   * @defaultValue 'hex'
   */
  format?: ColorFormat
  /**
   * 启用的颜色格式 tab 列表，长度 >= 2 时在 popover 顶部渲染切换器。
   * 仅一项时不渲染 tab，等价于 `format`。
   * @defaultValue ['hex']
   */
  formats?: ColorFormat[]
  /**
   * 预设色板。
   * 一维数组渲染为单行，二维数组渲染为多行分组。
   */
  swatches?: string[] | string[][]
  /**
   * 点击预设色后是否自动关闭弹层。
   * @defaultValue true
   */
  closeOnSwatch?: boolean
  /** 是否在底部 actions 区显示清除按钮。 */
  clearable?: boolean
  /** actions 区显示复制按钮（基于 navigator.clipboard）。 */
  copyable?: boolean
  /**
   * 触发器形态。
   * - `button`：色点 + 色值 / label 的常规按钮（默认）
   * - `chip`：仅一个圆形色点
   * - `input`：色点 leading + 可输入色值文本框
   * @defaultValue 'button'
   */
  trigger?: ColorChooserTrigger
  /** `trigger='button'` 时按钮上的文本，未传则显示当前色值。 */
  label?: string
  /**
   * 未选中颜色时的占位文案。
   * @defaultValue '选择颜色'
   */
  placeholder?: string
  /**
   * 触发器尺寸，同时驱动主题 size variant。
   * @defaultValue 'md'
   */
  size?: ButtonProps['size']
  /** 触发按钮的颜色（trigger=button|chip 生效）。 */
  color?: ButtonProps['color']
  /**
   * 触发按钮的视觉变体（trigger=button|chip 生效）。
   * @defaultValue 'subtle'
   */
  variant?: ButtonProps['variant']
  /** 是否禁用。禁用时弹层不会打开、所有交互失效。 */
  disabled?: boolean
  /**
   * 未选中颜色时占位的图标。
   * @IconifyIcon
   * @defaultValue 'i-lucide-palette'
   */
  icon?: IconProps['name']
  /**
   * 透传给 `UColorPicker` 的属性。
   * `modelValue`、`format`、`disabled` 由组件内部托管。
   */
  colorPickerProps?: Omit<ColorPickerProps, 'modelValue' | 'format' | 'disabled'>
  ui?: Record<string, ClassNameValue>
}

export interface ColorChooserEmits {
  'update:modelValue': [value: string | undefined]
  'update:open': [open: boolean]
  'change': [value: string | undefined]
  'clear': []
  'copy': [value: string]
  'format-change': [format: ColorFormat]
}

export interface ColorChooserSlots {
  default?(props: { open: boolean, value: string | undefined }): VNode[]
  leading?(props: { value: string | undefined }): VNode[]
  trailing?(props: { value: string | undefined }): VNode[]
  swatches?(props: { swatches: string[][], select: (color: string) => void }): VNode[]
  actions?(props: { value: string | undefined, copy: () => void, clear: () => void }): VNode[]
}
