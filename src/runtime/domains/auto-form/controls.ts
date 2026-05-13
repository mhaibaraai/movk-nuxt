import type { IsComponent } from '@movk/core'
import type { AutoFormControl, _Unset } from '../../types/auto-form/controls'
import type {
  InputProps, InputSlots,
  TextareaProps, TextareaSlots
} from '@nuxt/ui'
import WithClear from '../../components/input/WithClear.vue'
import WithPasswordToggle from '../../components/input/WithPasswordToggle.vue'
import WithCopy from '../../components/input/WithCopy.vue'
import WithCharacterLimit from '../../components/input/WithCharacterLimit.vue'
import AsPhoneNumberInput from '../../components/input/AsPhoneNumberInput.vue'
import WithFloatingLabel from '../../components/input/WithFloatingLabel.vue'
import DatePicker from '../../components/DatePicker.vue'
import ColorChooser from '../../components/ColorChooser.vue'
import StarRating from '../../components/StarRating.vue'
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
  calendarDate: DatePicker,
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

  starRating: StarRating,
  colorChooser: ColorChooser,
  slideVerify: SlideVerify,
  pillGroup: PillGroup
} as const

type DefaultControlComponents = typeof DEFAULT_CONTROL_COMPONENTS

type DefaultControlMap = {
  readonly [K in keyof DefaultControlComponents]:
  K extends 'string'
    ? AutoFormControl<typeof UInput, InputProps, InputSlots>
    : K extends 'textarea'
      ? AutoFormControl<typeof UTextarea, TextareaProps, TextareaSlots>
      : AutoFormControl<DefaultControlComponents[K]>
}

export const DEFAULT_CONTROLS: DefaultControlMap
  = createControlMap(DEFAULT_CONTROL_COMPONENTS) as DefaultControlMap
