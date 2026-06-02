<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '上传中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const selected = ref<File[] | null>(null)
const timeout = useUploadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFileUpload v-model="selected" multiple label="选择文件后模拟超时" />
    <div class="flex items-center gap-2">
      <UButton
        color="neutral"
        :loading="timeout.status.value === 'pending'"
        :disabled="!selected?.length"
        icon="i-lucide-timer"
        @click="timeout.upload('/upload?slow=2000', selected!, { timeoutMs: 500 })"
      >
        模拟超时
      </UButton>
      <UBadge :color="STATUS[timeout.status.value].color" variant="subtle">
        {{ STATUS[timeout.status.value].label }}
      </UBadge>
    </div>
    <UAlert
      v-if="timeout.error.value"
      color="error"
      variant="subtle"
      :description="timeout.error.value.message"
    />
  </div>
</template>
