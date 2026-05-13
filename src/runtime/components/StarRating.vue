<script lang="ts" setup>
import type { ButtonProps, ComponentConfig } from '@nuxt/ui'
import { UButton, UBadge } from '#components'
import { computed, ref } from 'vue'
import { FieldGroupReset } from '@nuxt/ui/composables/useFieldGroup'
import { useAppConfig } from '#imports'
import theme from '#build/movk-ui/star-rating'
import type { AppConfig } from 'nuxt/schema'
import type { StarRatingProps, StarRatingEmits } from '../types/components/star-rating'
import { useExtendedTv } from '../utils/extend-theme'
import { useFieldControl } from '../utils/form-control'

interface _Props extends StarRatingProps {
  ui?: ComponentConfig<typeof theme, AppConfig, 'starRating'>['slots']
}

const props = withDefaults(defineProps<_Props>(), {
  max: 5,
  showBadge: true,
  emptyIcon: 'i-lucide-star',
  filledIcon: 'i-lucide-star',
  halfIcon: 'i-lucide-star-half'
})
const modelValue = defineModel<number>({ default: 0 })
const emits = defineEmits<StarRatingEmits>()

defineOptions({ inheritAttrs: false })

const {
  id,
  name,
  size: effectiveSize,
  color: effectiveColor,
  disabled: effectiveDisabled,
  fieldGroupOrientation,
  ariaAttrs,
  emitFormBlur,
  emitFormChange,
  emitFormFocus,
  emitFormInput
} = useFieldControl(props)
const hoveredStar = ref<number | null>(null)
const focusedIndex = ref<number>(0)

const isInteractive = computed(() => !effectiveDisabled.value && !props.readonly)

const appConfig = useAppConfig() as { movk?: { starRating?: unknown } }

const { extendUi } = useExtendedTv(
  { slots: {} },
  theme,
  () => appConfig.movk?.starRating,
  () => ({
    ui: {
      ...props.ui,
      root: [props.ui?.root, props.class]
    },
    variants: {
      interactive: isInteractive.value,
      disabled: effectiveDisabled.value,
      readonly: props.readonly && !effectiveDisabled.value,
      fieldGroup: fieldGroupOrientation.value
    }
  })
)

function emitFormValueChange() {
  emitFormInput()
  emitFormChange()
}

function calculateHalfStarValue(index: number, event: MouseEvent): number {
  if (!props.allowHalf) return index + 1

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const posX = event.clientX - rect.left
  const halfWidth = rect.width / 2

  return posX < halfWidth ? index + 0.5 : index + 1
}

function updateValue(newValue: number) {
  const finalValue = props.clearable && newValue === modelValue.value ? 0 : newValue
  modelValue.value = finalValue
  emits('change', finalValue)
  emitFormValueChange()
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
      if (modelValue.value < props.max) {
        updateValue(Math.min(modelValue.value + step, props.max))
        focusedIndex.value = Math.min(Math.floor(modelValue.value + step), props.max - 1)
      }
      break

    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault()
      if (modelValue.value > 0) {
        updateValue(Math.max(modelValue.value - step, 0))
        focusedIndex.value = Math.max(Math.floor(modelValue.value - step) - 1, 0)
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
  const displayValue = hoveredStar.value !== null ? hoveredStar.value + 1 : modelValue.value

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
  return state !== 'empty' ? effectiveColor.value : 'neutral'
}

const badgeLabel = computed(() => `${modelValue.value}/${props.max}`)
</script>

<template>
  <div
    :id="id"
    :name="name"
    :class="extendUi.root"
    role="slider"
    :aria-label="`评分 ${modelValue} / ${props.max}`"
    :aria-valuenow="modelValue"
    :aria-valuemin="0"
    :aria-valuemax="props.max"
    :aria-disabled="effectiveDisabled"
    :aria-readonly="props.readonly"
    :tabindex="isInteractive ? 0 : -1"
    v-bind="ariaAttrs"
    @blur="emitFormBlur"
    @focus="emitFormFocus"
    @keydown="handleKeyDown"
  >
    <FieldGroupReset>
      <slot name="prefix" :value="modelValue" :max="props.max" />
      <div :class="extendUi.stars">
        <UButton
          v-for="index in props.max"
          :key="index"
          :icon="getStarIcon(index - 1)"
          :color="getStarColor(index - 1)"
          variant="ghost"
          :size="effectiveSize"
          :disabled="effectiveDisabled"
          :aria-label="`${index} 星`"
          :tabindex="-1"
          v-bind="buttonProps"
          :class="extendUi.star"
          @click="handleClick(index - 1, $event)"
          @mouseenter="handleMouseEnter(index - 1, $event)"
          @mousemove="handleMouseMove(index - 1, $event)"
          @mouseleave="handleMouseLeave"
        />
      </div>

      <slot
        name="badge"
        :value="modelValue"
        :max="props.max"
        :label="badgeLabel"
      >
        <UBadge
          v-if="showBadge && modelValue > 0"
          :label="badgeLabel"
          color="primary"
          variant="subtle"
          :size="effectiveSize"
        />
      </slot>

      <slot name="suffix" :value="modelValue" :max="props.max" />
    </FieldGroupReset>
  </div>
</template>
