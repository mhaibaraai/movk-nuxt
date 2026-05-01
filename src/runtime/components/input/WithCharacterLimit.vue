<script lang="ts">
import type { ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/with-character-limit'
import inputTheme from '#build/ui/input'

type WithCharacterLimit = ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withCharacterLimit'>

export interface WithCharacterLimitProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'ui'> {
  /**
   * 最大允许输入的字符数
   * @defaultValue 50
   */
  maxLength?: number
  ui?: WithCharacterLimit['slots']
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput } from '#components'
import { computed, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../../utils/extend-theme'

const props = withDefaults(defineProps<WithCharacterLimitProps<T>>(), {
  maxLength: 50
})
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as WithCharacterLimit['AppConfig']
const modelValue = defineModel<T>()

const { baseUi, extraUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withCharacterLimit,
  () => ({ ui: props.ui })
)
const currentLength = computed(() => String(modelValue.value ?? '').length)
</script>

<template>
  <UInput
    v-model="modelValue"
    :maxlength="props.maxLength"
    aria-describedby="character-count"
    :ui="baseUi"
    v-bind="attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template #trailing>
      <div
        id="character-count"
        :class="extraUi.counter"
        aria-live="polite"
        role="status"
      >
        {{ currentLength }}/{{ props.maxLength }}
      </div>
    </template>
  </UInput>
</template>
