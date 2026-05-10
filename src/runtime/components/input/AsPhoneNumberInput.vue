<script lang="ts" setup generic="T extends InputValue">
import type { ComponentConfig, InputEmits, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { UInput } from '#components'
import { vMaska } from 'maska/vue'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/as-phone-number-input'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import type { AsPhoneNumberInputProps } from '../../types/components/input/as-phone-number-input'
import type { AppConfig } from 'nuxt/schema'

const props = withDefaults(defineProps<AsPhoneNumberInputProps<T> & {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'asPhoneNumberInput'>['slots']
}>(), {
  mask: '(###) ###-####',
  dialCode: '+86'
})
const modelValue = defineModel<T>()
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'leading'>>()

defineOptions({ inheritAttrs: false })

const appConfig = useAppConfig() as { movk?: { asPhoneNumberInput?: unknown } }

const { baseUi, extraUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.asPhoneNumberInput,
  () => ({ ui: props.ui, variants: { dialCode: !!props.dialCode } })
)
</script>

<template>
  <UInput
    v-model="modelValue"
    v-maska="props.mask"
    type="tel"
    :placeholder="props.placeholder ?? props.mask.replaceAll('#', '_')"
    :style="props.dialCode ? { '--dial-code-length': `${props.dialCode.length + 1.5}ch` } : undefined"
    :ui="baseUi"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="props.dialCode" #leading>
      <span :class="extraUi.dialCode">{{ props.dialCode }}</span>
    </template>
  </UInput>
</template>
