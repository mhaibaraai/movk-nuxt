<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '传输中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const postExport = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <UButton
        :loading="postExport.status.value === 'pending'"
        icon="i-lucide-package"
        @click="postExport.download('/download/large', {
          method: 'POST',
          body: { ids: [1, 2, 3] }
        })"
      >
        POST 导出
      </UButton>
      <UBadge :color="STATUS[postExport.status.value].color" variant="subtle">
        {{ STATUS[postExport.status.value].label }}
      </UBadge>
    </div>
    <UAlert
      v-if="postExport.error.value"
      color="error"
      variant="subtle"
      :description="postExport.error.value.message"
    />
  </div>
</template>
