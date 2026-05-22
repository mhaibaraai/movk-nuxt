<script setup lang="ts">
const open = ref(false)
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton color="error" variant="soft" label="自定义按钮" icon="i-lucide-settings-2" @click="open = true" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-model:open="open"
      mode="confirm"
      type="error"
      title="危险操作"
      description="通过 confirmButton 和 cancelButton 可分别覆盖颜色、文案及其他按钮属性。"
      :confirm-button="{ color: 'error', label: '确认执行', icon: 'i-lucide-check' }"
      :cancel-button="{ label: '取消操作', icon: 'i-lucide-x' }"
      @close="(ok) => result = ok ? '已确认' : '已取消'"
    />
  </div>
</template>
