<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

defineProps<{
  type: SemanticColor
}>()

const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MPopconfirm
      :type
      :title="`${type} 确认`"
      :description="`这是一条 ${type} 类型的确认气泡，图标和颜色随类型变化。`"
      :on-confirm="() => { result = '已确认' }"
      @cancel="result = '已取消'"
    >
      <UButton :color="type" variant="soft" label="打开确认框" icon="i-lucide-message-square" />
    </MPopconfirm>

    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
