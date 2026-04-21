<script setup lang="ts">
const result = ref('')

function handleConfirm() {
  result.value = '已确认删除'
}

function handleCancel() {
  result.value = '已取消操作'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm :on-confirm="handleConfirm" @cancel="handleCancel">
      <UButton color="neutral" variant="outline" label="删除记录" icon="i-lucide-trash" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
