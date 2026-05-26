<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex gap-2">
    <MMessageBox
      mode="confirm"
      type="error"
      title="严格确认高风险操作"
      description="只能通过取消或确认按钮关闭，Esc 与遮罩点击不会改变打开状态。"
      @close="(ok: boolean) => result = `strict → ${ok}`"
    >
      <UButton color="neutral" variant="outline" label="严格模式" />
    </MMessageBox>
    <MMessageBox
      mode="confirm"
      type="neutral"
      title="允许快速放弃操作"
      description="按 Esc 或点击遮罩会关闭弹窗，并以 false 通知父组件。"
      dismissible
      @close="(ok: boolean) => result = `dismissible → ${ok}`"
    >
      <UButton color="neutral" variant="outline" label="可遮罩关闭" />
    </MMessageBox>
    <span v-if="result" class="self-center text-sm text-muted">{{ result }}</span>
  </div>
</template>
