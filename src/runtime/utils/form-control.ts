import { computed, inject } from 'vue'
import {
  formBusInjectionKey,
  formFieldInjectionKey
} from '@nuxt/ui/composables/useFormField'
import { fieldGroupInjectionKey } from '@nuxt/ui/composables/useFieldGroup'

type FormEventType = 'input' | 'blur' | 'change' | 'focus'
type SizeProps = {
  size?: unknown
}
type PropSize<T> = T extends { size?: infer S } ? S : unknown

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

export function useFormFieldBridge<T extends SizeProps>(props?: T) {
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
    size: computed<PropSize<T> | undefined>(() =>
      (props?.size ?? fieldGroup?.value.size ?? formField?.value.size) as PropSize<T> | undefined
    ),
    emitFormInput: () => emitFormEvent('input'),
    emitFormBlur: () => emitFormEvent('blur'),
    emitFormChange: () => emitFormEvent('change'),
    emitFormFocus: () => emitFormEvent('focus')
  }
}
