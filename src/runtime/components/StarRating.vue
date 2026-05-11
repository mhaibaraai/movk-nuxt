<script lang="ts" setup>
import type { ButtonProps, ComponentConfig } from '@nuxt/ui'
import { UButton, UBadge } from '#components'
import { computed, ref } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../utils/tv'
import theme from '#build/movk-ui/star-rating'
import type { AppConfig } from 'nuxt/schema'
import type { StarRatingProps, StarRatingEmits } from '../types/components/star-rating'

interface _Props extends StarRatingProps {
  ui?: ComponentConfig<typeof theme, AppConfig, 'starRating'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  modelValue: 0,
  max: 5,
  showBadge: true,
  emptyIcon: 'i-lucide-star',
  filledIcon: 'i-lucide-star',
  halfIcon: 'i-lucide-star-half'
})
const emits = defineEmits<StarRatingEmits>()

defineOptions({ inheritAttrs: false })

const hoveredStar = ref<number | null>(null)
const focusedIndex = ref<number>(0)

const isInteractive = computed(() => !props.disabled && !props.readonly)

const appConfig = useAppConfig() as { movk?: { starRating?: unknown } }

const uiCls = computed(() =>
  tv({ extend: tv(theme), ...((appConfig.movk?.starRating || {}) as typeof theme) })({
    interactive: isInteractive.value,
    disabled: props.disabled,
    readonly: props.readonly && !props.disabled
  })
)

function calculateHalfStarValue(index: number, event: MouseEvent): number {
  if (!props.allowHalf) return index + 1

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const posX = event.clientX - rect.left
  const halfWidth = rect.width / 2

  return posX < halfWidth ? index + 0.5 : index + 1
}

function updateValue(newValue: number) {
  if (props.clearable && newValue === props.modelValue) {
    emits('update:modelValue', 0)
    emits('change', 0)
    return
  }

  emits('update:modelValue', newValue)
  emits('change', newValue)
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
  emits('hover', hoverValue)
}

function handleMouseMove(index: number, event: MouseEvent) {
  if (!isInteractive.value || !props.allowHalf) return

  const hoverValue = calculateHalfStarValue(index, event)
  const currentHover = hoveredStar.value !== null ? hoveredStar.value + 1 : null

  if (currentHover !== hoverValue) {
    hoveredStar.value = hoverValue - 1
    emits('hover', hoverValue)
  }
}

function handleMouseLeave() {
  if (!isInteractive.value) return
  hoveredStar.value = null
  emits('hover', null)
}

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
    :class="uiCls.root({ class: props.ui?.root })"
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
    <div :class="uiCls.stars({ class: props.ui?.stars })">
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
        :class="uiCls.star({ class: props.ui?.star })"
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
        :size="props.size"
      />
    </slot>

    <slot name="suffix" :value="props.modelValue" :max="props.max" />
  </div>
</template>
