<script setup lang="ts">
import { UInput, UButton } from '#components'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots } from '@nuxt/ui'
import { useToggle } from '@vueuse/core'

interface WithPasswordToggleProps extends /** @vue-ignore */ OmitByKey<InputProps, 'type' | 'modelValue'> {
  buttonProps?: ButtonProps
}
type WithPasswordToggleEmits = InputEmits
type WithPasswordToggleSlots = OmitByKey<InputSlots, 'trailing'>

const { buttonProps } = defineProps<WithPasswordToggleProps>()
const emit = defineEmits<WithPasswordToggleEmits>()
const slots = defineSlots<WithPasswordToggleSlots>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<InputProps['modelValue']>()

const [value, toggle] = useToggle()
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
        v-bind="buttonProps"
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
