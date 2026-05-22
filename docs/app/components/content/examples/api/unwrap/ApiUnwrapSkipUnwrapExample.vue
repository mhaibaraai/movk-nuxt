<script setup lang="ts">
const raw = useApiFetch('/profile', { skipUnwrap: true })
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge color="info" variant="subtle">
      { skipUnwrap: true }
    </UBadge>
    <p class="text-xs text-muted">
      <code>skipUnwrap: true</code> 不重写 <code>response._data</code>，调用方拿到 <code>code/message/data</code> 完整信封。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ raw.data.value }}</pre>
  </div>
</template>
