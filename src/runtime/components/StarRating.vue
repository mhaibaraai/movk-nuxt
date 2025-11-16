<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { UButton, UBadge } from '#components'
import { computed, ref } from 'vue'

export interface StarRatingProps {
  /** 当前评分值 */
  modelValue?: number
  /** 最大星级数 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示评分徽章 */
  showBadge?: boolean
  /** 自定义星星按钮属性 */
  buttonProps?: Partial<ButtonProps>
  /** 未选中星星的图标 */
  emptyIcon?: string
  /** 选中星星的图标 */
  filledIcon?: string
  /** 半星图标 */
  halfIcon?: string
  /** 选中星星的颜色 */
  color?: ButtonProps['color']
  /** 星星大小 */
  size?: ButtonProps['size']
  /** 是否允许半星 */
  allowHalf?: boolean
  /** 是否允许清除评分 */
  clearable?: boolean
}

export interface StarRatingEmits {
  'update:modelValue': [value: number]
  /** 评分改变事件 */
  'change': [value: number]
  /** 悬停事件 */
  'hover': [value: number | null]
}

const {
  modelValue = 0,
  max = 5,
  disabled = false,
  readonly = false,
  showBadge = true,
  buttonProps,
  emptyIcon = 'i-lucide-star',
  filledIcon = 'i-lucide-star',
  halfIcon = 'i-lucide-star-half',
  color = 'warning',
  size = 'sm',
  allowHalf = false,
  clearable = false
} = defineProps<StarRatingProps>()

const emit = defineEmits<StarRatingEmits>()

const hoveredStar = ref<number | null>(null)

const isInteractive = computed(() => !disabled && !readonly)

function handleClick(index: number, event?: MouseEvent) {
  if (!isInteractive.value) return

  let newValue = index + 1

  // 如果允许半星，检测点击位置
  if (allowHalf && event) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const halfWidth = rect.width / 2

    // 点击左半部分为半星
    if (clickX < halfWidth) {
      newValue = index + 0.5
    }
  }

  // 如果允许清除且点击的是当前值，则清除评分
  if (clearable && newValue === modelValue) {
    emit('update:modelValue', 0)
    emit('change', 0)
    return
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function handleMouseEnter(index: number, event?: MouseEvent) {
  if (!isInteractive.value) return

  let hoverValue = index + 1

  // 如果允许半星，检测悬停位置
  if (allowHalf && event) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const halfWidth = rect.width / 2

    if (mouseX < halfWidth) {
      hoverValue = index + 0.5
    }
  }

  hoveredStar.value = hoverValue - 1
  emit('hover', hoverValue)
}

function handleMouseMove(index: number, event: MouseEvent) {
  if (!isInteractive.value || !allowHalf) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const halfWidth = rect.width / 2

  const hoverValue = mouseX < halfWidth ? index + 0.5 : index + 1
  const currentHover = hoveredStar.value !== null ? hoveredStar.value + 1 : null

  if (currentHover !== hoverValue) {
    hoveredStar.value = hoverValue - 1
    emit('hover', hoverValue)
  }
}

function handleMouseLeave() {
  if (!isInteractive.value) return
  hoveredStar.value = null
  emit('hover', null)
}

function getStarState(index: number): 'empty' | 'half' | 'full' {
  const displayValue = hoveredStar.value !== null ? hoveredStar.value + 1 : modelValue

  if (index < Math.floor(displayValue)) {
    return 'full'
  }

  if (allowHalf && index === Math.floor(displayValue) && displayValue % 1 !== 0) {
    return 'half'
  }

  return 'empty'
}

function getStarIcon(index: number): string {
  const state = getStarState(index)
  if (state === 'full') return filledIcon
  if (state === 'half') return halfIcon
  return emptyIcon
}

function getStarColor(index: number): ButtonProps['color'] {
  const state = getStarState(index)
  return state !== 'empty' ? color : 'neutral'
}

const badgeLabel = computed(() => `${modelValue}/${max}`)
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <slot name="prefix" :value="modelValue" :max="max" />

    <div class="flex items-center gap-0.5">
      <UButton
        v-for="index in max"
        :key="index"
        :icon="getStarIcon(index - 1)"
        :color="getStarColor(index - 1)"
        variant="ghost"
        :size="size"
        :disabled="disabled"
        v-bind="buttonProps"
        class="transition-all duration-150"
        :class="{
          'cursor-pointer hover:scale-110': isInteractive,
          'cursor-not-allowed opacity-50': disabled,
          'cursor-default': readonly && !disabled
        }"
        @click="handleClick(index - 1, $event)"
        @mouseenter="handleMouseEnter(index - 1, $event)"
        @mousemove="handleMouseMove(index - 1, $event)"
        @mouseleave="handleMouseLeave"
      />
    </div>

    <slot
      name="badge"
      :value="modelValue"
      :max="max"
      :label="badgeLabel"
    >
      <UBadge
        v-if="showBadge && modelValue > 0"
        :label="badgeLabel"
        color="primary"
        variant="subtle"
        size="xs"
      />
    </slot>

    <slot name="suffix" :value="modelValue" :max="max" />
  </div>
</template>
