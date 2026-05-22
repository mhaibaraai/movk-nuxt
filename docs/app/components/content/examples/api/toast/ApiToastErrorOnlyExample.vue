<script setup lang="ts">
const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const errorOnly = useApiFetch(target, {
  immediate: false,
  toast: { success: false }
})

const display = computed(() => errorOnly.error.value
  ? { error: errorOnly.error.value.message }
  : errorOnly.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="errorOnly.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>{ success: false }</code> 关闭成功提示但保留错误提示。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
