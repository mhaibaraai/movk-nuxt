<script setup lang="ts">
const { progress, downloading, error, download, abort } = useDownloadWithProgress()
const log = ref<string[]>([])

async function start() {
  log.value = []
  const result = await download('/api/download/large', {
    filename: 'movk-demo.bin',
    toast: false,
    onSuccess: (name) => { log.value.unshift(`下载完成: ${name}`) },
    onError: (e) => { log.value.unshift(`失败: ${e.message}`) }
  })
  log.value.unshift(result.success ? 'success=true' : 'success=false')
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
    <Showcase title="下载大文件" description="GET /api/download/large 流式返回 ~5MB">
      <div class="flex gap-2">
        <UButton :loading="downloading" icon="i-lucide-download" @click="start">
          开始下载
        </UButton>
        <UButton v-if="downloading" color="error" variant="soft" icon="i-lucide-x" @click="abort">
          中止
        </UButton>
      </div>

      <UProgress :model-value="progress" :max="100" :color="downloading ? 'primary' : (error ? 'error' : 'success')" />
      <p class="text-sm text-muted">
        {{ progress }}% · {{ downloading ? '下载中' : (error ? error.message : '空闲') }}
      </p>
    </Showcase>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
