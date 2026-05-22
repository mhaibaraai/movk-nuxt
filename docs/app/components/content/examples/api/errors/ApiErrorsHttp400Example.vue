<script setup lang="ts">
import type { ApiError } from '@movk/nuxt'
import type { FetchError } from 'ofetch'

const http400 = useApiFetch('/profile?fail=1', { immediate: false, toast: false })

const info = computed(() => {
  const err = http400.error.value
  if (!err) return null
  const apiErr = err as Partial<ApiError>
  return {
    kind: apiErr.isBusinessError ? 'ApiError' : 'FetchError',
    statusCode: apiErr.statusCode ?? (err as FetchError).statusCode,
    message: err.message
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="http400.execute()">
      触发 HTTP 400
    </UButton>
    <p class="text-xs text-muted">
      后端 <code>createError({ statusCode: 400 })</code>：原生 <code>FetchError</code>，<code>statusCode=400</code>。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
