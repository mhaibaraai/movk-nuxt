<script setup lang="ts">
const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const def = useApiFetch(target, { immediate: false })

const display = computed(() => def.error.value
  ? { error: def.error.value.message }
  : def.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误（验证错误分支）" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="def.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      未传 <code>toast</code> 选项时继承全局 Toast 配置，成功 / 错误均按默认样式弹出。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
