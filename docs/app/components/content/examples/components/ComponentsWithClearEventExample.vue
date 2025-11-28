<script setup lang="ts">
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
    @clear="handleClear"
  />
</template>
