<script setup lang="ts" generic="T extends InputValue">
import { UInput } from '#components'
import { computed } from 'vue'
import type { InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from 'tailwind-merge'

export interface WithCharacterLimitProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /**
   * Maximum number of characters allowed
   * @defaultValue 50
   */
  maxLength?: number
  /** Custom class for the character counter */
  counterClass?: ClassNameValue
}

const props = defineProps<WithCharacterLimitProps<T>>()
const emit = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<T>()

const maxLengthValue = 50
const currentLength = computed(() => {
  return String(modelValue.value ?? '').length
})
</script>

<template>
  <UInput
    v-model="modelValue"
    :maxlength="props.maxLength ?? maxLengthValue"
    aria-describedby="character-count"
    :ui="{ trailing: 'pointer-events-none' }"
    v-bind="$attrs"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
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
        {{ currentLength }}/{{ props.maxLength ?? maxLengthValue }}
      </div>
    </template>
  </UInput>
</template>
