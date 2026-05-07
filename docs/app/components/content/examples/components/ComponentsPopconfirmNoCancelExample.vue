<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      type="warning"
      title="强制确认"
      description="此操作无法取消，请确认后继续。"
      :cancel-button="false"
      :on-confirm="() => { result = '操作已执行' }"
    >
      <UButton color="warning" variant="soft" label="强制执行" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-warning">{{ result }}</span>
  </div>
</template>
