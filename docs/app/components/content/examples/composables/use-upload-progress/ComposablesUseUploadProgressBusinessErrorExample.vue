<script setup lang="ts">
const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

const fail = useUploadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <UButton
      color="warning"
      :disabled="!selected.length"
      icon="i-lucide-shield-alert"
      @click="fail.upload('/upload?fail=1', selected)"
    >
      触发业务错误
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ fail.status.value }}
      <span v-if="fail.error.value"> · {{ fail.error.value.message }}</span>
    </p>
    <p class="text-xs text-muted">
      后端返回 <code>code: 40001</code>，走业务校验失败链路：<code>error</code> 为 <code>ApiError</code>，<code>movk:api:error</code> 钩子被派发。
    </p>
  </div>
</template>
