<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex gap-2">
    <MMessageBox
      mode="alert"
      type="info"
      title="服务公告"
      description="alertConfirmLabel 控制 alert 模式按钮文案。"
      alert-confirm-label="我已知晓"
      @close="(ok: boolean) => result = `alertLabel → ${ok}`"
    >
      <UButton variant="outline" label="alert 文案" />
    </MMessageBox>
    <MMessageBox
      mode="confirm"
      type="primary"
      title="确认接受服务协议"
      description="confirmLabel 与 cancelLabel 同时改写。"
      confirm-label="我同意"
      cancel-label="再想想"
      @close="(ok: boolean) => result = `label → ${ok}`"
    >
      <UButton variant="outline" label="confirm 文案" />
    </MMessageBox>
    <span v-if="result" class="self-center text-sm text-muted">{{ result }}</span>
  </div>
</template>
