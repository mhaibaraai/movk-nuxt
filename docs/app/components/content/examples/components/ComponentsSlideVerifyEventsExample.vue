<script setup lang="ts">
const isVerified = ref(false)
const slideVerifyRef = useTemplateRef('slideVerifyRef')
const toast = useToast()

function handleSuccess() {
  toast.add({
    title: '验证成功',
    description: '已触发 success 事件',
    color: 'success'
  })
}

function handleDragEnd(success: boolean) {
  if (!success) {
    toast.add({
      title: '验证失败',
      description: '请继续滑动',
      color: 'neutral'
    })
  }
}

function handleReset() {
  slideVerifyRef.value?.reset()
  toast.add({
    title: '已重置',
    color: 'neutral'
  })
}
</script>

<template>
  <div class="w-sm flex gap-4">
    <MSlideVerify
      ref="slideVerifyRef"
      v-model="isVerified"
      class="flex-1"
      @success="handleSuccess"
      @drag-end="handleDragEnd"
    />
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
      @click="handleReset"
    >
      重置验证
    </UButton>
  </div>
</template>
