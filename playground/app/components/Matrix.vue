<script lang="ts" setup>
defineProps<{
  data?: unknown
}>()
</script>

<template>
  <UCard :ui="{ body: 'space-y-6' }" class="min-w-lg">
    <slot />
    <details v-if="data">
      <summary class="cursor-pointer text-muted text-sm font-medium mb-2">
        查看表单数据
      </summary>
      <pre class="text-xs">{{ data }}</pre>
    </details>
  </UCard>
</template>
