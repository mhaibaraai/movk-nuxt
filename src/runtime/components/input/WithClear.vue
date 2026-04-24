<script setup lang="ts" generic="T extends InputValue">
import { UInput, UButton } from '#components'
import { isEmpty, type OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import { useAttrs } from 'vue'

export interface WithClearProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /** 清除按钮的自定义属性 */
  buttonProps?: ButtonProps
}

type WithClearEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}

const props = defineProps<WithClearProps<T>>()
const emits = defineEmits<WithClearEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const modelValue = defineModel<InputProps<T>['modelValue']>()

function handleClear() {
  modelValue.value = undefined
  emits('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :ui="{ trailing: 'pe-1' }"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="!isEmpty(modelValue)" #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="(attrs.size as ButtonProps['size'])"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="props.buttonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
