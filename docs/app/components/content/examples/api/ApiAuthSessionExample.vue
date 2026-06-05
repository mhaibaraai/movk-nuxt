<script setup lang="ts">
const { session, loggedIn, fetch: refreshSession } = useUserSession()
const { $api } = useNuxtApp()
const publicConfig = useRuntimeConfig().public.movkApi

const loginPending = ref(false)
const logoutPending = ref(false)

async function login() {
  loginPending.value = true
  try {
    await $api('/demo/login', { method: 'POST' })
    await refreshSession()
  }
  finally {
    loginPending.value = false
  }
}

async function logout() {
  logoutPending.value = true
  try {
    await $api('/demo/logout', { method: 'POST' })
    await refreshSession()
  }
  finally {
    logoutPending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2 flex-wrap">
      <UBadge :color="loggedIn ? 'success' : 'neutral'" variant="subtle">
        {{ loggedIn ? '已登录' : '未登录' }}
      </UBadge>
      <UButton
        v-if="!loggedIn"
        size="sm"
        :loading="loginPending"
        icon="i-lucide-log-in"
        @click="login"
      >
        登录（写入 session.token）
      </UButton>
      <UButton
        v-else
        size="sm"
        color="error"
        variant="outline"
        :loading="logoutPending"
        icon="i-lucide-log-out"
        @click="logout"
      >
        登出（清除 session）
      </UButton>
    </div>
    <p class="text-xs text-muted">
      sessionTokenPath: {{ publicConfig.auth?.sessionTokenPath }}
    </p>
    <pre class="text-xs p-3 rounded bg-elevated overflow-auto">{{ session }}</pre>
  </div>
</template>
