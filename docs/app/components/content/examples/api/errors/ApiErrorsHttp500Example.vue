<script setup lang="ts">
import type { FetchError } from 'ofetch'

const http500 = useApiFetch('/demo/errors?type=500', { immediate: false, toast: false })

const info = computed(() => {
  const err = http500.error.value as FetchError | null
  if (!err) return null
  return {
    statusCode: err.statusCode,
    message: err.message
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="http500.execute()">
      触发 HTTP 500
    </UButton>
    <p class="text-xs text-muted">
      服务器抛 500：原生 <code>FetchError</code>，<code>statusCode=500</code>。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
