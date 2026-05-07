<script setup lang="ts">
const errorMsg = ref('')

const toast = useToast()

async function failingAction() {
  await new Promise(resolve => setTimeout(resolve, 800))
  throw new Error('服务器返回错误：操作被拒绝')
}

function handleError(err: unknown) {
  errorMsg.value = err instanceof Error ? err.message : '未知错误'
  toast.add({
    color: 'error',
    title: '操作失败',
    description: errorMsg.value
  })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <MPopconfirm
        type="error"
        title="模拟操作失败"
        description="确认后将触发一个失败的异步操作，弹层保持打开并上报错误。"
        :on-confirm="failingAction"
        @error="handleError"
      >
        <UButton color="error" variant="soft" label="触发失败操作" icon="i-lucide-zap-off" />
      </MPopconfirm>
    </div>
  </div>
</template>
