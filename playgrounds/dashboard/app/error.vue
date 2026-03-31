<script setup lang="ts">
import appConfig from './app.config'
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: '页面未找到',
  description: '抱歉，您访问的页面不存在。'
})

useFaviconFromTheme()
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <UError :error="error" />
  </UApp>
</template>
