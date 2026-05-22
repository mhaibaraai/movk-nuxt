<script setup lang="ts">
const unwrapped = useApiFetch('/profile')
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge variant="subtle">
      useApiFetch('/profile')
    </UBadge>
    <p class="text-xs text-muted">
      按 <code>response.dataKey</code>（默认 <code>data</code>）抽取业务数据，调用方直接拿到去信封后的对象。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ unwrapped.data.value }}</pre>
  </div>
</template>
