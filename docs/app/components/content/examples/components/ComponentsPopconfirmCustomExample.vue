<script setup lang="ts">
const result = ref('')

function handleConfirm() {
  result.value = '数据已删除'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      title="永久删除？"
      description="删除后将无法恢复，请谨慎操作。"
      icon="i-lucide-trash-2"
      :confirm-button="{ color: 'error', label: '确认删除' }"
      :cancel-button="{ label: '稍后再说' }"
      :on-confirm="handleConfirm"
    >
      <UButton color="error" variant="soft" label="危险操作" icon="i-lucide-alert-triangle" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
