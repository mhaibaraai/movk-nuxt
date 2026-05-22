<script setup lang="ts">
const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

const httpErr = useUploadWithProgress()
</script>

<template>
  <div class="flex flex-col gap-3">
    <input type="file" multiple class="text-sm" @change="onChange">
    <UButton
      color="error"
      :disabled="!selected.length"
      icon="i-lucide-bug"
      @click="httpErr.upload('/upload?http=500', selected)"
    >
      触发 HTTP 500
    </UButton>
    <p class="text-xs text-muted">
      状态：{{ httpErr.status.value }}
      <span v-if="httpErr.error.value"> · {{ httpErr.error.value.message }}</span>
    </p>
    <p class="text-xs text-muted">
      后端 <code>setResponseStatus(500)</code>，<code>error.message</code> 包含 HTTP 状态描述。
    </p>
  </div>
</template>
