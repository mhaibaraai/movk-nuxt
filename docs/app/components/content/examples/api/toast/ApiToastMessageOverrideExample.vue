<script setup lang="ts">
const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const overrideMessage = useApiFetch(target, {
  immediate: false,
  toast: { successMessage: '加载成功 ✓', errorMessage: '加载失败 ✗' }
})

const display = computed(() => overrideMessage.error.value
  ? { error: overrideMessage.error.value.message }
  : overrideMessage.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="overrideMessage.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>successMessage</code> / <code>errorMessage</code> 替换默认文案。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
