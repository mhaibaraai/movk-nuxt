<script setup lang="ts" generic="T extends InputValue">
import { computed, useAttrs } from 'vue'
import { UInput, UButton } from '#components'
import { isEmpty, type OmitByKey } from '@movk/core'
import type { ButtonProps, InputEmits, InputProps, InputSlots, InputValue } from '@nuxt/ui'
import type { ClassNameValue } from '../../types'

export interface WithFloatingLabelProps<T extends InputValue = InputValue> extends /** @vue-ignore */ OmitByKey<InputProps<T>, 'modelValue'> {
  /** 浮动标签文本 */
  label?: string
  /** 浮动标签的自定义样式类 */
  labelClass?: ClassNameValue
  /** 清除按钮的自定义属性 */
  clearButtonProps?: ButtonProps
}

type WithFloatingLabelEmits<T extends InputValue = InputValue> = InputEmits<T> & {
  clear: []
}

const props = defineProps<WithFloatingLabelProps<T>>()
const emits = defineEmits<WithFloatingLabelEmits<T>>()
const slots = defineSlots<OmitByKey<InputSlots, 'default' | 'trailing'>>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const modelValue = defineModel<T>()

const size = computed(() => (attrs.size as string) ?? 'md')

/**
 * leading 区域宽度对应的 left 偏移，与 Nuxt UI Input compoundVariants 保持一致
 */
const labelLeftClass = computed(() => {
  const hasLeading = !!(attrs['leading-icon'] || attrs.avatar || attrs.leadingIcon || attrs.icon || slots.leading)
  if (!hasLeading) return 'left-0'
  // ps-N（input 文字起始）减去 label 自身 px-1.5(6px) + span px-1(4px) = N-10px，取最近标准值
  const offsetMap: Record<string, string> = {
    xs: 'left-5',
    sm: 'left-6',
    md: 'left-7',
    lg: 'left-8',
    xl: 'left-9'
  }
  return offsetMap[size.value] ?? 'left-7'
})

/**
 * 各 size 对应的完整 label 状态类
 */
const labelSizeClass = computed(() => {
  const placeholderTextMap: Record<string, string> = {
    xs: 'peer-placeholder-shown:text-xs',
    sm: 'peer-placeholder-shown:text-xs',
    md: 'peer-placeholder-shown:text-sm',
    lg: 'peer-placeholder-shown:text-sm',
    xl: 'peer-placeholder-shown:text-base'
  }
  return [
    'peer-placeholder-shown:top-1/2',
    'peer-placeholder-shown:-translate-y-1/2',
    'peer-focus:translate-y-0',
    placeholderTextMap[size.value] ?? 'peer-placeholder-shown:text-sm'
  ]
})

function handleClear() {
  modelValue.value = undefined
  emits('clear')
}
</script>

<template>
  <UInput
    v-model="modelValue"
    :placeholder="props.placeholder ?? ''"
    :ui="{ base: 'peer', trailing: 'pe-1' }"
    v-bind="$attrs"
    @blur="emits('blur', $event)"
    @change="emits('change', $event)"
  >
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="props.label" #default>
      <label
        class="pointer-events-none absolute -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-dimmed peer-placeholder-shown:font-normal"
        :class="[labelLeftClass, labelSizeClass, props.labelClass]"
      >
        <span class="inline-flex bg-default px-1">{{ props.label }}</span>
      </label>
    </template>

    <template v-if="!isEmpty(modelValue)" #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="size"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        v-bind="props.clearButtonProps"
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
