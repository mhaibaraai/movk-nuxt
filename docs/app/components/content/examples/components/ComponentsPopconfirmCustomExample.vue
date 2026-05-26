<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      type="error"
      title="永久删除？"
      description="此操作不可撤销，数据将永久丢失。"
      icon="i-lucide-trash-2"
      :confirm-button="{ color: 'error', label: '确认删除' }"
      :cancel-button="{ label: '取消操作', variant: 'ghost' }"
      :on-confirm="() => { result = '数据已删除' }"
    >
      <UButton color="error" variant="soft" label="危险操作" icon="i-lucide-alert-triangle" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-error">{{ result }}</span>
  </div>
</template>
