<script setup lang="ts">
const theme = useTheme()
const configOutput = computed(() => theme.exportConfig())
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-muted">
      <code>exportConfig()</code> 生成可直接写入 <code>app.config.ts</code> 的主题配置片段。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ configOutput }}</pre>
  </div>
</template>
