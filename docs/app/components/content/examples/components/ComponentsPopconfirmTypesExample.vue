<script setup lang="ts">
import type { SemanticColor } from '#movk/types'

const types: SemanticColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error']
const selected = ref<SemanticColor>('neutral')
const result = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="type in types"
        :key="type"
        size="xs"
        :color="type"
        :variant="selected === type ? 'solid' : 'outline'"
        :label="type"
        @click="selected = type"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <MPopconfirm
        :type="selected"
        :title="`${selected} 确认`"
        :description="`这是一条 ${selected} 类型的确认气泡，图标和颜色随类型变化。`"
        :on-confirm="() => { result = '已确认' }"
        @cancel="result = '已取消'"
      >
        <UButton :color="selected" variant="soft" label="打开确认框" icon="i-lucide-message-square" />
      </MPopconfirm>

      <span v-if="result" class="text-sm text-muted">{{ result }}</span>
    </div>
  </div>
</template>
