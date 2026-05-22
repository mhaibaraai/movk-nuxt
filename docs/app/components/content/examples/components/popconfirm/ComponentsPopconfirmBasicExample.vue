<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      title="确认删除？"
      description="删除后数据将无法恢复。"
      :on-confirm="() => { result = '已确认删除' }"
      @cancel="result = '已取消'"
    >
      <UButton color="neutral" variant="outline" label="删除记录" icon="i-lucide-trash" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
