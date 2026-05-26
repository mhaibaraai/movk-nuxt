<script setup lang="ts">
const toast = useToast()
const email = ref('user@example.com')

function handleClear() {
  toast.add({
    title: '已清除',
    description: '输入内容已清空',
    color: 'neutral'
  })
}
</script>

<template>
  <MWithFloatingLabel v-model="email" label="邮箱地址" leading-icon="i-lucide-mail" @clear="handleClear" />
</template>
