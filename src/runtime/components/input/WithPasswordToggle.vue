<script setup lang="ts" generic="T extends InputValue">
import { UInput, UButton } from '#components'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import { useToggle } from '@vueuse/core'

export interface WithPasswordToggleProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue'> {
  /** Custom props for the toggle button */
  buttonProps?: ButtonProps
}

const props = defineProps<WithPasswordToggleProps<T>>()
const emit = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<InputProps['modelValue']>()

const [value, toggle] = useToggle(false)
</script>

<template>
  <UInput
    v-model="modelValue"
    :type="value ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
    v-bind="$attrs"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="value ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="value ? 'Hide password' : 'Show password'"
        :aria-pressed="value"
        v-bind="props.buttonProps"
        @click="toggle()"
      />
    </template>
  </UInput>
</template>

<style>
/* Hide the password reveal button in Edge */
::-ms-reveal {
  display: none;
}
</style>
