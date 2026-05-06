<script lang="ts" setup generic="T extends InputValue">
import type { InputSlots, InputValue, ComponentConfig } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { useAttrs } from 'vue'
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/with-floating-label'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import type { AppConfig } from 'nuxt/schema'
import type { WithFloatingLabelEmits, WithFloatingLabelProps } from '../../types/components/input/with-floating-label'

interface Props extends WithFloatingLabelProps<T> {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withFloatingLabel'>['slots']
}

const props = defineProps<Props>()
const emits = defineEmits<WithFloatingLabelEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'default' | 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { withFloatingLabel?: unknown } }
const modelValue = defineModel<T>()

const { baseUi, extraUi } = useExtendedTv(
  inputTheme,
  theme,
  () => appConfig.movk?.withFloatingLabel,
  () => ({
    ui: props.ui,
    variants: {
      size: props.size,
      hasLeading: !!(attrs['leading-icon'] || attrs.avatar || attrs.leadingIcon || attrs.icon || slots.leading)
    }
  })
)

function handleClear() {
  modelValue.value = undefined
  emits('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :placeholder="props.placeholder ?? ''"
    :ui="baseUi"
    :size="props.size"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="props.label" #default>
      <label :class="extraUi.label">
        <span :class="extraUi.labelText">{{ props.label }}</span>
      </label>
    </template>

    <template v-if="!isEmpty(modelValue)" #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="props.size"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="props.clearButtonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
