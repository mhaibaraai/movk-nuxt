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

type PillGroupSlotKey
  = | 'root' | 'list' | 'item' | 'itemWrapper' | 'itemLabel' | 'itemDescription'
    | 'leading' | 'leadingIcon' | 'trailing' | 'trailingIcon'

export type PillGroupSlotMap = Partial<Record<PillGroupSlotKey, ClassNameValue>>

type PillItemUI = Pick<
  PillGroupSlotMap,
  'item' | 'itemWrapper' | 'itemLabel' | 'itemDescription' | 'leading' | 'trailing'
>

export interface PillItemObject {
  value?: PillGroupValue
  label?: string
  description?: string
  disabled?: boolean
  icon?: string
  avatar?: AvatarProps
  /** 单项可覆盖 group 的视觉变体。 */
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  /** 点击单项时的副作用钩子，在 modelValue 更新前触发。 */
  onSelect?: (e: Event) => void
  class?: ClassNameValue
  ui?: PillItemUI
  [key: string]: any
}

export type PillItem = PillGroupValue | PillItemObject

export interface PillGroupProps<
  T extends PillItem = PillItem,
  VK extends GetItemKeys<T> = 'value',
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
  /** 单选：再次点击当前选中项清空 */
  deselectable?: M extends true ? never : boolean
  /** 多选：最多可选数量 */
  max?: M extends true ? number : never
  /** 多选：最少需保留数量 */
  min?: M extends true ? number : never
  defaultValue?: GetModelValue<T, VK, M>
  modelValue?: GetModelValue<T, VK, M>
  class?: ClassNameValue
  ui?: PillGroupSlotMap
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
  /** root 内列表前，常用于标题/前缀图标。 */
  'leading'?: GroupSlotProps<T, VK, M>
  /** 完全替换列表区域；slot 内部自行 v-for 渲染 items。 */
  'default'?: GroupSlotProps<T, VK, M>
  /** root 内列表后，常用于操作按钮/统计。 */
  'trailing'?: GroupSlotProps<T, VK, M>
  /** 单项完全替换：拿到 item / index / selected，自行渲染按钮容器。 */
  'item'?: ItemSlotProps<T>
  /** 单项内左侧：替换 icon/avatar 默认渲染。 */
  'item-leading'?: ItemSlotProps<T>
  'item-label'?: ItemSlotProps<T>
  'item-description'?: ItemSlotProps<T>
  /** 单项内右侧：默认不渲染任何内容，仅在 slot 提供时显示。 */
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
