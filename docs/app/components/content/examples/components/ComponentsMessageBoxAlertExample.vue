<script setup lang="ts">
const open = ref(false)
const result = ref('')

function openAlert() {
  result.value = ''
  open.value = true
}

function handleClose(confirmed: boolean) {
  open.value = false
  result.value = confirmed ? '用户已关闭提示' : '用户通过遮罩或 ESC 关闭了提示'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton label="打开提示" color="primary" @click="openAlert" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-if="open"
      title="保存成功"
      description="当前更改已成功保存。"
      @close="handleClose"
    />
  </div>
</template>
