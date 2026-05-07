<script lang="ts" setup>
import { UIcon } from '#components'
import { useAppConfig } from '#imports'
import { useElementSize } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import { tv } from '../utils/tv'
import theme from '#build/movk-ui/slide-verify'
import type { ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import type { SlideVerifyProps, SlideVerifyEmits, SlideVerifySlots } from '../types/components/slide-verify'

const props = withDefaults(defineProps<SlideVerifyProps & {
  size?: ComponentConfig<typeof theme, AppConfig, 'slideVerify'>['variants']['size']
  ui?: ComponentConfig<typeof theme, AppConfig, 'slideVerify'>['slots']
}>(), {
  size: 'md',
  disabled: false,
  text: '请向右滑动验证',
  successText: '验证成功',
  icon: 'i-lucide-chevrons-right',
  successIcon: 'i-lucide-check',
  threshold: 0.9
})

const emits = defineEmits<SlideVerifyEmits>()
defineSlots<SlideVerifySlots>()
defineOptions({ inheritAttrs: false })

const isVerified = defineModel<boolean>({ default: false })
const rootRef = useTemplateRef<HTMLElement>('root')
const sliderRef = useTemplateRef<HTMLElement>('slider')
const { width: rootWidth } = useElementSize(rootRef)
const { width: sliderWidth } = useElementSize(sliderRef)
const isDragging = ref(false)
const dragX = ref(0)
const pointerStartX = ref(0)
const dragStartX = ref(0)

const appConfig = useAppConfig() as { movk?: { slideVerify?: unknown } }

const uiCls = computed(() =>
  tv({ extend: tv(theme), ...((appConfig.movk?.slideVerify || {}) as typeof theme) })({
    disabled: props.disabled,
    verified: isVerified.value,
    size: props.size
  })
)

const rootPaddingX = computed(() => {
  const root = rootRef.value
  const size = props.size
  if (!root || !size) return 0

  const style = getComputedStyle(root)
  return (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0)
})

const sliderOuterWidth = computed(() =>
  sliderWidth.value ? (sliderRef.value?.offsetWidth || sliderWidth.value) : 0
)

const maxDragDistance = computed(() =>
  rootWidth.value ? Math.max(0, (rootRef.value?.clientWidth || 0) - rootPaddingX.value - sliderOuterWidth.value) : 0
)

const progress = computed(() =>
  isVerified.value ? 1 : maxDragDistance.value ? Math.min(dragX.value / maxDragDistance.value, 1) : 0
)

const canInteract = computed(() => !props.disabled && !isVerified.value && rootWidth.value > 0)

const currentTranslateX = computed(() =>
  isVerified.value ? maxDragDistance.value : dragX.value
)

function handlePointerDown(e: PointerEvent) {
  if (!canInteract.value) return
  pointerStartX.value = e.clientX
  dragStartX.value = dragX.value
  isDragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  emits('dragStart')
}

function handlePointerMove(e: PointerEvent) {
  if (!isDragging.value || !canInteract.value) return
  dragX.value = Math.max(0, Math.min(
    dragStartX.value + (e.clientX - pointerStartX.value),
    maxDragDistance.value
  ))
}

function handlePointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  const success = progress.value >= props.threshold
  if (success) {
    isVerified.value = true
    emits('success')
  } else {
    dragX.value = 0
  }
  emits('dragEnd', success)
}

function reset() {
  isVerified.value = false
  dragX.value = 0
}

defineExpose({ reset })
</script>

<template>
  <div
    ref="root"
    :class="uiCls.root({ class: props.ui?.root })"
    role="slider"
    :aria-label="text"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-disabled="disabled"
  >
    <div ref="track" :class="uiCls.track({ class: props.ui?.track })">
      <div
        v-if="!isVerified"
        :class="[uiCls.fill({ class: props.ui?.fill }), isDragging ? 'transition-none' : 'transition-[width] duration-300']"
        :style="{ width: `${progress * 100}%` }"
      />

      <div :class="uiCls.text({ class: props.ui?.text })">
        <span
          v-if="!isVerified"
          class="animate-[shimmer_2s_linear_infinite] [background-size:200%_100%] bg-clip-text text-transparent bg-no-repeat select-none"
          :style="{
            backgroundImage: 'linear-gradient(90deg, var(--ui-text-dimmed) 0%, var(--ui-text-muted) 50%, var(--ui-text-dimmed) 100%)',
            opacity: 1 - progress * 0.5
          }"
        >{{ text }}</span>
        <span v-else class="font-medium text-inverted">{{ successText }}</span>
      </div>
    </div>

    <div
      ref="slider"
      :class="[
        uiCls.slider({ class: props.ui?.slider }),
        isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out',
        canInteract ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
      ]"
      :style="{ transform: `translateX(${currentTranslateX}px)` }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
    >
      <slot name="slider" :verified="isVerified" :progress="progress">
        <UIcon
          :name="isVerified ? successIcon : icon"
          :class="uiCls.icon({ class: props.ui?.icon })"
        />
      </slot>
    </div>
  </div>
</template>
