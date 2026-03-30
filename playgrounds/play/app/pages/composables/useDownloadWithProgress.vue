<script setup lang="ts">
const { progress, downloading, download, abort } = useDownloadWithProgress()

const downloadUrl = ref('/api/system/files/download/b8f3e133-2ac6-4931-9286-bb86527041a0')
const customFilename = ref('')

async function handleDownload() {
  await download(downloadUrl.value, {
    filename: customFilename.value || undefined,
    onSuccess: (filename) => {
      console.log('下载成功:', filename)
    },
    onError: (err) => {
      console.error('下载失败:', err)
    }
  })
}

function handleAbort() {
  abort()
}
</script>

<template>
  <UContainer class="py-8 space-y-4">
    <UPageCard title="下载配置">
      <div class="space-y-4">
        <UFormField label="下载 URL">
          <UInput
            v-model="downloadUrl"
          />
        </UFormField>

        <UFormField
          label="自定义文件名"
          help="留空则从响应头提取"
        >
          <UInput
            v-model="customFilename"
          />
        </UFormField>
      </div>
    </UPageCard>

    <UPageCard title="带进度监控的下载">
      <div class="space-y-4">
        <div class="flex gap-2">
          <UButton
            :loading="downloading"
            @click="handleDownload"
          >
            开始下载
          </UButton>
          <UButton
            color="error"
            :disabled="!downloading"
            @click="handleAbort"
          >
            取消下载
          </UButton>
        </div>

        <div v-if="downloading || progress > 0">
          <UProgress :model-value="progress" :max="100" />

          <div class="flex justify-between text-sm text-gray-500 mb-2">
            <span>下载进度</span>
            <span>{{ progress }}%</span>
          </div>
        </div>
      </div>
    </UPageCard>
  </UContainer>
</template>
