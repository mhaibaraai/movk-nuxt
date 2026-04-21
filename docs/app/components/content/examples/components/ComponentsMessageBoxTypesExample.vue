<script setup lang="ts">
type MessageBoxType = 'primary' | 'info' | 'success' | 'warning' | 'error'

const { alert } = useMessageBox()
const lastClosed = ref('')

const types: Array<{ type: MessageBoxType, color: MessageBoxType, label: string }> = [
  { type: 'primary', color: 'primary', label: 'Primary' },
  { type: 'info', color: 'info', label: 'Info' },
  { type: 'success', color: 'success', label: 'Success' },
  { type: 'warning', color: 'warning', label: 'Warning' },
  { type: 'error', color: 'error', label: 'Error' }
]

async function showType(type: MessageBoxType) {
  await alert({
    type,
    title: `${type} 提示`,
    description: `这是一条 ${type} 类型的消息提示。`
  })

  lastClosed.value = `${type} 示例已关闭`
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="item in types"
        :key="item.type"
        :color="item.color"
        variant="soft"
        :label="item.label"
        @click="showType(item.type)"
      />
    </div>

    <p v-if="lastClosed" class="text-sm text-muted">
      {{ lastClosed }}
    </p>
  </div>
</template>
