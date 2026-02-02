<script setup lang="ts" generic="T extends InputValue">
import { UInput, UButton, UTooltip } from '#components'
import { useClipboard } from '@vueuse/core'
import { isEmpty, type OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue, TooltipProps } from '@nuxt/ui'

export interface WithCopyProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /** Custom props for the copy button */
  buttonProps?: ButtonProps
  /** Custom props for the tooltip */
  tooltipProps?: TooltipProps
}

export type WithCopyEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  copy: [value: string]
}

const props = defineProps<WithCopyProps<T>>()
const emit = defineEmits<WithCopyEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<InputProps['modelValue']>()

const { copy, copied } = useClipboard()

function handleCopy() {
  if (modelValue.value) {
    const stringValue = String(modelValue.value)
    copy(stringValue)
    emit('copy', stringValue)
  }
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
      <UTooltip text="Copy to clipboard" v-bind="props.tooltipProps">
        <UButton
          :color="copied ? 'success' : 'neutral'"
          variant="link"
          size="sm"
          :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          aria-label="Copy to clipboard"
          v-bind="props.buttonProps"
          @click="handleCopy"
        />
      </UTooltip>
    </template>
  </UInput>
</template>
