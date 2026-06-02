<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '传输中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const chunked = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <UButton
        :loading="chunked.status.value === 'pending'"
        icon="i-lucide-download"
        @click="chunked.download('/download/chunked')"
      >
        开始下载
      </UButton>
      <UBadge :color="STATUS[chunked.status.value].color" variant="subtle">
        {{ chunked.progress.value === null ? '不确定' : `${chunked.progress.value}%` }}
        · {{ STATUS[chunked.status.value].label }}
      </UBadge>
    </div>
    <UProgress :model-value="chunked.progress.value ?? undefined" :max="100" />
  </div>
</template>
