<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
}>()

const toast = useToast()
const content = ref('这是一段可复制的文本')

function handleCopy(value: string) {
  toast.add({
    title: '已复制',
    description: `复制内容: ${value}`,
    color: 'success'
  })
}
</script>

<template>
  <MWithCopy
    v-model="content"
    :size
    :leading-icon
    @copy="handleCopy"
  />
</template>
