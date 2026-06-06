<script setup lang="ts">
interface Profile {
  id: string
  name: string
  email: string
  role: string
}

const { data, pending, error, refresh } = await useApiFetch<Profile>('/profile')
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
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ error ? { error: error.message } : data }}</pre>
  </div>
</template>
