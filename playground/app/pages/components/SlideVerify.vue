<script setup lang="ts">
const isVerified = ref(false)
const slideVerifyRef = useTemplateRef('slideVerifyRef')
const toast = useToast()

function handleSuccess() {
  toast.add({
    title: '验证成功',
    color: 'success'
  })
}

function handleReset() {
  slideVerifyRef.value?.reset()
}
</script>

<template>
  <UCard class="w-md" :ui="{ body: 'space-y-6' }">
    <div class="flex w-full gap-4">
      <MSlideVerify
        ref="slideVerifyRef"
        v-model="isVerified"
        class="flex-1"
        @success="handleSuccess"
      />

      <UButton
        v-if="isVerified"
        size="sm"
        color="neutral"
        variant="outline"
        @click="handleReset"
      >
        重置
      </UButton>
    </div>

    <MSlideVerify
      text="滑动解锁"
      success-text="解锁成功"
      icon="i-lucide-lock"
      success-icon="i-lucide-unlock"
    />

    <MSlideVerify
      :height="36"
      :slider-width="40"
      text="小尺寸"
    />
    <MSlideVerify
      :height="56"
      :slider-width="60"
      text="大尺寸"
    />

    <MSlideVerify disabled />

    <MSlideVerify :threshold="0.7" />
  </UCard>
</template>
