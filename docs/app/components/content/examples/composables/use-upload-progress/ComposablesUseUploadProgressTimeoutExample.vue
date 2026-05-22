<script setup lang="ts">
const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

const timeout = useUploadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <UButton
      color="neutral"
      :disabled="!selected.length"
      icon="i-lucide-timer"
      @click="timeout.upload('/upload?slow=2000', selected, { timeoutMs: 500 })"
    >
      模拟超时
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ timeout.status.value }}
      <span v-if="timeout.error.value"> · {{ timeout.error.value.message }}</span>
    </p>
    <p class="text-xs text-muted">
      <code>timeoutMs: 500</code> + 服务端延迟 2s：触发 <code>xhr.ontimeout</code>，<code>error.message</code> 提示超时毫秒。
    </p>
  </div>
</template>
