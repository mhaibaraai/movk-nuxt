<script setup lang="ts">
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      type="info"
      title="样式定制示例"
      description="通过 ui 属性覆盖内部各区块的 class，实现精细样式控制。"
      :on-confirm="() => { result = '已确认' }"
      :ui="{
        content: 'w-72',
        title: 'text-info text-base',
        description: 'text-xs text-info/70',
        footer: 'justify-between pt-2 border-t border-default'
      }"
      :confirm-button="{ label: '好的，执行', color: 'info' }"
      :cancel-button="{ label: '不了，取消', variant: 'ghost' }"
    >
      <UButton color="info" variant="soft" label="打开定制气泡" icon="i-lucide-palette" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
