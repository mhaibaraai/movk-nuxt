<script setup lang="ts">
const businessErr = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      color="warning"
      icon="i-lucide-shield-alert"
      @click="businessErr.download('/download/error')"
    >
      触发业务错误
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ businessErr.status.value }}
      <span v-if="businessErr.error.value"> · {{ businessErr.error.value.message }}</span>
    </p>
    <p class="text-xs text-muted">
      GET <code>/download/error</code> 返回 <code>application/json</code> + <code>code: 40301</code>，走业务校验链路；不会把错误信封写成文件。
    </p>
  </div>
</template>
