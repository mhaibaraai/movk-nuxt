<script setup lang="ts">
const custom = useDownloadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      icon="i-lucide-file-down"
      @click="custom.download('/download/large', {
        filename: 'custom-name.bin',
        headers: { 'X-Demo': 'movk' },
        toast: { successMessage: '导出已开始' }
      })"
    >
      自定义下载
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ custom.status.value }}
    </p>
    <p class="text-xs text-muted">
      <code>filename</code> 覆盖响应头；<code>headers</code> 透传到请求；<code>toast.successMessage</code> 替换默认成功文案。
    </p>
  </div>
</template>
