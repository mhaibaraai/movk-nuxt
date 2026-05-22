<script setup lang="ts">
const theme = useTheme()
const cssOutput = computed(() => theme.exportCSS())
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-muted">
      <code>exportCSS()</code> 将当前主题差异序列化为可直接写入 <code>main.css</code> 的片段。
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-64">{{ cssOutput }}</pre>
  </div>
</template>
