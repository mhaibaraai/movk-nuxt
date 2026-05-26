<script setup lang="ts">
const { alert, confirm } = useMessageBox()
const alertResult = ref('')
const confirmResult = ref('')

async function showAlert() {
  await alert({
    type: 'success',
    title: '操作成功',
    description: '数据已成功提交，await 会等待弹窗关闭后继续执行。'
  })
  alertResult.value = 'await 后的逻辑已执行'
}

async function showConfirm() {
  const ok = await confirm({
    type: 'error',
    title: '清空数据',
    description: '即将清空所有本地缓存，此操作不可撤销。',
    icon: 'i-lucide-database-zap',
    confirmButton: { color: 'error', label: '确认清空' },
    cancelButton: { label: '我再想想' }
  })
  confirmResult.value = ok ? '数据已清空' : '操作已取消'
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <UButton color="success" variant="soft" label="alert()" icon="i-lucide-bell" @click="showAlert" />
        <span v-if="alertResult" class="text-sm text-muted">{{ alertResult }}</span>
      </div>
      <div class="flex items-center gap-3">
        <UButton color="error" variant="outline" label="confirm()" icon="i-lucide-database-zap" @click="showConfirm" />
        <span v-if="confirmResult" class="text-sm text-muted">{{ confirmResult }}</span>
      </div>
    </div>
  </div>
</template>
