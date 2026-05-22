<script setup lang="ts">
const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

const basic = useUploadWithProgress<{ files: Array<{ name: string, size: number }> }>()

function tip(s: string, e: { message: string } | null): string {
  if (s === 'pending') return '上传中'
  if (s === 'aborted') return '已取消'
  if (s === 'error') return e?.message || '失败'
  if (s === 'success') return '完成'
  return '空闲'
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <div class="flex gap-2">
      <UButton
        :loading="basic.status.value === 'pending'"
        :disabled="!selected.length"
        icon="i-lucide-upload"
        @click="basic.upload('/upload', selected, { fieldName: 'files' })"
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
    </div>
    <UProgress :model-value="basic.progress.value ?? undefined" :max="100" />
    <p class="text-xs text-muted">
      {{ basic.progress.value ?? 0 }}% · {{ tip(basic.status.value, basic.error.value) }}
    </p>
    <pre v-if="basic.data.value" class="text-xs bg-elevated/30 rounded p-3 overflow-auto">{{ basic.data.value }}</pre>
  </div>
</template>
