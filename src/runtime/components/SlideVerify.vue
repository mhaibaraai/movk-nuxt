<script lang="ts">
import type { VNode } from '#imports'
import type { ComponentConfig } from '@nuxt/ui'
import type { AppConfig } from 'nuxt/schema'
import theme from '#build/movk-ui/slide-verify'

type SlideVerify = ComponentConfig<typeof theme, AppConfig, 'slideVerify'>

export interface SlideVerifyProps {
  /**
   * 滑块宽度
   * @defaultValue 50
   */
  sliderWidth?: number
  /**
   * 滑块高度
   * @defaultValue 32
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
   * 自定义各区域样式
   */
  ui?: SlideVerify['slots']
}

export interface SlideVerifyEmits {
  success: []
  dragStart: []
  dragEnd: [success: boolean]
}

export interface SlideVerifySlots {
  slider?(props: { verified: boolean, progress: number }): VNode[]
}
</script>

<script lang="ts" setup>
import { UIcon } from '#components'
import { useAppConfig } from '#imports'
import { useElementSize } from '@vueuse/core'
import { Motion } from 'motion-v'
import { computed, ref, useTemplateRef } from 'vue'
import { tv } from '../utils/tv'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SlideVerifyProps>(), {
  sliderWidth: 50,
  height: 32,
  disabled: false,
  text: '请向右滑动验证',
  successText: '验证成功',
  icon: 'i-lucide-chevrons-right',
  successIcon: 'i-lucide-check',
  threshold: 0.9
})

const emits = defineEmits<SlideVerifyEmits>()
defineSlots<SlideVerifySlots>()

const isVerified = defineModel<boolean>({ default: false })
const trackRef = useTemplateRef<HTMLElement>('track')
const { width: trackWidth } = useElementSize(trackRef)
const isDragging = ref(false)
const dragX = ref(0)

const appConfig = useAppConfig() as SlideVerify['AppConfig']

const uiCls = computed(() =>
  tv({ extend: tv(theme), ...((appConfig.movk?.slideVerify || {}) as typeof theme) })({
    disabled: props.disabled,
    verified: isVerified.value
  })
)

const maxDragDistance = computed(() =>
  trackWidth.value ? Math.max(0, trackWidth.value - props.sliderWidth - 8) : 0
)

const progress = computed(() =>
  isVerified.value ? 1 : maxDragDistance.value ? Math.min(dragX.value / maxDragDistance.value, 1) : 0
)

const canInteract = computed(() => !props.disabled && !isVerified.value && trackWidth.value > 0)

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 }

function handleDragStart() {
  if (!canInteract.value) return
  isDragging.value = true
  emits('dragStart')
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
    :class="uiCls.root({ class: props.ui?.root })"
    :style="{ height: `${height}px` }"
    role="slider"
    :aria-label="text"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-disabled="disabled"
  >
    <div ref="track" :class="uiCls.track({ class: props.ui?.track })">
      <Motion
        v-if="!isVerified"
        as="div"
        class="absolute inset-y-0 left-0 bg-primary/20"
        :animate="{ width: `${progress * 100}%`, opacity: 0.6 }"
        :transition="isDragging ? { duration: 0 } : springTransition"
      />

      <div :class="uiCls.text({ class: props.ui?.text })">
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
      <div :class="uiCls.slider({ class: props.ui?.slider })">
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
