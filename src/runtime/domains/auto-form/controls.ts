import type { IsComponent } from '@movk/core'
import type { AutoFormControl, _Unset } from '../../types/auto-form/controls'
import type {
  CheckboxGroupProps, CheckboxGroupSlots,
  CheckboxProps, CheckboxSlots,
  FileUploadProps, FileUploadSlots,
  InputDateProps, InputDateSlots,
  InputMenuProps, InputMenuSlots,
  InputNumberProps, InputNumberSlots,
  InputProps, InputSlots,
  InputTagsProps, InputTagsSlots,
  InputTimeProps, InputTimeSlots,
  ListboxProps, ListboxSlots,
  PinInputProps, PinInputSlots,
  RadioGroupProps, RadioGroupSlots,
  SelectMenuProps, SelectMenuSlots,
  SelectProps, SelectSlots,
  SliderProps,
  SwitchProps, SwitchSlots,
  TextareaProps, TextareaSlots
} from '@nuxt/ui'
import type { CalendarDateControlProps } from '../../types/components/date-picker'
import WithClear from '../../components/input/WithClear.vue'
import WithPasswordToggle from '../../components/input/WithPasswordToggle.vue'
import WithCopy from '../../components/input/WithCopy.vue'
import WithCharacterLimit from '../../components/input/WithCharacterLimit.vue'
import AsPhoneNumberInput from '../../components/input/AsPhoneNumberInput.vue'
import WithFloatingLabel from '../../components/input/WithFloatingLabel.vue'
import DatePicker from '../../components/DatePicker.vue'
import ColorChooser from '../../components/ColorChooser.vue'
import SlideVerify from '../../components/SlideVerify.vue'
import PillGroup from '../../components/PillGroup.vue'
import {
  UInput,
  UInputNumber,
  UCheckbox,
  USwitch,
  UTextarea,
  USlider,
  UPinInput,
  UInputTags,
  UFileUpload,
  USelect,
  USelectMenu,
  UInputMenu,
  UCheckboxGroup,
  URadioGroup,
  UInputDate,
  UInputTime,
  UListbox
} from '#components'

const DEFAULT_CONTROL_PROPS = { class: 'w-full' } as const

export function defineControl<C extends IsComponent, P = _Unset, S = _Unset>(
  e: AutoFormControl<C, P, S>
): AutoFormControl<C, P, S> {
  return e
}

function createControlMap<const T extends Record<string, IsComponent>>(
  components: T,
  defaultProps: Record<string, unknown> = DEFAULT_CONTROL_PROPS
): { readonly [K in keyof T]: AutoFormControl<T[K]> } {
  return Object.fromEntries(
    Object.entries(components).map(([key, component]) => [
      key,
      { component, controlProps: defaultProps }
    ])
  ) as any
}

const DEFAULT_CONTROL_COMPONENTS = {
  string: UInput,
  number: UInputNumber,
  boolean: UCheckbox,
  enum: USelect,
  file: UFileUpload,
  // reka-ui 未公开导出 Calendar 相关类型，收宽避免声明发射 TS2883（详见 AGENTS.md）
  calendarDate: DatePicker as IsComponent,
  inputDate: UInputDate,
  inputTime: UInputTime,

  withClear: WithClear,
  withPasswordToggle: WithPasswordToggle,
  withCopy: WithCopy,
  withCharacterLimit: WithCharacterLimit,
  withFloatingLabel: WithFloatingLabel,
  asPhoneNumberInput: AsPhoneNumberInput,

  textarea: UTextarea,
  switch: USwitch,
  slider: USlider,

  selectMenu: USelectMenu,
  inputMenu: UInputMenu,
  checkboxGroup: UCheckboxGroup,
  radioGroup: URadioGroup,
  inputTags: UInputTags,
  pinInput: UPinInput,
  listbox: UListbox,

  colorChooser: ColorChooser,
  slideVerify: SlideVerify,
  pillGroup: PillGroup
} as const

type DefaultControlComponents = typeof DEFAULT_CONTROL_COMPONENTS

/** 本地 .vue 控件：组件类型在声明发射期可解析，controlProps 由组件推导 */
type LocalControlKey
  = 'calendarDate'
    | 'withClear' | 'withPasswordToggle' | 'withCopy'
    | 'withCharacterLimit' | 'withFloatingLabel' | 'asPhoneNumberInput'
    | 'colorChooser' | 'slideVerify' | 'pillGroup'

/**
 * Nuxt UI 控件的 `[props, slots]` 类型登记表。
 *
 * `#components` 在模块声明发射期无法解析，`U*` 组件类型会退化为 `any`，
 * 使 `controlProps` / `controlSlots` 在消费端失去类型提示；此处显式登记以绕开组件推导。
 */
interface NuxtUIControlTypes {
  string: [InputProps, InputSlots]
  number: [InputNumberProps, InputNumberSlots]
  boolean: [CheckboxProps, CheckboxSlots]
  enum: [SelectProps, SelectSlots]
  file: [FileUploadProps, FileUploadSlots]
  inputDate: [InputDateProps, InputDateSlots]
  inputTime: [InputTimeProps, InputTimeSlots]
  textarea: [TextareaProps, TextareaSlots]
  switch: [SwitchProps, SwitchSlots]
  slider: [SliderProps, _Unset]
  selectMenu: [SelectMenuProps, SelectMenuSlots]
  inputMenu: [InputMenuProps, InputMenuSlots]
  checkboxGroup: [CheckboxGroupProps, CheckboxGroupSlots]
  radioGroup: [RadioGroupProps, RadioGroupSlots]
  inputTags: [InputTagsProps, InputTagsSlots]
  pinInput: [PinInputProps, PinInputSlots]
  listbox: [ListboxProps, ListboxSlots]
}

/** 约束为 never；有未归类控件时此处直接报错 */
type _AssertNever<T extends never> = T

// 新增控件必须二选一归类：Nuxt UI 控件登记进 NuxtUIControlTypes，本地 .vue 控件登记进 LocalControlKey
type _AssertControlsClassified = _AssertNever<
  Exclude<keyof DefaultControlComponents, keyof NuxtUIControlTypes | LocalControlKey>
>

type DefaultControlMap = {
  readonly [K in keyof DefaultControlComponents]:
  K extends keyof NuxtUIControlTypes
    ? AutoFormControl<DefaultControlComponents[K], NuxtUIControlTypes[K][0], NuxtUIControlTypes[K][1]>
    : K extends 'calendarDate'
      ? AutoFormControl<DefaultControlComponents[K], CalendarDateControlProps>
      : AutoFormControl<DefaultControlComponents[K]>
}

export const DEFAULT_CONTROLS: DefaultControlMap
  = createControlMap(DEFAULT_CONTROL_COMPONENTS) as DefaultControlMap
