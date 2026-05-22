<script setup lang="ts">
const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const silent = useApiFetch(target, { immediate: false, toast: false })

const display = computed(() => silent.error.value
  ? { error: silent.error.value.message }
  : silent.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="silent.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      <code>toast: false</code> 关闭所有单次提示；成功 / 失败均不弹 Toast。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
