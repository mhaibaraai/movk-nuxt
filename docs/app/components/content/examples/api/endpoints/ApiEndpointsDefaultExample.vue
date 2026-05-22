<script setup lang="ts">
const publicConfig = useRuntimeConfig().public.movkApi
const { data, refresh } = useApiFetch('/profile')
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge variant="subtle">
      baseURL: {{ publicConfig.endpoints?.default?.baseURL }}
    </UBadge>
    <UButton size="sm" variant="outline" icon="i-lucide-refresh-cw" @click="refresh()">
      刷新
    </UButton>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ data }}</pre>
  </div>
</template>
