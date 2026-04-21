<script lang="ts" setup>
const { alert, confirm } = useMessageBox()

const alertResult = ref<string>('')
const confirmResult = ref<string>('')
const programmaticResult = ref<string>('')

async function showAlert(type: 'primary' | 'info' | 'success' | 'warning' | 'error') {
  await alert({
    type,
    title: `${type} 提示`,
    closeIcon: 'i-lucide-arrow-right',
    ui: {
      footer: 'justify-start'
    },
    description: `这是一条 ${type} 类型的通知消息。`
  })
  alertResult.value = `${type} 弹窗已关闭`
}

async function showConfirm() {
  const confirmed = await confirm({
    type: 'warning',
    title: '确认删除',
    description: '此操作将永久删除该记录，无法恢复，是否继续？'
  })
  confirmResult.value = confirmed ? '用户点击了确认' : '用户点击了取消'
}

async function showProgrammatic() {
  const ok = await confirm({
    type: 'error',
    title: '清空数据',
    description: '即将清空所有本地缓存，此操作不可撤销。',
    confirmButton: { color: 'error', label: '确认清空' }
  })
  programmaticResult.value = ok ? '数据已清空' : '操作已取消'
}
</script>

<template>
  <Navbar />
  <Matrix title="消息框" description="`MMessageBox` 组件与 `useMessageBox()` 编程式用法。">
    <div class="grid gap-8">
      <UFormField label="Alert 模式（五种 type）">
        <div class="flex flex-wrap gap-2">
          <UButton color="primary" variant="soft" label="Primary" @click="showAlert('primary')" />
          <UButton color="info" variant="soft" label="Info" @click="showAlert('info')" />
          <UButton color="success" variant="soft" label="Success" @click="showAlert('success')" />
          <UButton color="warning" variant="soft" label="Warning" @click="showAlert('warning')" />
          <UButton color="error" variant="soft" label="Error" @click="showAlert('error')" />
        </div>
        <p v-if="alertResult" class="mt-2 text-sm text-muted">
          {{ alertResult }}
        </p>
      </UFormField>

      <UFormField label="Confirm 模式">
        <div class="flex items-center gap-4">
          <UButton color="warning" variant="outline" label="删除记录" @click="showConfirm" />
          <span v-if="confirmResult" class="text-sm text-muted">{{ confirmResult }}</span>
        </div>
      </UFormField>

      <UFormField label="编程式 useMessageBox()">
        <div class="flex items-center gap-4">
          <UButton color="error" variant="outline" label="清空数据" @click="showProgrammatic" />
          <span v-if="programmaticResult" class="text-sm text-muted">{{ programmaticResult }}</span>
        </div>
      </UFormField>
    </div>
  </Matrix>
</template>
