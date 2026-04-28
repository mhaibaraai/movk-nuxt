<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import theme from '#build/movk-ui/as-phone-number-input'
import inputTheme from '#build/ui/input'
import type { AppConfig } from 'nuxt/schema'

type FullTheme = typeof inputTheme & {
  variants: typeof inputTheme['variants'] & {
    dialCode: { true: { base: string, leading: string } }
  }
}
type AsPhoneNumberInput = ComponentConfig<FullTheme, AppConfig, 'asPhoneNumberInput'>

export interface AsPhoneNumberInputProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue' | 'ui'> {
  /**
   * 输入掩码格式，`#` 表示一个数字位。
   * @defaultValue '(###) ###-####'
   */
  mask?: string
  /**
   * 区号前缀
   * @example '+86'、'+1'
   */
  dialCode?: string
  ui?: AsPhoneNumberInput['slots']
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput } from '#components'
import { vMaska } from 'maska/vue'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../../utils/extend-theme'

const props = withDefaults(defineProps<AsPhoneNumberInputProps<T>>(), {
  mask: '(###) ###-####'
})
const modelValue = defineModel<T>()
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'leading'>>()

defineOptions({ inheritAttrs: false })

const appConfig = useAppConfig() as AsPhoneNumberInput['AppConfig']

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
