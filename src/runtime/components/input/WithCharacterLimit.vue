<script lang="ts" setup generic="T extends InputValue">
import type { ComponentConfig, InputEmits, InputSlots, InputValue } from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import { computed, useAttrs } from 'vue'
import { UInput } from '#components'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/with-character-limit'
import inputTheme from '#build/ui/input'
import { useExtendedTv } from '../../utils/extend-theme'
import type { WithCharacterLimitProps } from '../../types/components/input/with-character-limit'
import type { AppConfig } from 'nuxt/schema'

interface Props extends WithCharacterLimitProps<T> {
  ui?: ComponentConfig<typeof inputTheme & typeof theme, AppConfig, 'withCharacterLimit'>['slots']
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 50
})
const emits = defineEmits<InputEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as { movk?: { withCharacterLimit?: unknown } }
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
