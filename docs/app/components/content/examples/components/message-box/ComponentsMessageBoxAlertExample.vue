<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

defineProps<{
  type: SemanticColor
}>()

const open = ref(false)
const result = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton label="打开提示" :color="type" @click="open = true" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>

    <MMessageBox
      v-model:open="open"
      :type
      title="保存成功"
      description="当前更改已成功保存。"
      @close="result = '提示已关闭'"
    />
  </div>
</template>
