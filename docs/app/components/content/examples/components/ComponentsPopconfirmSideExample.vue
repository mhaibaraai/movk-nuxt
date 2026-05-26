<script setup lang="ts">
type Side = 'top' | 'bottom' | 'left' | 'right'

const sides: Side[] = ['top', 'bottom', 'left', 'right']
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <MPopconfirm
      v-for="side in sides"
      :key="side"
      :content="{ side }"
      :title="`从 ${side} 方弹出`"
      description="透传 Popover 定位参数，支持 top / bottom / left / right。"
      :on-confirm="() => { result = `已从 ${side} 方确认` }"
    >
      <UButton color="neutral" variant="outline" size="sm" :label="side" />
    </MPopconfirm>

    <span v-if="result" class="ml-2 text-sm text-muted">{{ result }}</span>
  </div>
</template>
