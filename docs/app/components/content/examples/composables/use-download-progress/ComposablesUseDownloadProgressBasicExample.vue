<script setup lang="ts">
const props = defineProps<{
  source: 'large' | 'chunked'
}>()

const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '传输中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const { progress, status, error, download, abort } = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <UButton
        :loading="status === 'pending'"
        icon="i-lucide-download"
        @click="download(`/download/${props.source}`)"
      >
        开始下载
      </UButton>
      <UButton
        v-if="status === 'pending'"
        color="error"
        variant="soft"
        icon="i-lucide-x"
        @click="abort"
      >
        中止
      </UButton>
      <UBadge :color="STATUS[status].color" variant="subtle">
        {{ progress === null ? '不确定' : `${progress}%` }} · {{ STATUS[status].label }}
      </UBadge>
    </div>
    <UProgress :model-value="progress ?? undefined" :max="100" />
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="error.message"
    />
  </div>
</template>
