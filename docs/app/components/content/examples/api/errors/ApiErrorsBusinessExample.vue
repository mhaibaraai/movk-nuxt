<script setup lang="ts">
import type { ApiError } from '@movk/nuxt'
import type { FetchError } from 'ofetch'

const business = useApiFetch('/demo/errors?type=business', { immediate: false, toast: false })

const info = computed(() => {
  const err = business.error.value
  if (!err) return null
  const apiErr = err as Partial<ApiError>
  return {
    kind: apiErr.isBusinessError ? 'ApiError（业务错误）' : 'FetchError',
    statusCode: apiErr.statusCode ?? (err as FetchError).statusCode,
    message: err.message,
    isBusinessError: apiErr.isBusinessError ?? false
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="business.execute()">
      触发业务错误
    </UButton>
    <p class="text-xs text-muted">
      HTTP 200 但 <code>code</code> 不在 <code>successCodes</code> 内：抛出 <code>ApiError</code>，<code>isBusinessError</code> 为 true。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
