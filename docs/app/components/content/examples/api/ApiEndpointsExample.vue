<script setup lang="ts">
const props = defineProps<{
  endpoint: 'default' | 'v2'
}>()

const { $api } = useNuxtApp()
const publicConfig = useRuntimeConfig().public.movkApi

const data = ref<unknown>(null)
const pending = ref(false)
const error = ref<string | null>(null)

const baseURL = computed(() => publicConfig.endpoints?.[props.endpoint]?.baseURL)

async function load() {
  pending.value = true
  error.value = null
  try {
    data.value = await $api.use(props.endpoint)('/profile')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    pending.value = false
  }
}

watch(() => props.endpoint, load, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2 flex-wrap">
      <UBadge :color="endpoint === 'v2' ? 'secondary' : 'neutral'" variant="subtle">
        baseURL: {{ baseURL }}
      </UBadge>
      <UButton size="sm" variant="outline" icon="i-lucide-refresh-cw" :loading="pending" @click="load">
        刷新
      </UButton>
    </div>
    <p class="text-xs text-muted">
      $api 默认走 default 端点的 baseURL，$api.use(name) 切换到别名端点后请求改用对应 baseURL。
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ error ? { error } : data }}</pre>
  </div>
</template>
