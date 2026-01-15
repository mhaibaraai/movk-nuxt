<script setup lang="ts">
import { UIcon } from '#components'
import { useElementSize } from '@vueuse/core'
import { Motion } from 'motion-v'
import { computed, ref, useTemplateRef } from 'vue'
import type { ClassNameValue } from 'tailwind-merge'

export interface SlideVerifyProps {
  /**
   * 滑块宽度
   * @defaultValue 50
   */
  sliderWidth?: number
  /**
   * 滑块高度
   * @defaultValue 44
   */
  height?: number
  /**
   * 是否禁用
   * @defaultValue false
   */
  disabled?: boolean
  /**
   * 待滑动时的提示文本
   * @defaultValue '请向右滑动验证'
   */
  text?: string
  /**
   * 验证成功时的提示文本
   * @defaultValue '验证成功'
   */
  successText?: string
  /**
   * 滑块图标
   * @defaultValue 'i-lucide-chevrons-right'
   */
  icon?: string
  /**
   * 验证成功时的图标
   * @defaultValue 'i-lucide-check'
   */
  successIcon?: string
  /**
   * 完成验证所需的阈值百分比（0-1）
   * @defaultValue 0.9
   */
  threshold?: number
  /**
   * 自定义轨道样式
   */
  trackClass?: ClassNameValue
  /**
   * 自定义滑块样式
   */
  sliderClass?: ClassNameValue
  /**
   * 自定义文本样式
   */
  textClass?: ClassNameValue
  /**
   * 自定义根元素样式
   */
  class?: ClassNameValue
}

export interface SlideVerifyEmits {
  success: []
  dragStart: []
  dragEnd: [success: boolean]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SlideVerifyProps>(), {
  sliderWidth: 50,
  height: 44,
  disabled: false,
  text: '请向右滑动验证',
  successText: '验证成功',
  icon: 'i-lucide-chevrons-right',
  successIcon: 'i-lucide-check',
  threshold: 0.9
})

const emit = defineEmits<SlideVerifyEmits>()

const isVerified = defineModel<boolean>({ default: false })
const trackRef = useTemplateRef<HTMLElement>('track')
const { width: trackWidth } = useElementSize(trackRef)
const isDragging = ref(false)
const dragX = ref(0)

const maxDragDistance = computed(() =>
  trackWidth.value ? Math.max(0, trackWidth.value - props.sliderWidth - 8) : 200
)

const progress = computed(() =>
  isVerified.value ? 1 : maxDragDistance.value ? Math.min(dragX.value / maxDragDistance.value, 1) : 0
)

const canInteract = computed(() => !props.disabled && !isVerified.value)

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 }

function handleDragStart() {
  if (!canInteract.value) return
  isDragging.value = true
  emit('dragStart')
}

function handleDrag(_event: PointerEvent, info: { offset: { x: number } }) {
  if (!canInteract.value) return
  dragX.value = Math.max(0, Math.min(info.offset.x, maxDragDistance.value))
}

function handleDragEnd() {
  if (!canInteract.value) return
  isDragging.value = false

  const success = progress.value >= props.threshold
  if (success) {
    isVerified.value = true
    emit('success')
  } else {
    dragX.value = 0
  }
  emit('dragEnd', success)
}

function reset() {
  isVerified.value = false
  dragX.value = 0
}

defineExpose({ reset })
</script>

<template>
  <div
    :class="[
      'relative select-none overflow-hidden rounded-lg border transition-colors duration-300',
      props.class,
      disabled ? 'opacity-50 pointer-events-none' : '',
      isVerified ? 'bg-success border-transparent' : 'bg-elevated border-default'
    ]"
    :style="{ height: `${height}px` }"
    role="slider"
    :aria-label="text"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-disabled="disabled"
  >
    <div ref="track" class="absolute inset-0" :class="trackClass">
      <Motion
        v-if="!isVerified"
        as="div"
        class="absolute inset-y-0 left-0 bg-primary/20"
        :animate="{ width: `${progress * 100}%`, opacity: 0.6 }"
        :transition="springTransition"
      />

      <div
        class="absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none"
        :class="textClass"
      >
        <Motion
          v-if="!isVerified"
          as="span"
          class="relative inline-block bg-size-[200%_100%] bg-clip-text text-transparent bg-no-repeat"
          :style="{
            backgroundImage: 'radial-gradient(circle at center, var(--color-gray-500), transparent), linear-gradient(var(--color-neutral-400), var(--color-neutral-400))',
            opacity: 1 - progress * 0.5
          }"
          :animate="{ backgroundPosition: '-200% 50%, 0 0' }"
          :initial="{ backgroundPosition: '200% 50%, 0 0' }"
          :transition="{
            repeat: Infinity,
            duration: 2,
            ease: 'linear'
          }"
        >
          {{ text }}
        </Motion>
        <span v-else class="text-inverted font-medium">{{ successText }}</span>
      </div>
    </div>

    <Motion
      as="div"
      class="absolute inset-1"
      :style="{ width: `${sliderWidth}px` }"
      :initial="{ x: 0 }"
      :animate="{ x: isVerified ? maxDragDistance : isDragging ? dragX : 0 }"
      :transition="isDragging ? { duration: 0 } : springTransition"
      :while-hover="canInteract ? { scale: 1.02 } : undefined"
      :while-tap="canInteract ? { scale: 0.98 } : undefined"
      :drag="canInteract ? 'x' : false"
      :drag-constraints="{ left: 0, right: maxDragDistance }"
      :drag-elastic="0"
      :drag-momentum="false"
      @drag-start="handleDragStart"
      @drag="handleDrag"
      @drag-end="handleDragEnd"
    >
      <div
        class="size-full flex items-center justify-center rounded-md shadow-sm transition-colors"
        :class="[
          sliderClass,
          isVerified
            ? 'bg-white/90'
            : 'bg-default cursor-grab active:cursor-grabbing ring-1 ring-default'
        ]"
      >
        <slot name="slider" :verified="isVerified" :progress="progress">
          <UIcon
            :name="isVerified ? successIcon : icon"
            :class="['size-5', isVerified ? 'text-success' : 'text-primary']"
          />
        </slot>
      </div>
    </Motion>
  </div>
</template>
