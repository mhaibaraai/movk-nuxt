<script setup lang="ts" generic="T extends InputValue">
import { UInput, UButton, UTooltip } from '#components'
import { useClipboard } from '@vueuse/core'
import { isEmpty } from '@movk/core'
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue, TooltipProps } from '@nuxt/ui'

interface WithCopyProps extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  buttonProps?: ButtonProps
  tooltipProps?: TooltipProps
}
type WithCopyEmits = InputEmits<T> & {
  copy: [value: string]
}
type WithCopySlots = OmitByKey<InputSlots, 'trailing'>

const { buttonProps, tooltipProps } = defineProps<WithCopyProps>()
const emit = defineEmits<WithCopyEmits>()
const slots = defineSlots<WithCopySlots>()

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
      <UTooltip text="Copy to clipboard" v-bind="tooltipProps">
        <UButton
          :color="copied ? 'success' : 'neutral'"
          variant="link"
          size="sm"
          :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          aria-label="Copy to clipboard"
          v-bind="buttonProps"
          @click="handleCopy"
        />
      </UTooltip>
    </template>
  </UInput>
</template>
