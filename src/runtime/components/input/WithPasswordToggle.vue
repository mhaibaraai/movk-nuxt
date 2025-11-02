<script setup lang="ts">
import { UInput, UButton } from '#components'
import { ref } from 'vue'
import type { OmitByKey } from '@movk/core'
import type { InputEmits, InputProps, InputSlots } from '@nuxt/ui'

interface WithPasswordToggleProps extends /** @vue-ignore */ OmitByKey<InputProps, 'type'> {}

type WithPasswordToggleEmits = InputEmits

type WithPasswordToggleSlots = Omit<InputSlots, 'trailing'>

defineProps<WithPasswordToggleProps>()
const emit = defineEmits<WithPasswordToggleEmits>()
const slots = defineSlots<WithPasswordToggleSlots>()

const modelValue = defineModel<InputProps['modelValue']>()

// 密码显示状态
const show = ref(false)
</script>

<template>
  <UInput
    v-model="modelValue"
    :type="show ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
    v-bind="$attrs"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template
      v-for="(_, slotName) in slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="(slotName as keyof WithPasswordToggleSlots)" v-bind="slotProps ?? {}" />
    </template>

    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Hide password' : 'Show password'"
        :aria-pressed="show"
        @click="show = !show"
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
