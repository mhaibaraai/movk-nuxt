<script setup lang="ts">
const external = useApiFetch('/demo/external', {
  skipBusinessCheck: true,
  skipUnwrap: true
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UBadge color="error" variant="subtle">
      { skipBusinessCheck: true, skipUnwrap: true }
    </UBadge>
    <p class="text-xs text-muted">
      external 接口信封非标（<code>result + ts</code>），两个开关同时打开后调用方完全自处理响应。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ external.data.value }}</pre>
  </div>
</template>
