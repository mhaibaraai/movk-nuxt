<script setup lang="ts">
const selected = ref<File | null>(null)
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files?.[0] ?? null
}

const single = useUploadWithProgress()

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
    <input type="file" class="text-sm" @change="onChange">
    <UButton
      :disabled="!selected"
      icon="i-lucide-upload-cloud"
      @click="single.upload('/upload', selected!, {
        fields: { folder: 'avatars', visibility: 'private' }
      })"
    >
      上传文件（携带 fields）
    </UButton>
    <p class="text-xs text-muted">
      {{ single.progress.value ?? 0 }}% · {{ tip(single.status.value, single.error.value) }}
    </p>
    <pre v-if="single.data.value" class="text-xs bg-elevated/30 rounded p-3 overflow-auto">{{ single.data.value }}</pre>
    <p class="text-xs text-muted">
      <code>files</code> 传 <code>File</code>（非数组），<code>fields</code> 注入业务字段一并提交。
    </p>
  </div>
</template>
