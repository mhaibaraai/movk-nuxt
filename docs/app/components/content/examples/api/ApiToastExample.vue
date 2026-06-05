<script setup lang="ts">
const props = defineProps<{
  mode: 'default' | 'silent' | 'message' | 'error-only' | 'custom'
}>()

const fail = ref(false)
const target = () => `/profile${fail.value ? '?fail=1' : ''}`

const fetchers = {
  'default': useApiFetch(target, { key: 'toast-default', immediate: false }),
  'silent': useApiFetch(target, { key: 'toast-silent', immediate: false, toast: false }),
  'message': useApiFetch(target, {
    key: 'toast-message',
    immediate: false,
    toast: { successMessage: '加载成功 ✓', errorMessage: '加载失败 ✗' }
  }),
  'error-only': useApiFetch(target, { key: 'toast-error-only', immediate: false, toast: { success: false } }),
  'custom': useApiFetch(target, {
    key: 'toast-custom',
    immediate: false,
    toast: {
      success: { color: 'secondary', icon: 'i-lucide-sparkles' },
      error: { color: 'warning', icon: 'i-lucide-triangle-alert' }
    }
  })
}

const active = computed(() => fetchers[props.mode])

const hints: Record<typeof props.mode, string> = {
  'default': '未传 toast 时继承全局配置，成功 / 错误均按默认样式弹出。',
  'silent': 'toast: false 关闭所有单次提示。',
  'message': 'successMessage / errorMessage 替换默认文案。',
  'error-only': '{ success: false } 关闭成功提示但保留错误提示。',
  'custom': '为成功 / 错误分别覆盖 color、icon 等 ToastProps。'
}

const display = computed(() => active.value.error.value
  ? { error: active.value.error.value.message }
  : active.value.data.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 flex-wrap">
      <USwitch v-model="fail" label="注入错误（验证错误分支）" />
      <UButton size="sm" variant="outline" icon="i-lucide-send" @click="active.execute()">
        触发请求
      </UButton>
    </div>
    <p class="text-xs text-muted">
      {{ hints[mode] }}
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ display }}</pre>
  </div>
</template>
