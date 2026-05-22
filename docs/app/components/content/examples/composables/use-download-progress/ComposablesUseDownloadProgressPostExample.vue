<script setup lang="ts">
const postExport = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      icon="i-lucide-package"
      @click="postExport.download('/download/large', {
        method: 'POST',
        body: { ids: [1, 2, 3] }
      })"
    >
      POST 导出
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ postExport.status.value }}
    </p>
    <p class="text-xs text-muted">
      <code>method: 'POST'</code> + <code>body</code>，<code>Content-Type</code> 自动补 <code>application/json</code>；后端可按 body 过滤导出范围。
    </p>
  </div>
</template>
