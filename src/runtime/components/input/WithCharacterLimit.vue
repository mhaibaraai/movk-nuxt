<script setup lang="ts" generic="T extends InputValue">
import { UInput } from '#components'
import { computed } from 'vue'
import type { OmitByKey } from '@movk/core'
import type { ClassNameValue } from 'tailwind-merge'
import type { InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'

interface WithCharacterLimitProps extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /**
   * 最大字符数
   * @defaultValue 50
   */
  maxLength?: number
  /**
   * 计数器的自定义类名
   */
  counterClass?: ClassNameValue
}
type WithCharacterLimitEmits = InputEmits<T>
type WithCharacterLimitSlots = OmitByKey<InputSlots, 'trailing'>

const { maxLength = 50, counterClass = '' } = defineProps<WithCharacterLimitProps>()
const emit = defineEmits<WithCharacterLimitEmits>()
const slots = defineSlots<WithCharacterLimitSlots>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<InputProps['modelValue']>()

const currentLength = computed(() => {
  return String(modelValue.value ?? '').length
})
</script>

<template>
  <UInput
    v-model="modelValue"
    :maxlength="maxLength"
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
        :class="[counterClass, 'text-xs text-muted tabular-nums']"
        aria-live="polite"
        role="status"
      >
        {{ currentLength }}/{{ maxLength }}
      </div>
    </template>
  </UInput>
</template>
