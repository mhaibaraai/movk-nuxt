<script setup lang="ts">
import { UTooltip } from '#components'
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { isOverflowing, isMultilineOverflowing } from '../../utils/data-table-utils'

const props = defineProps<{
  text: string
  /** true = 单行截断, number = 多行截断行数 */
  lines?: boolean | number
}>()

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

onMounted(() => {
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
</script>

<template>
  <UTooltip
    v-if="overflowed"
    :text="text"
  >
    <div
      ref="cellRef"
      class="truncate"
      :class="{
        'line-clamp': isMultiline
      }"
      :style="isMultiline ? { '-webkit-line-clamp': lines, 'display': '-webkit-box', '-webkit-box-orient': 'vertical', 'overflow': 'hidden' } : undefined"
    >
      {{ text }}
    </div>
  </UTooltip>
  <div
    v-else
    ref="cellRef"
    class="truncate"
    :class="{
      'line-clamp': isMultiline
    }"
    :style="isMultiline ? { '-webkit-line-clamp': lines, 'display': '-webkit-box', '-webkit-box-orient': 'vertical', 'overflow': 'hidden' } : undefined"
  >
    {{ text }}
  </div>
</template>
