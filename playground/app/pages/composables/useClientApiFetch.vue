<script lang="ts" setup>
import type { User } from '#auth-utils'

const userId = '00000000-0000-0000-0000-000000000202'

const { data, execute, pending } = await useClientApiFetch<User>(`/api/system/users/${userId}`, {
  immediate: false,
  toast: {
    successMessage: ` 用户 ${userId} 信息加载成功!`
  },
  onResponse: ({ response }) => {
    console.log('用户信息:', response._data)
  }
})

const file = ref<File | null>(null)
const files = ref<File[]>([])

const {
  progress: uploadProgress,
  uploading,
  upload,
  abort: abortUpload
} = useUploadWithProgress()

const {
  progress: downloadProgress,
  downloading,
  download,
  abort: abortDownload
} = useDownloadWithProgress()

async function uploadFile() {
  if (!file.value) return

  await upload('/api/system/files/upload', file.value, {
    toast: {
      successMessage: '文件上传成功!',
      errorMessage: '文件上传失败,请重试'
    }
  })
}

async function uploadMultipleFiles() {
  if (!files.value.length) return

  await upload('/api/system/files/upload/batch', files.value, {
    fieldName: 'files',
    toast: {
      successMessage: `成功上传 ${files.value.length} 个文件!`
    }
  })
}

async function downloadFile() {
  await download('/api/system/files/download/b8f3e133-2ac6-4931-9286-bb86527041a0')
}

async function downloadWithCustomName() {
  await download('/api/system/files/download/b8f3e133-2ac6-4931-9286-bb86527041a0', {
    filename: 'custom-name.png',
    toast: {
      successMessage: '文件已保存到下载目录'
    }
  })
}
</script>

<template>
  <UPageGrid>
    <UPageCard title="查找 ID 用户">
      <template #description>
        <li>
          昵称： {{ data?.nickname }}
        </li>
        <li>
          邮箱： {{ data?.email }}
        </li>
      </template>
      <template #footer>
        <UButton color="primary" :loading="pending" @click="execute()">
          查找用户
        </UButton>
      </template>
    </UPageCard>

    <UPageCard title="基础上传">
      <UFileUpload v-model="file" accept="image/*" class="min-h-32" />
      <div class="mt-2 space-y-2">
        <UProgress v-if="uploading" :model-value="uploadProgress" :max="100" />
        <div class="flex gap-2">
          <UButton
            :disabled="!file"
            :loading="uploading"
            @click="uploadFile"
          >
            上传文件
          </UButton>
          <UButton
            v-if="uploading"
            color="error"
            @click="abortUpload"
          >
            取消
          </UButton>
        </div>
      </div>
    </UPageCard>

    <UPageCard title="上传多个文件">
      <UFileUpload
        v-model="files"
        accept="image/*"
        multiple
        layout="list"
        class="min-h-32"
      />
      <UButton
        class="mt-2"
        :disabled="!files.length"
        :loading="uploading"
        @click="uploadMultipleFiles"
      >
        上传多个文件 ({{ files.length }})
      </UButton>
    </UPageCard>

    <UPageCard title="下载文件">
      <div class="space-y-2">
        <UProgress v-if="downloading" :model-value="downloadProgress" :max="100" />
        <div class="flex gap-2">
          <UButton :loading="downloading" color="primary" @click="downloadFile">
            下载文件 (自动命名)
          </UButton>
          <UButton
            v-if="downloading"
            color="error"
            @click="abortDownload"
          >
            取消
          </UButton>
        </div>
      </div>
    </UPageCard>

    <UPageCard title="下载文件 (自定义命名)">
      <UButton :loading="downloading" color="primary" @click="downloadWithCustomName">
        下载文件 (自定义命名)
      </UButton>
    </UPageCard>
  </UPageGrid>
</template>
