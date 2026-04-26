<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { ClassNameValue } from '../../types'
import theme from '#build/movk-ui/as-phone-number-input'
import type { AppConfig } from 'nuxt/schema'

type AsPhoneNumberInput = ComponentConfig<typeof theme, AppConfig, 'asPhoneNumberInput'>

export interface AsPhoneNumberInputProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'type' | 'modelValue'> {
  /**
   * 输入掩码格式，`#` 表示一个数字位。
   * @defaultValue '(###) ###-####'
   */
  mask?: string
  /** 区号前缀，例如 `+86`。 */
  dialCode?: string
  /** 区号前缀的自定义样式类。 */
  dialCodeClass?: ClassNameValue
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput } from '#components'
import { vMaska } from 'maska/vue'
import { computed } from 'vue'
import { tv } from '../../utils/tv'
import { useAppConfig } from '#imports'

const props = withDefaults(defineProps<AsPhoneNumberInputProps<T>>(), {
  mask: '(###) ###-####'
})
const modelValue = defineModel<T>()
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'leading'>>()

defineOptions({ inheritAttrs: false })

const appConfig = useAppConfig() as AsPhoneNumberInput['AppConfig']

const uiCls = computed(() =>
  tv({ extend: tv(theme), ...((appConfig.movk?.asPhoneNumberInput || {}) as typeof theme) })({
    dialCode: !!props.dialCode
  })
)
</script>

<template>
  <UInput
    v-model="modelValue"
    v-maska="props.mask"
    type="tel"
    :placeholder="props.placeholder ?? props.mask.replaceAll('#', '_')"
    :style="props.dialCode ? { '--dial-code-length': `${props.dialCode.length + 1.5}ch` } : undefined"
    :ui="{
      ...props.ui,
      base: uiCls.base({ class: props.ui?.base }),
      leading: uiCls.leading({ class: props.ui?.leading })
    }"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="props.dialCode" #leading>
      <span :class="props.dialCodeClass">{{ props.dialCode }}</span>
    </template>
  </UInput>
</template>
