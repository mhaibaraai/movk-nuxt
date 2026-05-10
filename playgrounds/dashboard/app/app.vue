<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'
import { removeTrailingSlash } from '@movk/core'

const route = useRoute()
const appConfig = useAppConfig()
const site = useSiteConfig()

useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: `${site.url}${removeTrailingSlash(route.path)}` }
  ]
})

useFaviconFromTheme()

const title = 'Movk Nuxt Dashboard'
const description = '基于 Nuxt UI 构建的专业后台管理模板，包含多页面、数据可视化及全面的管理功能，助力快速搭建强大的管理系统。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :locale="zh_cn" :toaster="appConfig.toaster">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
