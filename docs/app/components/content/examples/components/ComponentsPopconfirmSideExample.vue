<script setup lang="ts">
const result = ref('')

function handleConfirm() {
  result.value = '已从上方确认'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      :content="{ side: 'top' }"
      title="从上方弹出"
      description="这里演示了对 Popover 定位参数的直接透传。"
      :on-confirm="handleConfirm"
    >
      <UButton color="neutral" variant="outline" label="向上弹出" icon="i-lucide-arrow-up" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
