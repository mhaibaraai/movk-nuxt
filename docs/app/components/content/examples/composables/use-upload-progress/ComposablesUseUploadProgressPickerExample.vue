<script setup lang="ts">
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <p class="text-xs text-muted">
      原生 <code>&lt;input type="file"&gt;</code> 拿到 <code>File[]</code> 后即可交给 <code>useUploadWithProgress</code>；下方为常见的展示形态。
    </p>
    <ul v-if="selected.length" class="text-sm flex flex-col gap-1">
      <li v-for="f in selected" :key="f.name" class="flex justify-between gap-3">
        <span class="truncate">{{ f.name }}</span>
        <span class="text-muted shrink-0">{{ formatBytes(f.size) }}</span>
      </li>
    </ul>
    <p v-else class="text-xs text-muted">
      （尚未选择文件）
    </p>
  </div>
</template>
