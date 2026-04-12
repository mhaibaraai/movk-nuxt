<script setup lang="ts">
import { UTooltip } from '#components'
import { nextTick, onMounted, onUnmounted, ref, useAttrs, useTemplateRef, watch } from 'vue'
import { isOverflowing, isMultilineOverflowing } from '../../utils/data-table-utils'

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
const cellRef = useTemplateRef<HTMLDivElement>('cellRef')
const overflowed = ref(false)

let observer: ResizeObserver | null = null

const isMultiline = typeof props.lines === 'number' && props.lines > 1

function checkOverflow() {
  if (!cellRef.value) return
  overflowed.value = isMultiline
    ? isMultilineOverflowing(cellRef.value)
    : isOverflowing(cellRef.value)
}

onMounted(async () => {
  await nextTick()
  checkOverflow()
  if (cellRef.value) {
    observer = new ResizeObserver(checkOverflow)
    observer.observe(cellRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

watch(() => props.text, checkOverflow)

const multilineStyle = isMultiline
  ? { '-webkit-line-clamp': props.lines, 'display': '-webkit-box', '-webkit-box-orient': 'vertical', 'overflow': 'hidden', 'white-space': 'normal' }
  : undefined
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
