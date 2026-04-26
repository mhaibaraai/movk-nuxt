<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, ComponentConfig, InputEmits, InputProps, InputSlots, InputValue, TooltipProps } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/with-copy'

type WithCopy = ComponentConfig<typeof theme, AppConfig, 'withCopy'>

export interface WithCopyProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /** 复制按钮的自定义属性 */
  buttonProps?: ButtonProps
  /** 提示框的自定义属性 */
  tooltipProps?: TooltipProps
}

type WithCopyEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  copy: [value: string]
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput, UButton, UTooltip } from '#components'
import { useClipboard } from '@vueuse/core'
import { isEmpty } from '@movk/core'
import { computed, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'

const props = defineProps<WithCopyProps<T>>()
const emits = defineEmits<WithCopyEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as WithCopy['AppConfig']
const modelValue = defineModel<T>()

const uiCls = computed(() => tv({ extend: tv(theme), ...(appConfig.movk?.withCopy || {}) })())
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
    :ui="{ ...props.ui, trailing: uiCls.trailing({ class: props.ui?.trailing }) }"
    v-bind="$attrs"
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
