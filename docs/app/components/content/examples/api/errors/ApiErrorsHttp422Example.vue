<script setup lang="ts">
import type { FetchError } from 'ofetch'

const http422 = useApiFetch('/demo/errors?type=422', { immediate: false, toast: false })

const info = computed(() => {
  const err = http422.error.value as FetchError | null
  if (!err) return null
  return {
    statusCode: err.statusCode,
    message: err.message,
    data: err.data
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="http422.execute()">
      触发 HTTP 422
    </UButton>
    <p class="text-xs text-muted">
      后端 <code>createError({ statusCode: 422, data: { fields } })</code>：错误对象的 <code>data</code> 字段携带服务端补充信息。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
