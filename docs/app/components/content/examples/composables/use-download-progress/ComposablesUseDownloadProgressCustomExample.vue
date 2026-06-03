<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '传输中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const custom = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <UButton
        :loading="custom.status.value === 'pending'"
        icon="i-lucide-file-down"
        @click="custom.download('/download/large', { filename: 'custom-name.bin' })"
      >
        自定义文件名下载
      </UButton>
      <UBadge :color="STATUS[custom.status.value].color" variant="subtle">
        {{ STATUS[custom.status.value].label }}
      </UBadge>
    </div>
    <UAlert
      v-if="custom.error.value"
      color="error"
      variant="subtle"
      :description="custom.error.value.message"
    />
  </div>
</template>
