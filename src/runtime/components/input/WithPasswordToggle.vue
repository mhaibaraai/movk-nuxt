<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/with-password-toggle'
import inputTheme from '#build/ui/input'

type WithPasswordToggle = ComponentConfig<typeof inputTheme, AppConfig, 'withPasswordToggle'>

export interface WithPasswordToggleProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue' | 'ui'> {
  buttonProps?: ButtonProps
  ui?: WithPasswordToggle['slots']
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput, UButton } from '#components'
import { useToggle } from '@vueuse/core'
import { useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../../utils/extend-theme'

const props = defineProps<WithPasswordToggleProps<T>>()
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as WithPasswordToggle['AppConfig']
const modelValue = defineModel<T>()

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
    v-bind="attrs"
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
        :size="(attrs.size as ButtonProps['size'])"
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
