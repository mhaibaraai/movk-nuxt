<script setup lang="ts">
const open = ref(false)
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton label="删除记录" color="warning" variant="outline" icon="i-lucide-trash-2" @click="open = true" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-model:open="open"
      mode="confirm"
      type="warning"
      title="确认删除"
      icon="i-lucide-trash-2"
      description="此操作将永久删除该记录，无法恢复，是否继续？"
      :confirm-button="{ color: 'error', label: '确认删除' }"
      @close="(ok) => result = ok ? '已确认删除' : '已取消操作'"
    />
  </div>
</template>
