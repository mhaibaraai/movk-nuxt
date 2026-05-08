<script setup lang="ts">
defineProps<{
  state?: unknown
  label?: string
  collapsed?: boolean
}>()
</script>

<template>
  <details :open="!collapsed" class="rounded-md border border-default bg-elevated/30 text-sm">
    <summary class="cursor-pointer px-3 py-2 text-muted font-medium select-none">
      {{ label || 'State' }}
    </summary>
    <pre class="px-3 pb-3 text-xs overflow-auto max-h-80">{{ state }}</pre>
  </details>
</template>
