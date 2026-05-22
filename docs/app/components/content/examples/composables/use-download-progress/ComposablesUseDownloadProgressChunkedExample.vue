<script setup lang="ts">
const chunked = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      :loading="chunked.status.value === 'pending'"
      icon="i-lucide-download"
      @click="chunked.download('/download/chunked')"
    >
      开始下载
    </UButton>
    <UProgress :model-value="chunked.progress.value ?? undefined" :max="100" />
    <p class="text-xs text-muted">
      {{ chunked.progress.value === null ? '不确定' : `${chunked.progress.value}%` }}
      · 状态 {{ chunked.status.value }}
    </p>
    <p class="text-xs text-muted">
      GET <code>/download/chunked</code> 未返回 <code>content-length</code>，<code>progress</code> 为 <code>null</code>，<code>UProgress</code> 进入 indeterminate 状态。
    </p>
  </div>
</template>
