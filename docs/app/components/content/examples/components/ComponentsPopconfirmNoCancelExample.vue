<script setup lang="ts">
const result = ref('')

function handleConfirm() {
  result.value = '已执行强制操作'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      title="强制确认"
      description="该操作无法取消，只能继续。"
      :cancel-button="false"
      :on-confirm="handleConfirm"
    >
      <UButton color="warning" variant="soft" label="继续执行" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
