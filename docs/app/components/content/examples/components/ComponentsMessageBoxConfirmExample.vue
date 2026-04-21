<script setup lang="ts">
const open = ref(false)
const result = ref('')

function openConfirm() {
  result.value = ''
  open.value = true
}

function handleClose(confirmed: boolean) {
  open.value = false
  result.value = confirmed ? '用户确认了删除操作' : '用户取消了删除操作'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton label="删除记录" color="warning" variant="outline" @click="openConfirm" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-if="open"
      mode="confirm"
      type="warning"
      title="确认删除"
      description="此操作无法撤销，是否继续？"
      :confirm-button="{ label: '确认删除' }"
      @close="handleClose"
    />
  </div>
</template>
