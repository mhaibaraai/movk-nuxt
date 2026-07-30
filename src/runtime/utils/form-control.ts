import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'
import {
  formBusInjectionKey,
  formFieldInjectionKey,
  useFormField
} from '@nuxt/ui/composables/useFormField'
import { fieldGroupInjectionKey, useFieldGroup } from '@nuxt/ui/composables/useFieldGroup'

type FormEventType = 'input' | 'blur' | 'change' | 'focus'

// 剔除指定键并过滤掉值为 undefined 的字段，避免 v-bind 时覆盖下层默认值。
export function omitProps<
  T extends object,
  K extends keyof T
>(props: T, keys: readonly K[]): Omit<T, K> {
  const omitted = new Set<PropertyKey>(keys)
  return Object.fromEntries(
    Object
      .entries(props as Record<string, unknown>)
      .filter(([key, value]) => !omitted.has(key) && value !== undefined)
  ) as Omit<T, K>
}

export function useForwardedProps<
  T extends object,
  K extends keyof T
>(props: T, keys: readonly K[]) {
  return computed(() => omitProps(props, keys))
}

type SizeProps = {
  size?: unknown
}

// 装饰型包装的桥接器：内层 UInput 自行注入 UFormField/UFieldGroup，
// 这里只解析 size 给装饰按钮使用，并在外层主动改 modelValue 时触发表单事件。
export function useFormFieldBridge<S = unknown, T extends SizeProps = SizeProps>(props?: T) {
  const formBus = inject(formBusInjectionKey, undefined)
  const formField = inject(formFieldInjectionKey, undefined)
  const fieldGroup = inject(fieldGroupInjectionKey, undefined)

  function emitFormEvent(type: FormEventType) {
    const field = formField?.value
    if (!formBus || !field?.name) return

    formBus.emit({
      type,
      name: field.name,
      ...(type === 'input' ? { eager: field.eagerValidation } : {})
    })
  }

  return {
    size: computed<S | undefined>(() =>
      (props?.size ?? fieldGroup?.value.size ?? formField?.value.size) as S | undefined
    ),
    emitFormInput: () => emitFormEvent('input'),
    emitFormBlur: () => emitFormEvent('blur'),
    emitFormChange: () => emitFormEvent('change'),
    emitFormFocus: () => emitFormEvent('focus')
  }
}

type FieldControlProps = {
  size?: unknown
  color?: unknown
  disabled?: boolean
}

type FieldSize<T extends FieldControlProps> = NonNullable<T['size']> | undefined
type FieldColor<T extends FieldControlProps> = NonNullable<T['color']> | 'error' | undefined

// 显式标注返回类型：直接展开 useFormField 会让推断结果引用 @vueuse/shared 的
// UseDebounceFnReturn，声明发射期报 TS2883（不可移植）。
type FieldControl<T extends FieldControlProps>
  = Omit<ReturnType<typeof useFormField<T>>, 'size' | 'color' | 'disabled'> & {
    size: ComputedRef<FieldSize<T>>
    disabled: ComputedRef<boolean>
    color: ComputedRef<FieldColor<T>>
    fieldGroupSize: ReturnType<typeof useFieldGroup<T>>['size']
    fieldGroupOrientation: ReturnType<typeof useFieldGroup<T>>['orientation']
  }

// 字段控件型组件统一入口：聚合 useFormField + useFieldGroup，
// 解决 size/disabled/color 三个继承计算的重复样板。
export function useFieldControl<T extends FieldControlProps>(props: T): FieldControl<T> {
  // as never：Nuxt UI 的 useFormField/useFieldGroup 要求 props 满足其内部 Props 形状，这里用泛型 T 转发实际 props，必须绕过类型校验
  const formField = useFormField<T>(props as never)
  const fieldGroup = useFieldGroup<T>(props as never)

  const size = computed<FieldSize<T>>(() => (fieldGroup.size.value || formField.size.value) as FieldSize<T>)
  const disabled = computed(() => formField.disabled.value ?? props.disabled ?? false)
  const color = computed<FieldColor<T>>(() => (formField.color.value ?? props.color) as FieldColor<T>)

  return {
    ...formField,
    size,
    disabled,
    color,
    fieldGroupSize: fieldGroup.size,
    fieldGroupOrientation: fieldGroup.orientation
  }
}
