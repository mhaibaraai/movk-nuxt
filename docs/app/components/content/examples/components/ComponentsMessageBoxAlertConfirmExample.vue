<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex gap-2">
    <MMessageBox
      mode="alert"
      type="info"
      title="通知处理结果"
      description="该模式只显示「知道了」按钮，关闭后返回 true。"
      @close="(ok: boolean) => result = `alert → ${ok}`"
    >
      <UButton variant="soft" label="alert" />
    </MMessageBox>
    <MMessageBox
      mode="confirm"
      type="warning"
      title="确认提交变更"
      description="点击确认返回 true，点击取消返回 false。"
      @close="(ok: boolean) => result = `confirm → ${ok}`"
    >
      <UButton label="confirm" />
    </MMessageBox>
    <span v-if="result" class="self-center text-sm text-muted">{{ result }}</span>
  </div>
</template>
