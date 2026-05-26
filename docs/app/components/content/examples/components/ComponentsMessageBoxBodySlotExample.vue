<template>
  <MMessageBox
    mode="confirm"
    type="primary"
    title="服务条款更新"
  >
    <UButton color="primary" variant="soft" icon="i-lucide-file-text" label="阅读条款" />
    <template #body="{ close }">
      <p class="text-sm text-muted">
        我们对服务条款进行了以下更新，请仔细阅读：
      </p>
      <ul class="mt-2 space-y-1 text-sm list-disc list-inside text-muted">
        <li>数据收集范围已缩减</li>
        <li>用户隐私保护条款已加强</li>
        <li>退款政策已更新</li>
      </ul>
      <UButton
        class="mt-3"
        size="xs"
        variant="ghost"
        color="neutral"
        label="先取消，稍后阅读"
        @click="close"
      />
    </template>
  </MMessageBox>
</template>
