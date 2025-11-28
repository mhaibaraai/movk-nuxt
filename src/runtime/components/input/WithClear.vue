<script setup lang="ts" generic="T extends InputValue">
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'

interface WithClearProps extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /**
   * 清除按钮属性
   */
  buttonProps?: ButtonProps
}
type WithClearEmits = InputEmits<T> & {
  clear: []
}
type WithClearSlots = OmitByKey<InputSlots, 'trailing'>

const { buttonProps } = defineProps<WithClearProps>()
const emit = defineEmits<WithClearEmits>()
const slots = defineSlots<WithClearSlots>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<InputProps<T>['modelValue']>()

function handleClear() {
  modelValue.value = undefined
  emit('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :ui="{ trailing: 'pe-1' }"
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
