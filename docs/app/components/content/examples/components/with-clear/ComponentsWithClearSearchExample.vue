<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const searchQuery = ref('')

watch(searchQuery, (value) => {
  console.log('搜索:', value)
})
</script>

<template>
  <MWithClear
    v-model="searchQuery"
    placeholder="搜索..."
    :size
    :leading-icon
  />
</template>
