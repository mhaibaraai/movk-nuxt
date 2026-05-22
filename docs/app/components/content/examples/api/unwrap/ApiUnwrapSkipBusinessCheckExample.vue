<script setup lang="ts">
const legacy = useApiFetch('/demo/legacy', { skipBusinessCheck: true })
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge color="warning" variant="subtle">
      { skipBusinessCheck: true }
    </UBadge>
    <p class="text-xs text-muted">
      legacy 接口未返回 <code>code</code> 字段，跳过业务校验后仍按 <code>dataKey</code> 解包出业务数据。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ legacy.data.value }}</pre>
  </div>
</template>
