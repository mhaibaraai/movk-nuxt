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

const { $api } = useNuxtApp()

const file = ref<File | null>(null)
const files = ref<File[]>([])
const loading = ref(false)
const multipleLoading = ref(false)
const downloadLoading = ref(false)
const downloadCustomNameLoading = ref(false)

async function uploadFile() {
  if (!file.value) return

  loading.value = true
  await $api.upload('/api/system/files/upload', file.value, {
    toast: {
      successMessage: '文件上传成功!',
      errorMessage: '文件上传失败,请重试'
    }
  })
  loading.value = false
}

async function uploadMultipleFiles() {
  if (!files.value.length) return

  multipleLoading.value = true
  await $api.upload('/api/system/files/upload/batch', files.value, {
    fieldName: 'files',
    toast: {
      successMessage: `成功上传 ${files.value.length} 个文件!`
    }
  })
  multipleLoading.value = false
}

async function downloadFile() {
  downloadLoading.value = true
  await $api.download('/api/system/files/download/b8f3e133-2ac6-4931-9286-bb86527041a0')
  downloadLoading.value = false
}

async function downloadWithCustomName() {
  downloadCustomNameLoading.value = true
  await $api.download('/api/system/files/download/b8f3e133-2ac6-4931-9286-bb86527041a0', 'custom-name.png', {
    toast: {
      successMessage: '文件已保存到下载目录'
    }
  })
  downloadCustomNameLoading.value = false
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
      <UButton
        class="mt-2"
        :disabled="!file"
        :loading="loading"
        @click="uploadFile"
      >
        上传文件
      </UButton>
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
        :loading="multipleLoading"
        @click="uploadMultipleFiles"
      >
        上传多个文件 ({{ files.length }})
      </UButton>
    </UPageCard>

    <UPageCard title="下载文件">
      <UButton :loading="downloadLoading" color="primary" @click="downloadFile">
        下载文件 (自动命名)
      </UButton>
    </UPageCard>

    <UPageCard title="下载文件 (自定义命名)">
      <UButton :loading="downloadCustomNameLoading" color="primary" @click="downloadWithCustomName">
        下载文件 (自定义命名)
      </UButton>
    </UPageCard>
  </UPageGrid>
</template>
