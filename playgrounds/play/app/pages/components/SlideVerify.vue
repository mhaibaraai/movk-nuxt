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
      <MSlideVerify ref="slideVerifyRef" v-model="isVerified" :ui="{ root: 'flex-1' }" @success="handleSuccess" />
      <UButton v-if="isVerified" size="sm" color="neutral" variant="outline" @click="handleReset">
        重置
      </UButton>
    </div>

    <MSlideVerify size="xs" text="xs" />
    <MSlideVerify disabled size="sm" text="sm" />
    <MSlideVerify
      text="滑动解锁"
      success-text="解锁成功"
      icon="i-lucide-lock"
      success-icon="i-lucide-lock-open"
    />
    <MSlideVerify :threshold="0.7" size="lg" text="lg" />
    <MSlideVerify size="xl" text="xl" />
  </UCard>
</template>
