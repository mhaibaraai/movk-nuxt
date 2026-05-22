<script setup lang="ts">
const httpErr = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      color="error"
      icon="i-lucide-bug"
      @click="httpErr.download('/download/not-exist', { toast: false })"
    >
      触发 404
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ httpErr.status.value }}
      <span v-if="httpErr.error.value"> · {{ httpErr.error.value.message }}</span>
    </p>
    <p class="text-xs text-muted">
      访问不存在的路径，返回 404；<code>error.message</code> 带状态码，<code>error</code> 类型非 <code>ApiError</code>。
    </p>
  </div>
</template>
