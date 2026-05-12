<script lang="ts" setup generic="T extends InputValue">
import type { ButtonProps, InputProps, InputSlots, InputValue, ComponentConfig } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { computed, useAttrs } from 'vue'
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/with-clear'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import { useFormFieldBridge, useForwardedProps } from '../../utils/form-control'
import type { AppConfig } from 'nuxt/schema'
import type { WithClearEmits, WithClearProps } from '../../types/components/input/with-clear'

interface _Props extends WithClearProps<T> {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withCharacterLimit'>['slots']
}

const props = defineProps<_Props>()
const emits = defineEmits<WithClearEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { withClear?: unknown } }
const modelValue = defineModel<InputProps<T>['modelValue']>()
const inputProps = useForwardedProps(props, ['ui', 'buttonProps', 'defaultValue', 'modelModifiers'] as const)
const { size: fieldSize, emitFormChange, emitFormInput } = useFormFieldBridge(props)
const buttonSize = computed(() => fieldSize.value as ButtonProps['size'])

const { baseUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withClear,
  () => ({ ui: props.ui })
)

function handleClear() {
  modelValue.value = undefined
  emitFormInput()
  emitFormChange()
  emits('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :ui="baseUi"
    v-bind="{ ...inputProps, ...attrs }"
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
        :size="buttonSize"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="props.buttonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
