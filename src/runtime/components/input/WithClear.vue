<script lang="ts">
import type { OmitByKey } from '@movk/core'
import type { ButtonProps, ComponentConfig, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/with-clear'

type WithClear = ComponentConfig<typeof theme, AppConfig, 'withClear'>

export interface WithClearProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /** 清除按钮的自定义属性 */
  buttonProps?: ButtonProps
}

type WithClearEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}
</script>

<script lang="ts" setup generic="T extends InputValue">
import { UInput, UButton } from '#components'
import { isEmpty } from '@movk/core'
import { computed, useAttrs } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'

const props = defineProps<WithClearProps<T>>()
const emits = defineEmits<WithClearEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const appConfig = useAppConfig() as WithClear['AppConfig']
const modelValue = defineModel<InputProps<T>['modelValue']>()

const uiCls = computed(() => tv({ extend: tv(theme), ...(appConfig.movk?.withClear || {}) })())

function handleClear() {
  modelValue.value = undefined
  emits('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :ui="{ ...props.ui, trailing: uiCls.trailing({ class: props.ui?.trailing }) }"
    v-bind="$attrs"
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
