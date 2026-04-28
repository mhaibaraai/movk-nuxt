<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/with-clear'
import inputTheme from '#build/ui/input'

type WithClear = ComponentConfig<typeof inputTheme, AppConfig, 'withClear'>

export interface WithClearProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue' | 'ui'> {
  buttonProps?: ButtonProps
  ui?: WithClear['slots']
}

type WithClearEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import { useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { useExtendedTv } from '../../utils/extend-theme'

const props = defineProps<WithClearProps<T>>()
const emits = defineEmits<WithClearEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as WithClear['AppConfig']
const modelValue = defineModel<InputProps<T>['modelValue']>()

const { baseUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withClear,
  () => ({ ui: props.ui })
)

function handleClear() {
  modelValue.value = undefined
  emits('clear')
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
      <UButton
        color="neutral"
        variant="link"
        :size="(attrs.size as ButtonProps['size'])"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="props.buttonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
