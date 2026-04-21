<script setup lang="ts">
const { confirm } = useMessageBox()
const result = ref('')

async function clearCache() {
  const confirmed = await confirm({
    type: 'error',
    title: '清空缓存',
    description: '即将清空所有本地缓存，此操作不可撤销。',
    confirmButton: {
      color: 'error',
      label: '确认清空'
    }
  })

  result.value = confirmed ? '缓存已清空' : '操作已取消'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <UButton color="error" variant="outline" label="清空缓存" @click="clearCache" />
    <span v-if="result" class="text-sm text-muted">{{ result }}</span>
  </div>
</template>
