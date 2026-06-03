<script setup lang="ts">
const STATUS = {
  idle: { color: 'neutral', label: '空闲' },
  pending: { color: 'info', label: '上传中' },
  success: { color: 'success', label: '完成' },
  error: { color: 'error', label: '失败' },
  aborted: { color: 'warning', label: '已取消' }
} as const

const selected = ref<File[] | null>(null)
const basic = useUploadWithProgress<{ files: Array<{ name: string, size: number }> }>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFileUpload v-model="selected" multiple label="拖拽或点击选择文件" />
    <div class="flex items-center gap-2">
      <UButton
        :loading="basic.status.value === 'pending'"
        :disabled="!selected?.length"
        icon="i-lucide-upload"
        @click="basic.upload('/upload', selected!, { fieldName: 'files' })"
      >
        开始上传
      </UButton>
      <UButton
        v-if="basic.status.value === 'pending'"
        color="error"
        variant="soft"
        icon="i-lucide-x"
        @click="basic.abort"
      >
        中止
      </UButton>
      <UBadge :color="STATUS[basic.status.value].color" variant="subtle">
        {{ basic.progress.value ?? 0 }}% · {{ STATUS[basic.status.value].label }}
      </UBadge>
    </div>
    <UProgress :model-value="basic.progress.value ?? undefined" :max="100" />
    <UAlert
      v-if="basic.error.value"
      color="error"
      variant="subtle"
      :description="basic.error.value.message"
    />
    <UCard v-if="basic.data.value">
      <pre class="text-xs overflow-auto">{{ basic.data.value }}</pre>
    </UCard>
  </div>
</template>
