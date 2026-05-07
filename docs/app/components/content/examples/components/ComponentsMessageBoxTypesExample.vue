<script setup lang="ts">
import type { SemanticColor } from '#movk/types'

const props = defineProps<{
  type: SemanticColor
  mode: 'alert' | 'confirm'
}>()

const { alert, confirm } = useMessageBox()
const result = ref('')

async function show() {
  result.value = ''
  if (props.mode === 'alert') {
    await alert({
      type: props.type,
      title: `${props.type} 提示`,
      description: `这是一条 ${props.type} 类型的 alert 消息。`
    })
    result.value = '已关闭'
  }
  else {
    const ok = await confirm({
      type: props.type,
      title: `${props.type} 确认`,
      description: `这是一条 ${props.type} 类型的 confirm 对话框，请选择操作。`
    })
    result.value = ok ? '已确认' : '已取消'
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton :color="props.type" variant="soft" :label="`打开 ${props.type} ${props.mode}`" @click="show" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
