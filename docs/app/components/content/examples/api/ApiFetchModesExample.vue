<script setup lang="ts">
interface Profile {
  id: string
  name: string
  email: string
}

const ssr = await useApiFetch<Profile>('/profile', { key: 'modes-ssr', toast: false })
const lazy = useLazyApiFetch<Profile>('/profile', { key: 'modes-lazy', toast: false })
const client = useClientApiFetch<Profile>('/profile', { key: 'modes-client', toast: false })

const modes = [
  { name: 'useApiFetch', hint: 'SSR 取数，阻塞导航', result: ssr },
  { name: 'useLazyApiFetch', hint: 'SSR 取数，不阻塞导航', result: lazy },
  { name: 'useClientApiFetch', hint: '跳过 SSR，水合后自动请求', result: client }
]
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div v-for="mode in modes" :key="mode.name" class="flex flex-col gap-2 rounded-md border border-default p-3">
      <div class="flex items-center justify-between gap-2">
        <code class="text-xs font-semibold">{{ mode.name }}</code>
        <UBadge
          size="sm"
          variant="subtle"
          :color="mode.result.status.value === 'success' ? 'success' : mode.result.status.value === 'error' ? 'error' : 'warning'"
        >
          {{ mode.result.status.value }}
        </UBadge>
      </div>
      <p class="text-xs text-muted">
        {{ mode.hint }}
      </p>
      <pre class="text-xs p-2 rounded bg-soft overflow-auto">{{ mode.result.data.value?.name ?? null }}</pre>
      <UButton size="xs" variant="outline" icon="i-lucide-refresh-cw" @click="mode.result.refresh()">
        刷新
      </UButton>
    </div>
  </div>
</template>
