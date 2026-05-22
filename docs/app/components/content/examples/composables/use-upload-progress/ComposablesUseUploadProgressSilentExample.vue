<script setup lang="ts">
const selected = ref<File[]>([])
const log = ref<string[]>([])

function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

const silent = useUploadWithProgress()

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 5)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <UButton
      variant="soft"
      :disabled="!selected.length"
      icon="i-lucide-volume-x"
      @click="silent.upload('/upload', selected, {
        toast: false,
        onSuccess: () => record('静默上传完成')
      })"
    >
      静默上传
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ silent.status.value }}
    </p>
    <pre class="text-xs bg-elevated/30 rounded p-3 overflow-auto max-h-32">{{ log }}</pre>
    <p class="text-xs text-muted">
      单次请求 <code>toast: false</code> 关闭成功 / 错误 Toast，仍可通过 <code>onSuccess</code> / <code>onError</code> 自行处理。
    </p>
  </div>
</template>
