<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const { confirm } = useMessageBox()
const log = ref<string[]>([])

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']

async function showConfirm(type: SemanticColor) {
  const ok = await confirm({
    type,
    title: `${type} confirm`,
    description: '弹窗返回确认结果，日志会记录 true / false'
  })
  log.value = [`[${new Date().toLocaleTimeString()}] confirm(${type}) → ${ok}`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="t in types"
        :key="t"
        :color="t"
        variant="outline"
        size="sm"
        @click="showConfirm(t)"
      >
        confirm · {{ t }}
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>confirm()</code> 将确认或取消映射为 <code>boolean</code> 返回给调用方。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-40">{{ log }}</pre>
  </div>
</template>
