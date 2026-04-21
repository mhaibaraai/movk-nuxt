<script setup lang="ts" generic="T extends InputValue">
import { UInput } from '#components'
import { computed } from 'vue'
import type { InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from '../../types'

export interface WithCharacterLimitProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /**
   * 最大允许输入的字符数
   * @defaultValue 50
   */
  maxLength?: number
  /** 字符计数器的自定义样式类 */
  counterClass?: ClassNameValue
}

const props = withDefaults(defineProps<WithCharacterLimitProps<T>>(), {
  maxLength: 50
})
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<T>()

const currentLength = computed(() => {
  return String(modelValue.value ?? '').length
})
</script>

<template>
  <UInput
    v-model="modelValue"
    :maxlength="props.maxLength"
    aria-describedby="character-count"
    :ui="{ trailing: 'pointer-events-none' }"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template #trailing>
      <div
        id="character-count"
        :class="[props.counterClass, 'text-xs text-muted tabular-nums']"
        aria-live="polite"
        role="status"
      >
        {{ currentLength }}/{{ props.maxLength }}
      </div>
    </template>
  </UInput>
</template>
