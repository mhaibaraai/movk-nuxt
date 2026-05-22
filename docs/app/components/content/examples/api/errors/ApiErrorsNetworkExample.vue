<script setup lang="ts">
import type { FetchError } from 'ofetch'

const network = useApiFetch('/demo/errors?type=network', { immediate: false, toast: false })

const info = computed(() => {
  const err = network.error.value as FetchError | null
  if (!err) return null
  return {
    name: err.name,
    statusCode: err.statusCode ?? null,
    message: err.message
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="network.execute()">
      触发网络中断
    </UButton>
    <p class="text-xs text-muted">
      服务端 <code>res.destroy()</code> 强制断开：客户端拿到无 <code>statusCode</code> 的 <code>FetchError</code>。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
