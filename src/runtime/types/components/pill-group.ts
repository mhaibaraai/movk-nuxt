import type { VNode } from 'vue'
import type {
  AcceptableValue,
  AvatarProps,
  ButtonProps,
  GetItemKeys,
  GetModelValue
} from '@nuxt/ui'
import type { ClassNameValue } from '../shared'

export type PillGroupValue = AcceptableValue

type PillItemUI = 'item' | 'itemWrapper' | 'itemLabel' | 'itemDescription' | 'leading' | 'trailing'

export type PillItem = PillGroupValue | {
  value?: PillGroupValue
  label?: string
  description?: string
  disabled?: boolean
  icon?: string
  avatar?: AvatarProps
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  onSelect?: (e: Event) => void
  class?: ClassNameValue
  ui?: Partial<Record<PillItemUI, ClassNameValue>>
  [key: string]: any
}

export interface PillGroupProps<
  T extends PillItem = PillItem,
  VK extends GetItemKeys<T> | undefined = undefined,
  M extends boolean = false
> {
  items?: T[]
  valueKey?: VK
  /** @defaultValue 'label' */
  labelKey?: GetItemKeys<T>
  /** @defaultValue 'description' */
  descriptionKey?: GetItemKeys<T>
  /**
   * 对象模式下判定 selected 的比较依据。string 走 `getPath` 比较（multiple=true 时启用 Map O(1)）；
   * function 自定义比较；不传则按 [valueKey, 'value', labelKey] 启发式回退。
   */
  by?: string | ((a: T, b: T) => boolean)
  /**
   * 排列方向
   * @defaultValue 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * 按钮尺寸
   * @defaultValue 'md'
   */
  size?: ButtonProps['size']
  /**
   * 按钮颜色
   * @defaultValue 'primary'
   */
  color?: ButtonProps['color']
  /**
   * 选中态单项视觉变体
   * @defaultValue 'solid'
   */
  activeVariant?: ButtonProps['variant']
  /**
   * 未选中态单项视觉变体
   * @defaultValue 'soft'
   */
  inactiveVariant?: ButtonProps['variant']
  disabled?: boolean
  /** 是否可以多选 */
  multiple?: M & boolean
  /** 单选：再次点击当前选中项清空（多选模式下被忽略） */
  deselectable?: boolean
  /** 多选：最多可选数量 */
  max?: number
  /** 多选：最少需保留数量 */
  min?: number
  defaultValue?: GetModelValue<T, VK, M>
  modelValue?: GetModelValue<T, VK, M>
  class?: ClassNameValue
  ui?: Record<string, ClassNameValue>
}

type ItemSlotProps<T extends PillItem> = (props: {
  item: T
  index: number
  selected: boolean
}) => VNode[]

type GroupSlotProps<
  T extends PillItem,
  VK extends GetItemKeys<T> | undefined,
  M extends boolean
> = (props: {
  modelValue: GetModelValue<T, VK, M> | undefined
  items: T[]
}) => VNode[]

export interface PillGroupSlots<
  T extends PillItem = PillItem,
  VK extends GetItemKeys<T> | undefined = undefined,
  M extends boolean = false
> {
  'leading'?: GroupSlotProps<T, VK, M>
  'default'?: GroupSlotProps<T, VK, M>
  'trailing'?: GroupSlotProps<T, VK, M>
  'item'?: ItemSlotProps<T>
  'item-leading'?: ItemSlotProps<T>
  'item-label'?: ItemSlotProps<T>
  'item-description'?: ItemSlotProps<T>
  'item-trailing'?: ItemSlotProps<T>
}

export interface PillSelectPayload<T extends PillItem> {
  item: T
  value: PillGroupValue | T
  selected: boolean
  index: number
}

export interface PillGroupEmits<
  T extends PillItem,
  VK extends GetItemKeys<T> | undefined,
  M extends boolean
> {
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'change': [value: GetModelValue<T, VK, M>]
  'update:modelValue': [value: GetModelValue<T, VK, M>]
  'select': [payload: PillSelectPayload<T>]
}
