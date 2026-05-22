<script setup lang="ts">
const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const customStyle = useApiFetch(target, {
  immediate: false,
  toast: {
    success: { color: 'secondary', icon: 'i-lucide-sparkles' },
    error: { color: 'warning', icon: 'i-lucide-triangle-alert' }
  }
})

const display = computed(() => customStyle.error.value
  ? { error: customStyle.error.value.message }
  : customStyle.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="customStyle.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      为成功 / 错误分别覆盖 <code>color</code>、<code>icon</code> 等 ToastProps。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
