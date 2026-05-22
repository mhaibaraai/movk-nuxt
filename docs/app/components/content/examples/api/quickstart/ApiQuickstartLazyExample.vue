<script setup lang="ts">
interface Profile {
  id: string
  name: string
  email: string
}

const { data, pending, error, refresh } = useLazyApiFetch<Profile>('/profile')
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2 flex-wrap">
      <UBadge v-if="pending" color="warning" variant="subtle">
        pending
      </UBadge>
      <UBadge v-else-if="error" color="error" variant="subtle">
        error
      </UBadge>
      <UBadge v-else color="success" variant="subtle">
        ready
      </UBadge>
      <UButton size="sm" variant="outline" icon="i-lucide-refresh-cw" @click="refresh()">
        刷新
      </UButton>
    </div>
    <p class="text-xs text-muted">
      lazy 模式：页面先渲染再进入 pending；data 在拿到响应前为 null
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ error ? { error: error.message } : data }}</pre>
  </div>
</template>
