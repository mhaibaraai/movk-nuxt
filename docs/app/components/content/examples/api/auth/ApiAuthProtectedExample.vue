<script setup lang="ts">
const protectedRes = useApiFetch('/demo/protected', { immediate: false })

const display = computed(() => {
  if (protectedRes.error.value) {
    return {
      statusCode: protectedRes.error.value.statusCode,
      message: protectedRes.error.value.message
    }
  }
  return protectedRes.data.value
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" icon="i-lucide-shield-check" @click="protectedRes.execute()">
      请求 /demo/protected
    </UButton>
    <p class="text-xs text-muted">
      未登录时拦截器返回 401；已登录则携带 Authorization 头
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
