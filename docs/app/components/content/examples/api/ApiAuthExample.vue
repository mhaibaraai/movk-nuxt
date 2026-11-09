<script setup lang="ts">
const { $api } = useNuxtApp()
const { loggedIn, fetch: refreshSession } = useUserSession()

const switching = ref(false)
const { data, error, status, execute } = useApiFetch<{ authHeader: string }>('/demo/protected', {
  immediate: false,
  toast: false
})

async function toggleLogin() {
  switching.value = true
  try {
    await $api(loggedIn.value ? '/demo/logout' : '/demo/login', { method: 'POST', toast: false })
    await refreshSession()
  }
  finally {
    switching.value = false
  }
}

const display = computed(() => error.value
  ? { statusCode: error.value.statusCode, message: error.value.message }
  : data.value && { authHeader: data.value.authHeader })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2 flex-wrap">
      <UBadge :color="loggedIn ? 'success' : 'neutral'" variant="subtle">
        {{ loggedIn ? '已登录' : '未登录' }}
      </UBadge>
      <UButton
        size="sm"
        variant="outline"
        :loading="switching"
        :icon="loggedIn ? 'i-lucide-log-out' : 'i-lucide-log-in'"
        @click="toggleLogin"
      >
        {{ loggedIn ? '登出' : '登录（写入 session.token）' }}
      </UButton>
      <UButton size="sm" icon="i-lucide-shield-check" :loading="status === 'pending'" @click="execute()">
        请求 /demo/protected
      </UButton>
    </div>
    <p class="text-xs text-muted">
      已登录时拦截器从 session 读取 token 注入 Authorization 头，后端回显该头；未登录时返回 401。
    </p>
    <pre class="text-xs p-3 rounded bg-soft overflow-auto">{{ display }}</pre>
  </div>
</template>
