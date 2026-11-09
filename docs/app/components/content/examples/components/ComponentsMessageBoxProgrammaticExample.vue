<script setup lang="ts">
const props = defineProps<{
  mode: 'alert' | 'confirm' | 'async'
}>()

const { alert, confirm } = useMessageBox()
const pending = ref(false)
const result = ref('')

async function run() {
  pending.value = true
  try {
    if (props.mode === 'alert') {
      await alert({ title: '保存成功', type: 'success' })
      result.value = '提示已关闭'
      return
    }
    const accepted = await confirm({ title: '是否继续？', type: 'warning' })
    if (!accepted) {
      result.value = '已取消'
      return
    }
    if (props.mode === 'async') {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    result.value = props.mode === 'async' ? '异步任务已完成' : '已确认'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <UButton :loading="pending" label="执行" @click="run" />
    <span class="text-sm text-muted" aria-live="polite">{{ result }}</span>
  </div>
</template>
