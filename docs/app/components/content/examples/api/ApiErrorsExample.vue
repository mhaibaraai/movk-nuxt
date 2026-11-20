<script setup lang="ts">
const props = defineProps<{
  mode: 'business' | 'http-400' | 'http-422' | 'http-500' | 'network' | 'timeout'
}>()

const urlMap: Record<typeof props.mode, string> = {
  'business': '/demo/errors?type=business',
  'http-400': '/profile?fail=1',
  'http-422': '/demo/errors?type=422',
  'http-500': '/demo/errors?type=500',
  'network': '/demo/errors?type=network',
  'timeout': '/demo/errors?type=slow'
}

const { error, execute } = useApiFetch(() => urlMap[props.mode], {
  immediate: false,
  toast: false,
  retry: 0,
  timeout: 500
})

const info = computed(() => {
  const err = error.value
  if (!err) return null
  return {
    kind: err.data?.kind,
    statusCode: err.statusCode,
    message: err.message,
    code: err.data?.code ?? null,
    response: err.data?.response ?? null
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="execute()">
      触发 {{ mode }}
    </UButton>
    <p class="text-xs text-muted">
      所有失败统一为 <code>ApiError</code>（NuxtError），按 <code>error.data.kind</code> 区分场景。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
