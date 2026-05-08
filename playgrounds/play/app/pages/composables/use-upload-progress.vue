<script setup lang="ts">
import { formatBytes } from '../../utils'

const { progress, uploading, data, error, upload, abort } = useUploadWithProgress()
const inputRef = ref<HTMLInputElement | null>(null)
const selected = ref<File[]>([])

function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

async function start() {
  if (!selected.value.length) return
  await upload('/api/upload', selected.value, {
    fieldName: 'files',
    toast: false
  })
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase title="选择文件" description="支持多文件，调用 POST /api/upload">
        <div class="flex items-center gap-2 flex-wrap">
          <input ref="inputRef" type="file" multiple class="text-sm" @change="onChange">
          <UButton :loading="uploading" :disabled="!selected.length" icon="i-lucide-upload" @click="start">
            开始上传
          </UButton>
          <UButton v-if="uploading" color="error" variant="soft" icon="i-lucide-x" @click="abort">
            中止
          </UButton>
        </div>

        <UProgress :model-value="progress" :max="100" :color="uploading ? 'primary' : (error ? 'error' : 'success')" />
        <p class="text-sm text-muted">
          {{ progress }}% · {{ uploading ? '上传中' : (error ? error.message : '空闲') }}
        </p>
      </Showcase>

      <Showcase title="已选文件" :description="`共 ${selected.length} 个`">
        <ul class="text-sm flex flex-col gap-1">
          <li v-for="f in selected" :key="f.name" class="flex justify-between gap-3">
            <span class="truncate">{{ f.name }}</span>
            <span class="text-muted shrink-0">{{ formatBytes(f.size) }}</span>
          </li>
        </ul>
      </Showcase>
    </div>

    <StateViewer :state="data" label="服务器响应" />
  </div>
</template>
