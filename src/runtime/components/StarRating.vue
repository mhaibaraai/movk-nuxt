<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { UButton, UBadge } from '#components'
import { computed, ref } from 'vue'

export interface StarRatingProps {
  /**
   * 当前评分值
   * @defaultValue 0
   */
  modelValue?: number
  /**
   * 最大星级数
   * @defaultValue 5
   */
  max?: number
  /**
   * 是否禁用
   * @defaultValue false
   */
  disabled?: boolean
  /**
   * 是否只读
   * @defaultValue false
   */
  readonly?: boolean
  /**
   * 是否显示评分徽章
   * @defaultValue true
   */
  showBadge?: boolean
  /**
   * 自定义星星按钮属性
   */
  buttonProps?: Partial<ButtonProps>
  /**
   * 未选中星星的图标
   * @defaultValue 'i-lucide-star'
   */
  emptyIcon?: string
  /**
   * 选中星星的图标
   * @defaultValue 'i-lucide-star'
   */
  filledIcon?: string
  /**
   * 半星图标
   * @defaultValue 'i-lucide-star-half'
   */
  halfIcon?: string
  /**
   * 选中星星的颜色
   * @defaultValue 'warning'
   */
  color?: ButtonProps['color']
  /**
   * 星星大小
   * @defaultValue 'sm'
   */
  size?: ButtonProps['size']
  /**
   * 是否允许半星
   * @defaultValue false
   */
  allowHalf?: boolean
  /**
   * 是否允许清除评分
   * @defaultValue false
   */
  clearable?: boolean
}

export interface StarRatingEmits {
  'update:modelValue': [value: number]
  /** 评分改变事件 */
  'change': [value: number]
  /** 悬停事件 */
  'hover': [value: number | null]
}

const props = withDefaults(defineProps<StarRatingProps>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  readonly: false,
  showBadge: true,
  emptyIcon: 'i-lucide-star',
  filledIcon: 'i-lucide-star',
  halfIcon: 'i-lucide-star-half',
  color: 'warning',
  size: 'sm',
  allowHalf: false,
  clearable: false
})
const emit = defineEmits<StarRatingEmits>()

defineOptions({ inheritAttrs: false })

const hoveredStar = ref<number | null>(null)
const focusedIndex = ref<number>(0)

const isInteractive = computed(() => !props.disabled && !props.readonly)

/**
 * 计算半星位置：根据鼠标/点击位置判断是否为半星
 */
function calculateHalfStarValue(index: number, event: MouseEvent): number {
  if (!props.allowHalf) return index + 1

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const posX = event.clientX - rect.left
  const halfWidth = rect.width / 2

  return posX < halfWidth ? index + 0.5 : index + 1
}

/**
 * 更新评分值
 */
function updateValue(newValue: number) {
  if (props.clearable && newValue === props.modelValue) {
    emit('update:modelValue', 0)
    emit('change', 0)
    return
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function handleClick(index: number, event?: MouseEvent) {
  if (!isInteractive.value || !event) return

  const newValue = calculateHalfStarValue(index, event)
  updateValue(newValue)
}

function handleMouseEnter(index: number, event?: MouseEvent) {
  if (!isInteractive.value || !event) return

  const hoverValue = calculateHalfStarValue(index, event)
  hoveredStar.value = hoverValue - 1
  emit('hover', hoverValue)
}

function handleMouseMove(index: number, event: MouseEvent) {
  if (!isInteractive.value || !props.allowHalf) return

  const hoverValue = calculateHalfStarValue(index, event)
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

/**
 * 键盘导航支持
 */
function handleKeyDown(event: KeyboardEvent) {
  if (!isInteractive.value) return

  const step = props.allowHalf ? 0.5 : 1

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault()
      if (props.modelValue < props.max) {
        updateValue(Math.min(props.modelValue + step, props.max))
        focusedIndex.value = Math.min(Math.floor(props.modelValue + step), props.max - 1)
      }
      break

    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault()
      if (props.modelValue > 0) {
        updateValue(Math.max(props.modelValue - step, 0))
        focusedIndex.value = Math.max(Math.floor(props.modelValue - step) - 1, 0)
      }
      break

    case 'Home':
      event.preventDefault()
      updateValue(step)
      focusedIndex.value = 0
      break

    case 'End':
      event.preventDefault()
      updateValue(props.max)
      focusedIndex.value = props.max - 1
      break

    case 'Backspace':
    case 'Delete':
      if (props.clearable) {
        event.preventDefault()
        updateValue(0)
        focusedIndex.value = 0
      }
      break

    default:
      // 数字键快速设置评分
      if (event.key >= '0' && event.key <= '9') {
        const numValue = Number.parseInt(event.key)
        if (numValue <= props.max) {
          event.preventDefault()
          updateValue(numValue)
          focusedIndex.value = Math.max(numValue - 1, 0)
        }
      }
  }
}

function getStarState(index: number): 'empty' | 'half' | 'full' {
  const displayValue = hoveredStar.value !== null ? hoveredStar.value + 1 : props.modelValue

  if (index < Math.floor(displayValue)) {
    return 'full'
  }

  if (props.allowHalf && index === Math.floor(displayValue) && displayValue % 1 !== 0) {
    return 'half'
  }

  return 'empty'
}

function getStarIcon(index: number): string {
  const state = getStarState(index)
  if (state === 'full') return props.filledIcon
  if (state === 'half') return props.halfIcon
  return props.emptyIcon
}

function getStarColor(index: number): ButtonProps['color'] {
  const state = getStarState(index)
  return state !== 'empty' ? props.color : 'neutral'
}

const badgeLabel = computed(() => `${props.modelValue}/${props.max}`)
</script>

<template>
  <div
    class="inline-flex items-center gap-1"
    role="slider"
    :aria-label="`评分 ${props.modelValue} / ${props.max}`"
    :aria-valuenow="props.modelValue"
    :aria-valuemin="0"
    :aria-valuemax="props.max"
    :aria-disabled="props.disabled"
    :aria-readonly="props.readonly"
    :tabindex="isInteractive ? 0 : -1"
    @keydown="handleKeyDown"
  >
    <slot name="prefix" :value="props.modelValue" :max="props.max" />
    <div class="flex items-center gap-0.5">
      <UButton
        v-for="index in props.max"
        :key="index"
        :icon="getStarIcon(index - 1)"
        :color="getStarColor(index - 1)"
        variant="ghost"
        :size="props.size"
        :disabled="props.disabled"
        :aria-label="`${index} 星`"
        :tabindex="-1"
        v-bind="buttonProps"
        class="transition-all duration-150"
        :class="{
          'cursor-pointer hover:scale-110': isInteractive,
          'cursor-not-allowed opacity-50': props.disabled,
          'cursor-default': props.readonly && !props.disabled
        }"
        @click="handleClick(index - 1, $event)"
        @mouseenter="handleMouseEnter(index - 1, $event)"
        @mousemove="handleMouseMove(index - 1, $event)"
        @mouseleave="handleMouseLeave"
      />
    </div>

    <slot
      name="badge"
      :value="props.modelValue"
      :max="props.max"
      :label="badgeLabel"
    >
      <UBadge
        v-if="showBadge && props.modelValue > 0"
        :label="badgeLabel"
        color="primary"
        variant="subtle"
        size="xs"
      />
    </slot>

    <slot name="suffix" :value="props.modelValue" :max="props.max" />
  </div>
</template>
