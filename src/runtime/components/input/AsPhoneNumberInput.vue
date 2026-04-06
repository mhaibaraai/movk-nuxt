<script setup lang="ts" generic="T extends InputValue">
import { UInput } from '#components'
import { vMaska } from 'maska/vue'
import type { OmitByKey } from '@movk/core'
import type { InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { ClassNameValue } from '../../types'

export interface AsPhoneNumberInputProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue'> {
  /**
   * 输入掩码格式，`#` 表示一个数字位。
   * @defaultValue '(###) ###-####'
   */
  mask?: string
  /** 区号前缀，例如 `+86`。 */
  dialCode?: string
  /** 区号前缀的自定义样式类。 */
  dialCodeClass?: ClassNameValue
}

const props = withDefaults(defineProps<AsPhoneNumberInputProps<T>>(), {
  mask: '(###) ###-####'
})
const emit = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'leading'>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<T>()
</script>

<template>
  <UInput
    v-model="modelValue"
    v-maska="props.mask"
    type="tel"
    :placeholder="props.placeholder ?? props.mask.replaceAll('#', '_')"
    :style="props.dialCode ? { '--dial-code-length': `${props.dialCode.length + 1.5}ch` } : undefined"
    :ui="props.dialCode
      ? { base: 'ps-(--dial-code-length)', leading: 'pointer-events-none text-muted' }
      : {}"
    v-bind="$attrs"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="props.dialCode" #leading>
      <span :class="props.dialCodeClass">{{ props.dialCode }}</span>
    </template>
  </UInput>
</template>
