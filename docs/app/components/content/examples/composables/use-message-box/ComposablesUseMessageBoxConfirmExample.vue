<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const props = defineProps<{
  type: SemanticColor
}>()

const { confirm } = useMessageBox()
const log = ref<string[]>([])

async function showConfirm() {
  const ok = await confirm({
    type: props.type,
    title: `${props.type} confirm`,
    description: '弹窗返回确认结果，日志会记录 true / false'
  })
  log.value = [`[${new Date().toLocaleTimeString()}] confirm(${props.type}) → ${ok}`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton :color="type" variant="outline" size="sm" @click="showConfirm">
      confirm · {{ type }}
    </UButton>
    <p class="text-xs text-muted">
      <code>confirm()</code> 将确认或取消映射为 <code>boolean</code> 返回给调用方。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-40">{{ log }}</pre>
  </div>
</template>
