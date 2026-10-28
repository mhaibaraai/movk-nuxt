import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useFormField } from '@nuxt/ui/composables/useFormField'
import { useFieldGroup } from '@nuxt/ui/composables/useFieldGroup'

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
