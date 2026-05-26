<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <MPopconfirm
      v-for="t in types"
      :key="t"
      :type="t"
      :title="`${t} 语义确认`"
      description="确认或取消都会关闭弹层并触发对应事件。"
      :on-confirm="() => { result = `${t} confirmed` }"
      @cancel="result = `${t} cancelled`"
    >
      <UButton :color="t === 'primary' ? 'primary' : t" variant="soft" size="sm">
        {{ t }}
      </UButton>
    </MPopconfirm>
    <span v-if="result" class="ml-2 text-sm text-muted">{{ result }}</span>
  </div>
</template>
