<script lang="ts" setup generic="T extends InputValue">
import type { ButtonProps, ComponentConfig, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { useAttrs } from 'vue'
import { UInput, UButton, UTooltip } from '#components'
import { useClipboard } from '@vueuse/core'
import { isEmpty } from '@movk/core'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/with-copy'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import type { WithCopyEmits, WithCopyProps } from '../../types/components/input/with-copy'
import type { AppConfig } from 'nuxt/schema'

interface Props extends WithCopyProps<T> {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withCopy'>['slots']
}

const props = defineProps<Props>()
const emits = defineEmits<WithCopyEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { withCopy?: unknown } }
const modelValue = defineModel<T>()

const { baseUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withCopy,
  () => ({ ui: props.ui })
)
const { copy, copied } = useClipboard()

function handleCopy() {
  if (modelValue.value) {
    const stringValue = String(modelValue.value)
    copy(stringValue)
    emits('copy', stringValue)
  }
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :ui="baseUi"
    v-bind="attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="!isEmpty(modelValue)" #trailing>
      <UTooltip text="Copy to clipboard" v-bind="props.tooltipProps">
        <UButton
          :color="copied ? 'success' : 'neutral'"
          variant="link"
          :size="(attrs.size as ButtonProps['size'])"
          :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          aria-label="Copy to clipboard"
          v-bind="props.buttonProps"
          @click="handleCopy"
        />
      </UTooltip>
    </template>
  </UInput>
</template>
