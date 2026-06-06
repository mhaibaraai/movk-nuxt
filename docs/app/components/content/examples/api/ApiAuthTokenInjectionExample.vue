<script setup lang="ts">
const publicConfig = useRuntimeConfig().public.movkApi
const protectedRes = useApiFetch('/demo/protected', { immediate: false })

const echoed = computed(() => {
  const data = protectedRes.data.value
  return data && typeof data === 'object'
    ? (data as { authHeader?: string }).authHeader
    : null
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" variant="outline" icon="i-lucide-send" @click="protectedRes.execute()">
      请求 /demo/protected 查看注入
    </UButton>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ {
      headerName: publicConfig.auth?.headerName ?? 'Authorization',
      tokenType: publicConfig.auth?.tokenType ?? 'Bearer',
      echoed
    } }}</pre>
    <p class="text-xs text-muted">
      登录后再次请求，<code>echoed</code> 字段会展示拦截器实际注入的 Authorization 头。
    </p>
  </div>
</template>
