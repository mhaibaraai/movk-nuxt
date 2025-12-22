<script setup lang="ts">
const file = ref<File | null>(null)
const uploadUrl = ref('/api/system/files/upload')
const fieldName = ref('file')
const { progress, uploading, upload, abort, data } = useUploadWithProgress()

async function uploadWithProgress() {
  if (!file.value) return

  await upload(uploadUrl.value, file.value, {
    fieldName: fieldName.value,
    toast: {
      successMessage: '上传完成!',
      errorMessage: '上传失败'
    },
    onSuccess: (res) => {
      console.log('Upload success:', res)
    },
    onError: (err) => {
      console.error('Upload error:', err)
    }
  })
}

function cancelUpload() {
  abort()
}
</script>

<template>
  <UContainer class="py-8 space-y-4">
    <UPageCard title="上传配置">
      <div class="space-y-4">
        <UFormField label="上传 URL">
          <UInput
            v-model="uploadUrl"
          />
        </UFormField>

        <UFormField
          label="字段名"
          help="FormData 中的文件字段名"
        >
          <UInput
            v-model="fieldName"
          />
        </UFormField>

        <UFormField label="上传结果">
          {{ data }}
        </UFormField>
      </div>
    </UPageCard>

    <UPageCard title="带进度监控的上传">
      <div class="space-y-4">
        <UFileUpload v-model="file" accept="image/*" class="min-h-32" />

        <div class="flex gap-2">
          <UButton :disabled="!file || uploading" :loading="uploading" @click="uploadWithProgress">
            {{ uploading ? '上传中...' : '上传文件(带进度)' }}
          </UButton>

          <UButton :disabled="!uploading" color="error" @click="cancelUpload">
            取消上传
          </UButton>
        </div>

        <UProgress v-if="uploading || progress > 0" :model-value="progress" :max="100" />

        <p v-if="uploading" class="text-sm text-gray-600">
          上传进度: {{ progress }}%
        </p>
      </div>
    </UPageCard>
  </UContainer>
</template>
