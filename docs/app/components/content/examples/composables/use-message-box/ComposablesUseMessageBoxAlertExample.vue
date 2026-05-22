<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const { alert } = useMessageBox()
const log = ref<string[]>([])

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']

async function showAlert(type: SemanticColor) {
  await alert({
    type,
    title: `${type} alert`,
    description: '弹窗只暴露确认动作，关闭后 Promise 才会 resolve'
  })
  log.value = [`[${new Date().toLocaleTimeString()}] alert(${type}) closed`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="t in types"
        :key="t"
        :color="t"
        variant="soft"
        size="sm"
        @click="showAlert(t)"
      >
        alert · {{ t }}
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>alert()</code> 返回 Promise；用户关闭弹窗后才会 resolve，可用于强同步的提示流程。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-40">{{ log }}</pre>
  </div>
</template>
