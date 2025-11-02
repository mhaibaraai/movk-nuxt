<script setup lang="ts">
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots } from '@nuxt/ui'

interface WithClearProps extends /** @vue-ignore */ OmitByKey<InputProps, 'modelValue'> {
  buttonProps?: ButtonProps
}
type WithClearEmits = InputEmits & {
  clear: []
}
type WithClearSlots = Omit<InputSlots, 'trailing'>

const { buttonProps } = defineProps<WithClearProps>()

const emit = defineEmits<WithClearEmits>()
const slots = defineSlots<WithClearSlots>()

const modelValue = defineModel<InputProps['modelValue']>()

function handleClear() {
  modelValue.value = ''
  emit('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    v-bind="$attrs"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="!isEmpty(modelValue)" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="buttonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
