<script setup lang="ts">
import { UTooltip } from '#components'
import { computed, useAttrs, useTemplateRef } from 'vue'
import { useOverflowDetection } from './useOverflowDetection'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /**
   * 单元格显示文本，溢出时作为 Tooltip 内容
   */
  text: string
  /**
   * true = 单行截断，number = 多行截断行数（-webkit-line-clamp）
   */
  lines?: boolean | number
}>()

const attrs = useAttrs()
const cellRef = useTemplateRef('cellRef')
const { overflowed } = useOverflowDetection(cellRef)

const isMultiline = computed(() => typeof props.lines === 'number' && props.lines > 1)
const multilineStyle = computed(() =>
  isMultiline.value
    ? {
        '-webkit-line-clamp': props.lines,
        'display': '-webkit-box',
        '-webkit-box-orient': 'vertical',
        'overflow': 'hidden',
        'white-space': 'normal',
        'word-break': 'break-all'
      }
    : undefined
)
</script>

<template>
  <UTooltip
    :disabled="!overflowed"
    :text="text"
    v-bind="attrs"
  >
    <div
      ref="cellRef"
      :class="isMultiline ? 'overflow-hidden' : 'truncate'"
      :style="multilineStyle"
    >
      {{ text }}
    </div>
  </UTooltip>
</template>
