<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const toast = useToast()
const keyword = ref('关键词')

function handleClear() {
  toast.add({
    title: '已清除',
    description: '输入内容已清空',
    color: 'neutral'
  })
}
</script>

<template>
  <MWithClear
    v-model="keyword"
    :size
    :leading-icon
    @clear="handleClear"
  />
</template>
