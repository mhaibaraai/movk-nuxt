<script setup lang="ts">
const { confirm } = useMessageBox()
const log = ref<string[]>([])
const pending = ref(false)

async function showAsync() {
  const ok = await confirm({
    type: 'warning',
    title: '异步操作',
    description: '确认后再执行模拟耗时任务，日志在流程完成时更新',
    confirmButton: { label: '提交' }
  })
  if (!ok) {
    log.value = [`[${new Date().toLocaleTimeString()}] 已取消`, ...log.value].slice(0, 6)
    return
  }
  pending.value = true
  await new Promise(r => setTimeout(r, 1500))
  pending.value = false
  log.value = [`[${new Date().toLocaleTimeString()}] async confirm 完成`, ...log.value].slice(0, 6)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton color="warning" icon="i-lucide-zap" :loading="pending" @click="showAsync">
      运行异步流程
    </UButton>
    <p class="text-xs text-muted">
      等待 <code>confirm()</code> 结果后再串行执行后续请求；命令式 API 让流程在脚本里线性表达。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-40">{{ log }}</pre>
  </div>
</template>
