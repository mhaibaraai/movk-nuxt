<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton color="primary" variant="soft" label="自定义正文" icon="i-lucide-file-text" @click="open = true" />

    <MMessageBox
      v-model:open="open"
      mode="confirm"
      type="primary"
      title="服务条款更新"
    >
      <p class="text-sm text-muted">
        我们对服务条款进行了以下更新，请仔细阅读：
      </p>
      <ul class="mt-2 space-y-1 text-sm list-disc list-inside text-muted">
        <li>数据收集范围已缩减</li>
        <li>用户隐私保护条款已加强</li>
        <li>退款政策已更新</li>
      </ul>
    </MMessageBox>
  </div>
</template>
