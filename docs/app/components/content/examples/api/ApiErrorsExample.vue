<script setup lang="ts">
import type { ApiError } from '@movk/nuxt'
import type { FetchError } from 'ofetch'

const props = defineProps<{
  mode: 'business' | 'http-400' | 'http-422' | 'http-500' | 'network'
}>()

const urlMap: Record<typeof props.mode, string> = {
  'business': '/demo/errors?type=business',
  'http-400': '/profile?fail=1',
  'http-422': '/demo/errors?type=422',
  'http-500': '/demo/errors?type=500',
  'network': '/demo/errors?type=network'
}

const { error, execute } = useApiFetch(() => urlMap[props.mode], {
  immediate: false,
  toast: false
})

const info = computed(() => {
  const err = error.value
  if (!err) return null
  const apiErr = err as Partial<ApiError>
  const fetchErr = err as FetchError
  return {
    kind: apiErr.isBusinessError ? 'ApiError（业务错误）' : 'FetchError',
    statusCode: apiErr.statusCode ?? fetchErr.statusCode ?? null,
    message: err.message,
    isBusinessError: apiErr.isBusinessError ?? false,
    data: fetchErr.data ?? null
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" color="error" variant="outline" icon="i-lucide-circle-alert" @click="execute()">
      触发 {{ mode }}
    </UButton>
    <p class="text-xs text-muted">
      模块只产出 <code>ApiError</code>（业务错误）一种自定义错误，其余均为 ofetch 原生 <code>FetchError</code>；通过 <code>isBusinessError</code> 与 <code>statusCode</code> 区分场景。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ info }}</pre>
  </div>
</template>
