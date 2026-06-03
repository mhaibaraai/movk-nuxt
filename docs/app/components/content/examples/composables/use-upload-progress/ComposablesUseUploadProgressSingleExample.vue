<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '上传中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const selected = ref<File | null>(null)
const single = useUploadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFileUpload v-model="selected" label="选择单个文件" />
    <div class="flex items-center gap-2">
      <UButton
        :loading="single.status.value === 'pending'"
        :disabled="!selected"
        icon="i-lucide-upload-cloud"
        @click="single.upload('/upload', selected!, {
          fields: { folder: 'avatars', visibility: 'private' }
        })"
      >
        上传文件（携带 fields）
      </UButton>
      <UBadge :color="STATUS[single.status.value].color" variant="subtle">
        {{ single.progress.value ?? 0 }}% · {{ STATUS[single.status.value].label }}
      </UBadge>
    </div>
    <UAlert
      v-if="single.error.value"
      color="error"
      variant="subtle"
      :description="single.error.value.message"
    />
    <UCard v-if="single.data.value">
      <pre class="text-xs overflow-auto">{{ single.data.value }}</pre>
    </UCard>
  </div>
</template>
