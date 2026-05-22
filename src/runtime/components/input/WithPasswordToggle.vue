<script lang="ts" setup generic="T extends InputValue">
import type { ButtonProps, InputSlots, InputValue, ComponentConfig, InputEmits } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { useAttrs } from 'vue'
import { UInput, UButton } from '#components'
import { useToggle } from '@vueuse/core'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/with-password-toggle'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import { useFormFieldBridge, useForwardedProps } from '../../utils/form-control'
import type { AppConfig } from 'nuxt/schema'
import type { WithPasswordToggleProps } from '../../types/components/input/with-password-toggle'

interface _Props extends WithPasswordToggleProps<T> {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withPasswordToggle'>['slots']
}

const props = defineProps<_Props>()
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { withPasswordToggle?: unknown } }
const modelValue = defineModel<T>()
const inputProps = useForwardedProps(props, ['ui', 'buttonProps', 'defaultValue', 'modelModifiers'] as const)
const { size: buttonSize } = useFormFieldBridge<ButtonProps['size']>(props)

const { baseUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withPasswordToggle,
  () => ({ ui: props.ui })
)

const [value, toggle] = useToggle(false)
</script>

<template>
  <UInput
    v-model="modelValue"
    :type="value ? 'text' : 'password'"
    :ui="baseUi"
    v-bind="{ ...inputProps, ...attrs }"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="buttonSize"
        :icon="value ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="value ? 'Hide password' : 'Show password'"
        :aria-pressed="value"
        v-bind="props.buttonProps"
        @click="toggle()"
      />
    </template>
  </UInput>
</template>

<style>
/* Hide the password reveal button in Edge */
::-ms-reveal {
  display: none;
}
</style>
