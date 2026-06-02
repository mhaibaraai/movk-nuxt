<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const props = defineProps<{
  type: SemanticColor
}>()

const { alert } = useMessageBox()
const log = ref<string[]>([])

async function showAlert() {
  await alert({
    type: props.type,
    title: `${props.type} alert`,
    description: '弹窗只暴露确认动作，关闭后 Promise 才会 resolve'
  })
  log.value = [`[${new Date().toLocaleTimeString()}] alert(${props.type}) closed`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton :color="type" variant="soft" size="sm" @click="showAlert">
      alert · {{ type }}
    </UButton>
    <p class="text-xs text-muted">
      <code>alert()</code> 返回 Promise；用户关闭弹窗后才会 resolve，可用于强同步的提示流程。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-40">{{ log }}</pre>
  </div>
</template>
